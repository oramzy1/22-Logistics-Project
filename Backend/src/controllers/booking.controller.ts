// backend/src/controllers/booking.controller.ts

import crypto from "crypto";
import { Response } from "express";
import { createNotification } from "../lib/notifications";
import { initializeTransaction, verifyTransaction } from "../lib/paystack";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { getIO } from "../lib/socket";

// Package pricing in Naira
const PACKAGE_PRICES: Record<string, number> = {
  "3 Hours": 24000,
  "6 Hours": 34000,
  "10 Hours": 54000,
  "Airport Schedule": 80000,
  "Multi-day": 80000,
};

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const {
      pickupAddress,
      dropoffAddress,
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      scheduledAt,
      packageType,
      duration,
      notes,
      totalAmount: clientTotal,
      pickupDate,
      pickupTime,
      outsidePH,
      addOns,
    } = req.body;

    const customerId = req.user!.id;

    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: { email: true, name: true, role: true },
    });
    if (!customer) return res.status(404).json({ message: "User not found" });

    const rideType = customer.role === "BUSINESS" ? "BUSINESS" : "INDIVIDUAL";

    // ── INTERSTATE PRICE EVALUATION ──
    let finalAmount = 0;
    if (outsidePH) {
      // If interstate, we trust the dynamic price passed by the frontend
      if (!clientTotal)
        return res
          .status(400)
          .json({ message: "Interstate trips require a dynamic total amount" });
      finalAmount = clientTotal;
    } else {
      // Local PH pricing evaluation
      const basePrice = PACKAGE_PRICES[packageType] ?? 0;
      if (!basePrice)
        return res
          .status(400)
          .json({ message: "Invalid package type or custom pricing required" });

      const MAX_EXTRAS = 20000;
      finalAmount =
        clientTotal &&
        clientTotal >= basePrice &&
        clientTotal <= basePrice + MAX_EXTRAS
          ? clientTotal
          : basePrice;
    }

    const paymentRef = `22LOG-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // ── UTILITY: Generate Unique Tracking ID ──
    // e.g. LOG-849201
    const trackingId = `LOG-${Math.random().toString().substring(2, 8)}`;

    let paystackData: any;
    try {
      paystackData = await initializeTransaction(
        customer.email,
        finalAmount * 100, // Paystack uses Kobo
        { customerId, packageType },
        paymentRef,
        ["card"],
      );
    } catch (paystackError: any) {
      console.error("Paystack init failed:", paystackError?.message);
      return res.status(502).json({ message: "Payment gateway unavailable." });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerId,
        pickupAddress,
        dropoffAddress,
        pickupLat,
        pickupLng,
        dropoffLat,
        dropoffLng,
        scheduledAt: new Date(scheduledAt), // Frontend passes full ISO Date string here
        packageType,
        duration: duration ? String(duration) : null,
        notes,
        totalAmount: finalAmount,
        paymentRef,
        status: "PENDING",
        paymentStatus: "UNPAID",
        trackingId,
        pickupDate,
        pickupTime,
        outsidePH: outsidePH || false,
        addOns: addOns || [],
      },
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { paystackAccessCode: paystackData.access_code },
    });

    res.status(201).json({
      booking,
      payment: {
        authorizationUrl: paystackData.authorization_url,
        accessCode: paystackData.access_code,
        reference: paymentRef,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const bookings = await prisma.booking.findMany({
      where: {
        customerId: userId,
        NOT: {
          AND: [
            { paymentStatus: "UNPAID" },
            { createdAt: { lt: new Date(Date.now() - 30 * 60 * 1000) } },
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        driver: {
          select: {
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
        extensions: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findFirst({
      where: { id, customerId: req.user!.id },
      include: {
        driver: {
          select: {
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
        extensions: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findFirst({
      where: { id, customerId: req.user!.id },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (["IN_PROGRESS", "COMPLETED"].includes(booking.status)) {
      return res.status(400).json({ message: "Cannot cancel this booking" });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    if (booking.driverId) {
      await prisma.driverProfile.update({
        where: { userId: booking.driverId },
        data: { isAvailable: true },
      });
      getIO().to(`user:${booking.driverId}`).emit("booking:updated", updated);
    } else {
      getIO().to(`drivers:available`).emit("ride:removed", booking.id);
    }

    await createNotification(
      req.user!.id,
      "Booking Cancelled",
      `Your booking for ${booking.packageType} has been cancelled.`,
      "BOOKING_CANCELLED",
      id,
    );

    res.json({ message: "Booking cancelled" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// export const verifyPayment = async (req: AuthRequest, res: Response) => {
//   try {
//     const { reference } = req.params;

//     const booking = await prisma.booking.findFirst({
//       where: { paymentRef: reference },
//     });
//     if (!booking) return res.status(404).json({ message: 'Booking not found' });

//       if (booking.paymentStatus === 'PAID') {
//       return res.json({ message: 'Payment already verified', booking });
//     }

//     const paystackData = await verifyTransaction(reference);

//     if (paystackData.status === 'success') {
//       const updated = await prisma.booking.update({
//         where: { id: booking.id },
//         data: {
//           paymentStatus: 'PAID',
//           status: 'AWAITING_DRIVER',
//         },
//       });

//       await createNotification(
//         booking.customerId,
//         'Payment Confirmed',
//         `Your payment for ${booking.packageType} was successful. We are assigning a driver.`,
//         'PAYMENT_CONFIRMED',
//         booking.id
//       );

//       return res.json({ message: 'Payment verified', booking: updated });
//     }

//       console.error('Paystack verify returned non-success:', paystackData);
//     res.status(400).json({ message: 'Payment not successful', status: paystackData.status });
//   } catch (error) {
//     console.error('Verify payment error:', error);
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { reference } = req.params;

    console.log("🔍 Verify called with reference:", reference);

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ paymentRef: reference }, { id: reference }],
      },
    });
    console.log("📦 Booking found:", booking?.id ?? "NOT FOUND");
    console.log("📋 All payment refs in DB:");
    //   const allRefs = await prisma.booking.findMany({
    //   select: { paymentRef: true, id: true, paymentStatus: true }
    // });
    // console.log(allRefs);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Already updated (by webhook or previous verify call)
    if (booking.paymentStatus === "PAID") {
      return res.json({ message: "Payment already verified", booking });
    }

    if (!booking.paymentRef) {
      return res
        .status(400)
        .json({ message: "Booking has no payment reference" });
    }

    // Retry verifying with Paystack up to 5 times with backoff
    let paystackData: any = null;
    for (let attempt = 1; attempt <= 5; attempt++) {
      paystackData = await verifyTransaction(booking.paymentRef); // no const here — assign to outer variable
      console.log(`Verify attempt ${attempt}:`, paystackData.status);

      if (paystackData.status === "success") break;

      if (attempt < 5) {
        await new Promise((r) => setTimeout(r, attempt * 1000));
      }
    }

    if (paystackData?.status === "success") {
      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: { paymentStatus: "PAID", status: "AWAITING_DRIVER" },
      });

      try {
        getIO()
          .to("drivers:available")
          .emit("ride:new_request", { booking: updated });
      } catch (err) {
        console.log("Socket emit failed:", err);
      }

      await createNotification(
        booking.customerId,
        "Payment Confirmed",
        `Your payment for ${booking.packageType} was successful. A driver will be assigned shortly.`,
        "PAYMENT_CONFIRMED",
        booking.id,
      );

      return res.json({ message: "Payment verified", booking: updated });
    }

    console.error(
      "All verify attempts failed. Final status:",
      paystackData?.status,
    );
    return res.status(400).json({
      message: "Payment not successful after retries",
      status: paystackData?.status,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const reinitializePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { channel } = req.body; // 'card' | 'bank_transfer'

    const booking = await prisma.booking.findFirst({
      where: { id, customerId: req.user!.id },
      include: {
        customer: { select: { email: true } }, // ✅ 'customer' matches your schema relation
      },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.paymentStatus === "PAID")
      return res.status(400).json({ message: "Already paid" });

    const validChannels = ["card", "bank_transfer"];
    if (!validChannels.includes(channel)) {
      return res.status(400).json({ message: "Invalid payment channel" });
    }

    const newRef = `22LOG-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    const paystackData = await initializeTransaction(
      booking.customer.email,
      booking.totalAmount * 100,
      {
        bookingId: booking.id,
        customerId: booking.customerId,
        packageType: booking.packageType,
      },
      newRef,
      [channel],
    );

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentRef: newRef,
        paystackAccessCode: paystackData.access_code,
      },
    });

    res.json({
      authorizationUrl: paystackData.authorization_url,
      reference: newRef,
    });
  } catch (error) {
    console.error("Reinitialize payment error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const endTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findFirst({
      where: { id, customerId: req.user!.id },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (!["IN_PROGRESS", "AWAITING_DRIVER"].includes(booking.status)) {
      return res.status(400).json({ message: "Trip cannot be ended" });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "COMPLETED" },
    });

    if (booking.driverId) {
      await prisma.driverProfile.update({
        where: { userId: booking.driverId },
        data: { isAvailable: true },
      });
      const { getIO } = require("../lib/socket");
      getIO().to(`user:${booking.customerId}`).emit("booking:updated", updated);
      getIO().to(`user:${booking.driverId}`).emit("booking:updated", updated);
    }

    await createNotification(
      booking.customerId,
      "Trip Completed",
      `Your ${booking.packageType} trip has been completed. Thank you for riding with us!`,
      "BOOKING_COMPLETED",
      id,
    );

    res.json({ message: "Trip ended", booking: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const rateDriver = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // bookingId
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const booking = await prisma.booking.findFirst({
      where: { id, customerId: req.user!.id, status: "COMPLETED" },
      include: { review: true },
    });

    if (!booking)
      return res
        .status(404)
        .json({ message: "Booking not found or not completed" });
    if (!booking.driverId)
      return res.status(400).json({ message: "No driver assigned" });

    // Prevent duplicate reviews
    if (booking.review) {
      return res
        .status(400)
        .json({ message: "You have already rated this trip" });
    }

    const review = await prisma.driverReview.create({
      data: {
        bookingId: id,
        driverId: booking.driverId,
        customerId: req.user!.id,
        rating,
        comment: comment ?? null,
      },
    });

    // Recalculate average rating from ALL reviews for this driver
    const aggregate = await prisma.driverReview.aggregate({
      where: { driverId: booking.driverId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const totalCompleted = await prisma.booking.count({
      where: { driverId: booking.driverId, status: "COMPLETED" },
    });
    const totalAccepted = await prisma.booking.count({
      where: {
        driverId: booking.driverId,
        status: { in: ["ACCEPTED", "IN_PROGRESS", "COMPLETED"] },
      },
    });
    const totalRequests = await prisma.booking.count({
      where: { driverId: booking.driverId },
    });

    // ✅ NOW we actually write the computed rating back to DriverProfile
    await prisma.driverProfile.update({
      where: { userId: booking.driverId },
      data: {
        rating: parseFloat((aggregate._avg.rating ?? 5.0).toFixed(2)), // ← THIS WAS MISSING
        acceptanceRate:
          totalRequests > 0
            ? Math.round((totalAccepted / totalRequests) * 100)
            : 0,
        totalTrips: totalCompleted,
      },
    });

    res.json({ message: "Driver rated", review });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const cancelBookingWithReason = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { reason, requestRefund } = req.body;

    const booking = await prisma.booking.findFirst({
      where: { id, customerId: req.user!.id },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (["IN_PROGRESS", "COMPLETED"].includes(booking.status)) {
      return res.status(400).json({ message: "Cannot cancel this booking" });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancellationReason: reason,
        refundRequested: requestRefund && booking.paymentStatus === "PAID",
      },
    });

    if (booking.driverId) {
      await prisma.driverProfile.update({
        where: { userId: booking.driverId },
        data: { isAvailable: true },
      });
      getIO().to(`user:${booking.driverId}`).emit("booking:updated", updated);
      getIO().to(`user:${booking.customerId}`).emit("booking:updated", updated);
    } else {
      getIO().to(`drivers:available`).emit("ride:removed", booking.id);
      getIO().to(`user:${booking.customerId}`).emit("booking:updated", updated);
    }

    await createNotification(
      req.user!.id,
      "Booking Cancelled",
      `Your booking for ${booking.packageType} has been cancelled.${requestRefund && booking.paymentStatus === "PAID" ? " Your refund request is being processed." : ""}`,
      "BOOKING_CANCELLED",
      id,
    );

    res.json({
      message: "Booking cancelled",
      refundRequested: requestRefund && booking.paymentStatus === "PAID",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
