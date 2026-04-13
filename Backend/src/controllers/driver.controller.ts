// backend/src/controllers/driver.controller.ts

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Request, Response } from "express";
import { sendVerificationEmail } from "../lib/email.service";
import { getIO } from "../lib/socket";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createNotification } from "../lib/notifications";

const generateCode = () => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hashed = crypto.createHash("sha256").update(code).digest("hex");
  const expiry = new Date(Date.now() + 15 * 60 * 1000);
  return { code, hashed, expiry };
};

// ── REGISTRATION ──────────────────────────────────────────────
export const registerDriver = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, licenseNumber } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const { code, hashed, expiry } = generateCode();

    const licenseImageUrl = req.file ? req.file.path : null;
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "DRIVER",
        phone,
        verificationToken: hashed,
        verificationExpiry: expiry,
        driverProfile: {
          create: {
            licenseNumber: licenseNumber ?? null,
            licenseImageUrl: licenseImageUrl, // 3. Store the image instantly!
            licenseStatus: licenseImageUrl ? "PENDING" : "REJECTED",
          },
        },
      },
    });

    try {
      await sendVerificationEmail(email, code);
    } catch (e) {
      console.error("Email send failed:", e);
    }

    res.status(201).json({
      message: "Driver registered. Check your email for the verification code.",
      email,
    });
  } catch (error) {
    console.error("Driver register error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ── LICENSE UPLOAD ─────────────────────────────────────────────
export const uploadLicense = async (
  req: AuthRequest & { file?: Express.Multer.File },
  res: Response,
) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const licenseImageUrl = req.file.path;

    await prisma.driverProfile.update({
      where: { userId: req.user!.id },
      data: { licenseImageUrl, licenseStatus: "PENDING" },
    });

    res.json({
      message: "License uploaded. Pending admin verification.",
      licenseImageUrl,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ── GET DRIVER PROFILE ─────────────────────────────────────────
export const getDriverProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.driverProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        user: {
          select: { name: true, email: true, phone: true, avatarUrl: true },
        },
      },
    });
    if (!profile)
      return res.status(404).json({ message: "Driver profile not found" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateDriverProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { vehicleType, brandModel, plateNumber, vehicleColor, workingHours } =
      req.body;
    const profile = await prisma.driverProfile.update({
      where: { userId: req.user!.id },
      data: {
        vehicleType,
        brandModel,
        plateNumber,
        vehicleColor,
        workingHours,
      },
    });
    res.json({ message: "Profile updated", profile });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ── TOGGLE ONLINE STATUS ────────────────────────────────────────
export const setOnlineStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;

    const profile = await prisma.driverProfile.update({
      where: { userId: req.user!.id },
      data: {
        onlineStatus: status,
        isOnline: status !== "OFFLINE",
        isAvailable: status === "ONLINE",
      },
    });

    // Broadcast status change so admin dashboard updates in real-time
    getIO().emit("driver:status_changed", {
      driverProfileId: profile.id,
      isOnline: profile.isOnline,
      isAvailable: profile.isAvailable,
    });

    res.json({ message: `Status updated to ${status}`, profile });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ── TOGGLE AVAILABILITY ─────────────────────────────────────────
export const setAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { isAvailable } = req.body;

    const profile = await prisma.driverProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!profile) return res.status(404).json({ message: "Profile not found" });
    if (!profile.isOnline && isAvailable) {
      return res
        .status(400)
        .json({ message: "You must be online to set availability" });
    }

    const updated = await prisma.driverProfile.update({
      where: { userId: req.user!.id },
      data: { isAvailable },
    });

    getIO().emit("driver:availability_changed", {
      driverProfileId: updated.id,
      isAvailable: updated.isAvailable,
    });

    res.json({ message: `Availability updated`, profile: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ── GET AVAILABLE RIDE REQUESTS ─────────────────────────────────
// export const getMyRideRequests = async (req: AuthRequest, res: Response) => {
//   try {
//     const profile = await prisma.driverProfile.findUnique({
//       where: { userId: req.user!.id },
//     });
//     if (!profile) return res.status(404).json({ message: 'Profile not found' });

//     const requests = await prisma.rideRequest.findMany({
//       where: {
//         driverProfileId: profile.id,
//         status: 'PENDING',
//         expiresAt: { gt: new Date() }, // not expired
//       },
//       include: {
//         booking: {
//           include: {
//             customer: { select: { name: true, phone: true } },
//           },
//         },
//       },
//       orderBy: { createdAt: 'desc' },
//     });

//     res.json(requests);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

export const getMyRideRequests = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Fetch ALL bookings that are paid but have no driver assigned yet
    const pool = await prisma.booking.findMany({
      where: {
        status: "AWAITING_DRIVER",
      },
      include: {
        customer: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(pool); // Send the raw bookings directly
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ── RESPOND TO RIDE REQUEST ─────────────────────────────────────
// export const respondToRideRequest = async (req: AuthRequest, res: Response) => {
//   try {
//     const { requestId } = req.params;
//     const { action } = req.body; // 'ACCEPTED' | 'DECLINED'

//     const profile = await prisma.driverProfile.findUnique({
//       where: { userId: req.user!.id },
//       include: { user: {select: {name: true}}, rideRequests: { where: { id: requestId } } },
//     });

//     if (!profile) return res.status(404).json({ message: 'Profile not found' });

//     const request = await prisma.rideRequest.findFirst({
//       where: { id: requestId, driverProfileId: profile.id },
//       include: { booking: true },
//     });

//     if (!request) return res.status(404).json({ message: 'Ride request not found' });
//     if (request.status !== 'PENDING') {
//       return res.status(400).json({ message: 'Request already responded to' });
//     }
//     if (new Date() > request.expiresAt) {
//       await prisma.rideRequest.update({
//         where: { id: requestId },
//         data: { status: 'EXPIRED' },
//       });
//       return res.status(400).json({ message: 'Request has expired' });
//     }

//     // Check if driver is already on an active trip
//     if (action === 'ACCEPTED') {
//       const activeTrip = await prisma.booking.findFirst({
//         where: {
//           driverId: profile.userId,
//           status: { in: ['ACCEPTED', 'IN_PROGRESS'] },
//         },
//       });

//       if (activeTrip) {
//         // Don't block — just warn. Frontend shows the prompt.
//         // Let driver confirm via a separate flag if needed.
//         // For now we include the warning in the response.
//         console.warn(`Driver ${profile.id} accepted ride while on active trip`);
//       }
//     }

//     const updatedRequest = await prisma.rideRequest.update({
//       where: { id: requestId },
//       data: {
//         status: action as 'ACCEPTED' | 'DECLINED',
//         respondedAt: new Date(),
//       },
//     });

//     if (action === 'ACCEPTED') {
//       // Assign driver to booking
//       await prisma.booking.update({
//         where: { id: request.bookingId },
//         data: {
//           driverId: profile.userId,
//           status: 'ACCEPTED',
//         },
//       });

//       // Update driver stats
//       await prisma.driverProfile.update({
//         where: { id: profile.id },
//         data: {
//           isAvailable: false, // no longer available for new rides
//           totalTrips: { increment: 1 },
//         },
//       });

//       // Notify customer in real-time
//       getIO().to(`user:${request.booking.customerId}`).emit('booking:driver_assigned', {
//         bookingId: request.bookingId,
//         driverName: profile.user?.name,
//       });

//       await createNotification(
//         request.booking.customerId,
//         'Driver Assigned!',
//         `A driver has been assigned to your booking.`,
//         'DRIVER_ASSIGNED',
//         request.bookingId,
//       );
//     }

//     // Notify admin of response
//     getIO().emit('driver:request_responded', {
//       requestId,
//       action,
//       driverProfileId: profile.id,
//       bookingId: request.bookingId,
//     });

//     res.json({ message: `Ride ${action.toLowerCase()}`, request: updatedRequest });
//   } catch (error) {
//     console.error('Respond to ride request error:', error);
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

export const respondToRideRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params; // In this case, requestId is actually the Booking ID
    const { action } = req.body;
    const profile = await prisma.driverProfile.findUnique({
      where: { userId: req.user!.id },
      include: { user: { select: { name: true } } },
    });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    // If they decline, we don't modify the database. We just let them ignore it on the frontend so other drivers can still see it.
    if (action === "DECLINED") {
      return res.json({ message: "Ride ignored locally" });
    }
    if (action === "ACCEPTED") {
      const existingActiveTrip = await prisma.booking.findFirst({
        where: {
          driverId: profile.userId,
          status: { in: ["ACCEPTED", "IN_PROGRESS"] },
        },
      });

      if (existingActiveTrip) {
        return res.status(409).json({
          message:
            "You already have an active trip. Please complete it before accepting a new one.",
        });
      }

      const result = await prisma.booking.updateMany({
        where: {
          id: requestId,
          status: "AWAITING_DRIVER", // guard — atomic check+update in one query
          driverId: null, // double guard — not yet assigned
        },
        data: {
          driverId: profile.userId,
          status: "ACCEPTED",
          acceptedByDriverAt: new Date(),
        },
      });

      // If count is 0, another driver beat this one to it
      if (result.count === 0) {
        return res.status(409).json({
          message: "Sorry! Another driver just accepted this ride.",
        });
      }

      // Fetch updated booking for socket emit
      const updated = await prisma.booking.findUnique({
        where: { id: requestId },
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
        },
      });

      try {
        getIO()
          .to(`user:${updated!.customerId}`)
          .emit("booking:updated", updated);
        getIO().emit("ride:removed", updated!.id);
      } catch (err) {
        console.log("Socket emit failed", err);
      }

      await prisma.driverProfile.update({
        where: { id: profile.id },
        data: { isAvailable: false, totalTrips: { increment: 1 }, onlineStatus: 'AWAY' },
      });

      await createNotification(
        updated!.customerId,
        "Driver Assigned!",
        "A driver has accepted your booking and is on the way.",
        "DRIVER_ASSIGNED",
        requestId,
      );

      return res.json({
        message: "Ride accepted successfully",
        booking: updated,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ── GET DRIVER TRIP HISTORY ─────────────────────────────────────
export const getDriverTripHistory = async (req: AuthRequest, res: Response) => {
  try {
    const trips = await prisma.booking.findMany({
      where: {
        driverId: req.user!.id,
        status: { in: ["COMPLETED", "CANCELLED"] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true, phone: true, avatarUrl: true } },
        review: { select: { rating: true, comment: true } },
      },
    });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ── GET ACTIVE TRIP ─────────────────────────────────────────────
export const getActiveTrip = async (req: AuthRequest, res: Response) => {
  try {
    const trip = await prisma.booking.findFirst({
      where: {
        driverId: req.user!.id,
        status: { in: ["ACCEPTED", "IN_PROGRESS"] },
      },
      include: {
        customer: { select: { name: true, phone: true, avatarUrl: true } },
        extensions: { where: { paymentStatus: "PAID" } },
      },
    });
    res.json(trip ?? null);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ── START TRIP ──────────────────────────────────────────────────
export const startTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, driverId: req.user!.id, status: "ACCEPTED" },
    });
    if (!booking)
      return res
        .status(404)
        .json({ message: "Booking not found or not accepted" });

   const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "IN_PROGRESS" },
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
      },
    });

    // Notify customer
      getIO()
      .to(`user:${booking.customerId}`)
      .emit("booking:updated", updated);
    // Also log for debugging
    console.log(`🚗 startTrip emitted booking:updated to user:${booking.customerId}`, {
      bookingId,
      status: updated.status,
    });

    await createNotification(
      booking.customerId,
      "Trip Started",
      "Your driver has started the trip. Have a safe journey!",
      "TRIP_STARTED",
      bookingId,
    );

    res.json({ message: "Trip started", booking: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ── ADMIN: VERIFY LICENSE ───────────────────────────────────────
export const verifyDriverLicense = async (req: AuthRequest, res: Response) => {
  try {
    const { driverProfileId, status, rejectionReason } = req.body;
    // status: 'APPROVED' | 'REJECTED'

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const profile = await prisma.driverProfile.update({
      where: { id: driverProfileId },
      data: { licenseStatus: status },
      include: { user: { select: { id: true, name: true } } },
    });

    // Notify driver in real-time
    getIO()
      .to(`user:${profile.user.id}`)
      .emit("license:verified", { status, rejectionReason });

    await createNotification(
      profile.user.id,
      status === "APPROVED" ? "License Approved!" : "License Rejected",
      status === "APPROVED"
        ? "Your driver's license has been verified. You can now receive ride requests."
        : `Your license was rejected. ${rejectionReason ?? "Please re-upload a valid license."}`,
      "LICENSE_STATUS",
      undefined,
    );

    res.json({ message: `License ${status.toLowerCase()}`, profile });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ── ADMIN: ASSIGN DRIVER TO BOOKING ────────────────────────────
export const assignDriverToBooking = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { bookingId, driverProfileId } = req.body;

    const driverProfile = await prisma.driverProfile.findUnique({
      where: { id: driverProfileId },
      include: { user: true },
    });

    if (!driverProfile)
      return res.status(404).json({ message: "Driver not found" });
    if (!driverProfile.isOnline) {
      return res.status(400).json({ message: "Driver is offline" });
    }
    if (driverProfile.licenseStatus !== "APPROVED") {
      return res.status(400).json({ message: "Driver license not verified" });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Create ride request that expires in 30 seconds
    const expiresAt = new Date(Date.now() + 30 * 1000);

    const rideRequest = await prisma.rideRequest.create({
      data: {
        bookingId,
        driverProfileId,
        expiresAt,
        status: "PENDING",
      },
      include: {
        booking: {
          include: {
            customer: { select: { name: true, phone: true } },
          },
        },
      },
    });

    // Push ride request to driver in real-time
    getIO().to(`driver:${driverProfileId}`).emit("ride:new_request", {
      requestId: rideRequest.id,
      booking: rideRequest.booking,
      expiresAt,
    });

    res.json({ message: "Ride request sent to driver", rideRequest });
  } catch (error) {
    console.error("Assign driver error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ── GET ALL AVAILABLE DRIVERS (Admin) ──────────────────────────
export const getAvailableDrivers = async (req: AuthRequest, res: Response) => {
  try {
    const drivers = await prisma.driverProfile.findMany({
      where: {
        isOnline: true,
        isAvailable: true,
        licenseStatus: "APPROVED",
      },
      include: {
        user: { select: { name: true, phone: true, avatarUrl: true } },
      },
    });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const endTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, driverId: req.user!.id, status: "IN_PROGRESS" },
    });
    if (!booking)
      return res
        .status(404)
        .json({ message: "Trip not found or not running." });

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "COMPLETED" },
      include: {
        driver: {
          select: {
            name: true,
            phone: true,
            avatarUrl: true,
            driverProfile: {
              select: { brandModel: true, vehicleColor: true, plateNumber: true },
            },
          },
        },
      },
    });

    await prisma.driverProfile.update({
      where: { userId: req.user!.id },
      data: { isAvailable: true, onlineStatus: 'ONLINE' },
    });

    console.log(`✅ endTrip: emitting booking:updated to user:${booking.customerId}`, {
      bookingId, status: updated.status,
    });
    getIO().to(`user:${booking.customerId}`).emit("booking:updated", updated);

    await createNotification(
      booking.customerId,
      "Trip completed",
      "Your driver has completed the trip. Thank you for rideing with us!",
      "TRIP_COMPLETED",
      bookingId,
    );
    res.json({ message: "Trip ended successfully", booking: updated });
  } catch (error) {
    res;
  }
};
