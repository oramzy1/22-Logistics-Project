import { Response } from "express";
import crypto from "crypto";
import prisma from "../lib/prisma";
import { initializeTransaction, verifyTransaction } from "../lib/paystack";
import { AuthRequest } from "../middlewares/auth.middleware";
import { getExtensionPrices } from "../lib/getPrices";
import {
  sendExtensionEmail,
  sendAdminNewBookingEmail,
} from "../lib/email.service";
import { createNotification, notifyAdmins } from "../lib/notifications";
import { emitToAdmin, getIO } from "../lib/socket";

// const EXTENSION_PRICES: Record<string, number> = {
//   '1-Hours': 10000,
//   '2-Hours': 15000,
//   '3-Hours': 24000,
// };

export const createExtension = async (req: AuthRequest, res: Response) => {
  console.log("👤 User making extension request:", req.user);
  try {
    const { bookingId, hours } = req.body; // hours = '1-Hours' | '2-Hours' | '3-Hours'

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, customerId: req.user!.id },
      include: { customer: { select: { email: true } } },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (!["IN_PROGRESS", "AWAITING_DRIVER"].includes(booking.status)) {
      return res
        .status(400)
        .json({ message: "Can only extend trips in progress" });
    }

    const EXTENSION_PRICES = await getExtensionPrices();
    const amount = EXTENSION_PRICES[hours];
    if (!amount)
      return res.status(400).json({ message: "Invalid extension option" });

    const paymentRef = `22LOG-EXT-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    const extension = await prisma.tripExtension.create({
      data: { bookingId, hours: parseInt(hours), amount, paymentRef },
    });

    const paystackData = await initializeTransaction(
      booking.customer.email,
      amount * 100,
      { extensionId: extension.id, bookingId, type: "EXTENSION" },
      paymentRef,
      ["card"],
    );

    await prisma.tripExtension.update({
      where: { id: extension.id },
      data: { paystackAccessCode: paystackData.access_code },
    });

    res.status(201).json({
      extension,
      payment: {
        authorizationUrl: paystackData.authorization_url,
        accessCode: paystackData.access_code,
        reference: paymentRef,
      },
    });
  } catch (error) {
    console.error("Create extension error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const verifyExtensionPayment = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { reference } = req.params;

    const extension = await prisma.tripExtension.findFirst({
      where: { OR: [{ paymentRef: reference }, { id: reference }] },
    });
    if (!extension)
      return res.status(404).json({ message: "Extension not found" });
    if (extension.paymentStatus === "PAID")
      return res.json({ message: "Already paid", extension });

    if (!extension.paymentRef)
      return res.status(400).json({ message: "No payment reference" });

    let paystackData: any = null;
    for (let attempt = 1; attempt <= 5; attempt++) {
      paystackData = await verifyTransaction(extension.paymentRef);
      if (paystackData.status === "success") break;
      if (attempt < 5) await new Promise((r) => setTimeout(r, attempt * 1000));
    }

    if (paystackData?.status === "success") {
      const updated = await prisma.tripExtension.update({
        where: { id: extension.id },
        data: { paymentStatus: "PAID" },
      });
      const booking = await prisma.booking.findUnique({
        where: { id: extension.bookingId },
        include: {
          customer: { select: { name: true, email: true } },
          driver: { select: { id: true, name: true, email: true } },
          extensions: { where: { paymentStatus: "PAID" } },
        },
      });

      if (booking) {
        const trackingId = booking.trackingId ?? booking.id;
        const allPaidExtensions = await prisma.tripExtension.findMany({
          where: { bookingId: booking.id, paymentStatus: "PAID" },
        });
        const totalExtensionHours = allPaidExtensions.reduce(
          (sum, e) => sum + e.hours,
          0,
        );
        const totalExtensionAmount = allPaidExtensions.reduce(
          (sum, e) => sum + e.amount,
          0,
        );
        const newTotal = booking.totalAmount + extension.amount; // only add THIS extension (booking.totalAmount already has prior ones)

        // Derive extended package label
        const baseMatch = booking.packageType?.match(/^(\d+)/);
        const baseHours = baseMatch ? parseInt(baseMatch[1]) : 0;
        const extendedHours = baseHours + totalExtensionHours;
        const newPackageType =
          extendedHours > 0 ? `${extendedHours} Hours` : booking.packageType;

        const updatedBooking = await prisma.booking.update({
          where: { id: booking.id },
          data: {
            totalAmount: newTotal,
            packageType: newPackageType,
          },
        });
        // Notify driver
        if (booking.driverId && booking.driver) {
          await createNotification(
            booking.driverId,
            "Trip Extended",
            `${booking.customer.name} extended the trip by ${extension.hours} hour(s). ₦${extension.amount.toLocaleString()} received.`,
            "BOOKING_UPDATED",
            booking.id,
          );
          sendExtensionEmail(
            booking?.driver.email,
            booking?.driver.name,
            "driver",
            booking.customer.name,
            trackingId,
            extension.hours,
            extension.amount,
          );
          getIO()
            .to(`user:${booking.driverId}`)
            .emit("booking:updated", updatedBooking);
        }
        getIO()
          .to(`user:${booking.customerId}`)
          .emit("booking:updated", updatedBooking);

        // Notify admins
        await notifyAdmins(
          "Trip Extension Payment",
          `₦${extension.amount.toLocaleString()} · ${extension.hours}h extension by ${booking.customer.name}`,
          "NEW_BOOKING",
          booking.id,
        );
        emitToAdmin("admin:booking_updated", {
          bookingId: booking.id,
          trackingId,
          customerName: booking.customer.name,
          event: "TRIP_EXTENDED",
          extensionHours: extension.hours,
          extensionAmount: extension.amount,
          newTotal,
          newPackageType,
        });
        const admins = await prisma.user.findMany({
          where: { role: "ADMIN", isActive: true },
          select: { email: true, name: true },
        });
        admins.forEach((a) =>
          sendExtensionEmail(
            a.email,
            a.name,
            "admin",
            booking.customer.name,
            trackingId,
            extension.hours,
            extension.amount,
            booking.driver?.name,
          ),
        );
      }
      return res.json({
        message: "Extension payment verified",
        extension: updated,
      });
    }

    res.status(400).json({
      message: "Payment not successful",
      status: paystackData?.status,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
