import { Response } from "express";
import crypto from "crypto";
import prisma from "../lib/prisma"; 
import { AuthRequest } from "../middlewares/auth.middleware";
import { initializeTransaction, verifyTransaction } from "../lib/paystack";
import { createNotification, notifyAdmins } from "../lib/notifications";
import { emitToAdmin, getIO } from "../lib/socket";
import { sendEmail } from "../lib/email.service";
import { AIRPORT_SERVICES, getUpgradeQuote, isAirportService } from "../lib/pricing";

const UPGRADEABLE_FROM = ["3 Hours", "6 Hours", "10 Hours"];

export const createUpgrade = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, airportService } = req.body;
    const requestedBy = "CUSTOMER";
    if (!isAirportService(airportService))
      return res.status(400).json({ message: "Please choose an airport service" });
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, customerId: req.user!.id },
      include: {
        customer: { select: { email: true, name: true } },
        upgrade: true,
      },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (!["ACCEPTED", "ARRIVED", "IN_PROGRESS"].includes(booking.status)) {
      return res.status(400).json({ message: "Can only upgrade active trips" });
    }
    if (!UPGRADEABLE_FROM.includes(booking.packageType ?? "")) {
      return res.status(400).json({
        message: "Only 3, 6, or 10-hour rides can be upgraded to airport",
      });
    }
         if (booking.upgrade?.paymentStatus === "PAID")
      return res.status(400).json({ message: "This trip has already been upgraded" });
    // an unpaid earlier attempt (bookingId is unique) must not block a retry / different service
    if (booking.upgrade) await prisma.tripUpgrade.delete({ where: { id: booking.upgrade.id } });

    const { fuelTopUpAmount, upgradeAmount, hadFuelAddOn } = await getUpgradeQuote(booking, airportService);
    const currentPrice = booking.totalAmount;
    if (upgradeAmount <= 0)
      return res.status(400).json({ message: "This upgrade isn't available right now. Please contact support." });


    // const prices = await getPackagePrices();
    // const airportPrice = prices["Airport Schedule"];

    // if (!airportPrice)
    //   return res.status(500).json({ message: "Airport price not configured" });

    // if (upgradeAmount <= 0) {
    //   return res.status(400).json({
    //     message:
    //       "No upgrade amount needed - current price exceeds airport rate",
    //   });
    // }

    const paymentRef = `22LOG-UPG-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    const upgrade = await prisma.tripUpgrade.create({
      data: {
        bookingId,
        fromPackage: booking.packageType!,
        toPackage: "Airport Schedule",
        originalAmount: currentPrice,
        upgradeAmount,
        fuelTopUpAmount,
        totalAmount: currentPrice + upgradeAmount,
        paymentRef,
        airportService,
        requestedBy,
      },
    });

    const paystackData = await initializeTransaction(
      booking.customer.email,
      upgradeAmount * 100,
      { upgradeId: upgrade.id, bookingId, type: "UPGRADE" },
      paymentRef,
      ["card"],
    );

    await prisma.tripUpgrade.update({
      where: { id: upgrade.id },
      data: { paystackAccessCode: paystackData.access_code },
    });

    res.status(201).json({
      upgrade,
      fuelDisclaimer: hadFuelAddOn
        ? `Your fuel add-on has been automatically topped up by ₦${fuelTopUpAmount.toLocaleString()} to cover the Airport rate.`
        : null,
      payment: {
        authorizationUrl: paystackData.authorization_url,
        accessCode: paystackData.access_code,
        reference: paymentRef,
      },
    });
  } catch (error) {
    console.error("createUpgrade error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Called by driver to nudge the customer to upgrade
export const requestUpgradeAsDriver = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { bookingId } = req.body;

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, driverId: req.user!.id },
      include: {
        customer: { select: { id: true, email: true, name: true } },
        driver: { select: { name: true } },
        upgrade: true,
      },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (!UPGRADEABLE_FROM.includes(booking.packageType ?? "")) {
      return res
        .status(400)
        .json({ message: "Package not eligible for upgrade" });
    }
    if (booking.upgrade?.paymentStatus === "PAID") {
      return res.status(400).json({ message: "Already upgraded" });
    } 

    // const prices = await getPackagePrices();
    // const FUEL_PRICES = await getFuelPrices();
    // const baseUpgradeAmount = Math.max(
    //   0,
    //   prices["Airport Schedule"] - booking.totalAmount,
    // );

    //  const hadFuelAddOn = booking.addOns?.some((a) =>
    //   a.toLowerCase().includes("fuel"),
    // );
    // const fuelTopUpAmount = hadFuelAddOn
    //   ? Math.max(0, FUEL_PRICES["Airport Schedule"] - (booking.fuelAddOnAmount ?? 0))
    //   : 0;
    // const upgradeAmount = baseUpgradeAmount + fuelTopUpAmount;


        if (!["ACCEPTED", "ARRIVED", "IN_PROGRESS"].includes(booking.status))
      return res.status(400).json({ message: "Can only upgrade active trips" });

    const quotes = await Promise.all(
      AIRPORT_SERVICES.map(async (airportService) => ({ airportService, ...(await getUpgradeQuote(booking, airportService)) })),
    );
    const valid = quotes.filter((q) => q.upgradeAmount > 0).sort((a, b) => a.upgradeAmount - b.upgradeAmount);
    if (!valid.length) return res.status(400).json({ message: "Upgrade pricing isn't configured" });
    const { upgradeAmount, fuelTopUpAmount } = valid[0]; // "from" price

    // Push notification to customer
    getIO().to(`user:${booking.customer.id}`).emit("upgrade:requested", {
      bookingId,
      upgradeAmount,
      // airportPrice: prices["Airport Schedule"],
      quotes: valid,
      driverName: booking.driver?.name,
    });

    await createNotification(
      booking.customer.id,
      "✈️ Airport Upgrade Available",
      `Your driver suggests upgrading to an Airport ride. Difference: ₦${upgradeAmount.toLocaleString()}`,
      "TRIP_UPGRADE_REQUESTED",
      bookingId,
    );

    // Email customer
    sendEmail(
      booking.customer.email,
      `✈️ Airport Ride Upgrade - ${booking.trackingId}`,
      `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:16px">
        <h2 style="color:#0B1B2B">Airport Upgrade Available ✈️</h2>
        <p style="color:#374151">Hi <strong>${booking.customer.name}</strong>, your driver <strong>${booking.driver?.name}</strong> has suggested upgrading your trip to an Airport ride.</p>
        <div style="background:#F9F6F0;border-radius:12px;padding:20px;margin:20px 0;border-left:4px solid #E4C77B">
          <p style="margin:0;color:#6B7280;font-size:13px">Upgrade cost: <strong style="color:#0B1B2B">₦${upgradeAmount.toLocaleString()}</strong></p>
           ${fuelTopUpAmount > 0 ? `<p style="margin:4px 0 0;color:#6B7280;font-size:13px">Includes fuel top-up: <strong style="color:#0B1B2B">₦${fuelTopUpAmount.toLocaleString()}</strong></p>` : ""}
          <p style="margin:4px 0 0;color:#6B7280;font-size:13px">Booking: <strong style="color:#0B1B2B">${booking.trackingId}</strong></p>
        </div>
        <p style="color:#374151;font-size:14px">Open the app to accept and pay for the upgrade.</p>
      </div>
      `,
    );

    // Email admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", isActive: true },
      select: { email: true },
    });
    admins.forEach((a) =>
      sendEmail(
        a.email,
        `✈️ Upgrade Requested - ${booking.trackingId}`,
        `<p>Driver <strong>${booking.driver?.name}</strong> requested an airport upgrade for booking <strong>${booking.trackingId}</strong> (Customer: ${booking.customer.name}). Upgrade amount: ₦${upgradeAmount.toLocaleString()}</p>`,
      ),
    );

    await notifyAdmins(
      "Airport Upgrade Requested",
      `Driver requested upgrade for ${booking.trackingId} - ₦${upgradeAmount.toLocaleString()}`,
      "BOOKING_UPDATED",
      bookingId,
    );

    res.json({ message: "Upgrade request sent to customer", upgradeAmount });
  } catch (error) {
    console.error("requestUpgradeAsDriver error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const verifyUpgradePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { reference } = req.params;

    const upgrade = await prisma.tripUpgrade.findFirst({
      where: { OR: [{ paymentRef: reference }, { id: reference }] },
      include: {
        booking: {
          include: {
            customer: { select: { name: true, email: true } },
            driver: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!upgrade) return res.status(404).json({ message: "Upgrade not found" });

    if (upgrade.booking.customerId !== req.user!.id)
      return res.status(403).json({ message: "Not allowed" });
    
    if (upgrade.paymentStatus === "PAID")
      return res.json({ message: "Already paid", upgrade });


    let paystackData: any = null;
    for (let attempt = 1; attempt <= 5; attempt++) {
      paystackData = await verifyTransaction(upgrade.paymentRef);
      if (paystackData.status === "success") break;
      if (attempt < 5) await new Promise((r) => setTimeout(r, attempt * 1000));
    }

    if (paystackData?.status !== "success") {
      return res.status(400).json({
        message: "Payment not successful",
        status: paystackData?.status,
      });
    }

    // Mark upgrade paid + update booking packageType and totalAmount
    // Replace the Promise.all block:
    const [updatedUpgrade, updatedBooking] = await Promise.all([
      prisma.tripUpgrade.update({
        where: { id: upgrade.id },
        data: { paymentStatus: "PAID" },
      }),
      prisma.booking.update({
        where: { id: upgrade.bookingId },
        data: {
          packageType: "Airport Schedule",
          airportService: upgrade.airportService ?? undefined,
          totalAmount: upgrade.totalAmount,
        },
        // ADD this include so driver info isn't lost on frontend patch:
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatarUrl: true,
              driverProfile: {
                select: {
                  brandModel: true,
                  vehicleColor: true,
                  plateNumber: true,
                },
              },
            },
          },
          extensions: true,
          stops: { orderBy: { createdAt: "asc" } },
        },
      }),
    ]);

    const booking = upgrade.booking;
    const trackingId = booking.trackingId ?? booking.id;

    emitToAdmin("admin:booking_updated", {
      bookingId: upgrade.bookingId,
      trackingId,
      customerName: booking.customer.name,
      event: "TRIP_UPGRADED",
      fromPackage: upgrade.fromPackage,
      newPackageType: "Airport Schedule",
      originalAmount: upgrade.originalAmount,
      upgradeAmount: upgrade.upgradeAmount,
      newTotal: upgrade.totalAmount,
    });

    // Notify customer
    await createNotification(
      booking.customerId,
      "✈️ Upgrade Confirmed!",
      `Your trip has been upgraded to an Airport ride. Total: ₦${upgrade.totalAmount.toLocaleString()}`,
      "TRIP_UPGRADED",
      booking.id,
    );

    // Notify driver
    if (booking.driverId && booking.driver) {
      await createNotification(
        booking.driverId,
        "✈️ Trip Upgraded",
        `${booking.customer.name} upgraded to an Airport ride. New total: ₦${upgrade.totalAmount.toLocaleString()}`,
        "TRIP_UPGRADED",
        booking.id,
      );
      getIO()
        .to(`user:${booking.driverId}`)
        .emit("booking:updated", {
          ...updatedBooking,
          upgrade: updatedUpgrade,
        });
    }

    getIO()
      .to(`user:${booking.customerId}`)
      .emit("booking:updated", {
        ...updatedBooking,
        upgrade: updatedUpgrade,
      });
    // Email customer
    sendEmail(
      booking.customer.email,
      `✈️ Airport Upgrade Confirmed - ${trackingId}`,
      `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:16px">
        <h2 style="color:#0B1B2B">Upgrade Confirmed ✈️</h2>
        <p style="color:#374151">Hi <strong>${booking.customer.name}</strong>, your trip has been upgraded to an Airport ride.</p>
        <div style="background:#F9F6F0;border-radius:12px;padding:20px;margin:20px 0;border-left:4px solid #E4C77B">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="color:#6B7280;font-size:13px;padding:4px 0">Booking</td><td style="font-weight:600;text-align:right">${trackingId}</td></tr>
            <tr><td style="color:#6B7280;font-size:13px;padding:4px 0">Upgraded from</td><td style="font-weight:600;text-align:right">${upgrade.fromPackage}</td></tr>
            <tr><td style="color:#6B7280;font-size:13px;padding:4px 0">Upgrade paid</td><td style="font-weight:600;text-align:right">₦${upgrade.upgradeAmount.toLocaleString()}</td></tr>
            <tr><td style="color:#6B7280;font-size:13px;padding:4px 0">New total</td><td style="font-weight:700;font-size:15px;text-align:right">₦${upgrade.totalAmount.toLocaleString()}</td></tr>
          </table>
        </div>
      </div>
      `,
    );

    // Email admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", isActive: true },
      select: { email: true },
    });
    admins.forEach((a) =>
      sendEmail(
        a.email,
        `✈️ Upgrade Paid - ${trackingId}`,
        `<p>Booking <strong>${trackingId}</strong> upgraded to Airport. Customer: ${booking.customer.name}. Upgrade: ₦${upgrade.upgradeAmount.toLocaleString()}. New total: ₦${upgrade.totalAmount.toLocaleString()}</p>`,
      ),
    );

    res.json({
      message: "Upgrade verified",
      upgrade: updatedUpgrade,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("verifyUpgradePayment error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getUpgradeQuotes = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.bookingId, customerId: req.user!.id },
      include: { upgrade: true },
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (!UPGRADEABLE_FROM.includes(booking.packageType ?? "") || booking.upgrade?.paymentStatus === "PAID")
      return res.status(400).json({ message: "This trip can't be upgraded" });

    const options = await Promise.all(
      AIRPORT_SERVICES.map(async (airportService) => {
        const q = await getUpgradeQuote(booking, airportService);
        return { airportService, upgradeAmount: q.upgradeAmount, fuelTopUpAmount: q.fuelTopUpAmount };
      }),
    );
    res.json({ packageType: booking.packageType, options: options.filter((o) => o.upgradeAmount > 0) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
