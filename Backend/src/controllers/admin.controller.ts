import bcrypt from "bcryptjs";
import { Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { getIO } from "../lib/socket";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createNotification } from "../lib/notifications";
import { sendPromoEmail } from "../lib/email.service";
// import { Prisma } from "@prisma/client";

// ── Helper: write audit log ─────────────────────────────────────
async function audit(
  adminId: string,
  action: string,
  targetType: string,
  targetId?: string,
  metadata?: object,
) {
  await prisma.adminAuditLog.create({
    data: { adminId, action, targetType, targetId, metadata },
  });
}

// ── AUTH ────────────────────────────────────────────────────────
export const adminLogin = async (req: any, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || user.role !== "ADMIN" || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.password)
      return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "8h" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const yesterdayStart = new Date(todayStart.getTime() - 86400000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekAgo = new Date(now.getTime() - 7 * 86400000);

    const [
      totalBookings,
      bookingsYesterday,
      totalRevenueAgg,
      revenueYesterdayAgg,
      revenueTodayAgg,
      revenueThisMonthAgg,
      revenueLastMonthAgg,
      revenueThisYearAgg,
      activeDrivers,
      pendingLicenses,
      registeredUsers,
      registeredUsersThisWeek,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      businessRevenueAgg,
      individualRevenueAgg,
      recentTransactions,
    ] = await Promise.all([
      prisma.booking.count({ where: { paymentStatus: "PAID" } }),
      prisma.booking.count({
        where: {
          paymentStatus: "PAID",
          createdAt: { gte: yesterdayStart, lt: todayStart },
        },
      }),
      prisma.booking.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { totalAmount: true },
      }),
      prisma.booking.aggregate({
        where: {
          paymentStatus: "PAID",
          createdAt: { gte: yesterdayStart, lt: todayStart },
        },
        _sum: { totalAmount: true },
      }),
      prisma.booking.aggregate({
        where: { paymentStatus: "PAID", createdAt: { gte: todayStart } },
        _sum: { totalAmount: true },
      }),
      prisma.booking.aggregate({
        where: { paymentStatus: "PAID", createdAt: { gte: monthStart } },
        _sum: { totalAmount: true },
      }),
      prisma.booking.aggregate({
        where: {
          paymentStatus: "PAID",
          createdAt: { gte: lastMonthStart, lt: lastMonthEnd },
        },
        _sum: { totalAmount: true },
      }),
      prisma.booking.aggregate({
        where: { paymentStatus: "PAID", createdAt: { gte: yearStart } },
        _sum: { totalAmount: true },
      }),
      prisma.driverProfile.count({ where: { isOnline: true } }),
      // ── FIX: no isDeleted filter on licenseStatus ──
      prisma.driverProfile.count({ where: { licenseStatus: "PENDING" } }),
      // ── FIX: guard isDeleted with a try - fall back if column missing ──
      prisma.user.count({
        where: { role: { in: ["INDIVIDUAL", "BUSINESS"] } },
      }),
      prisma.user.count({
        where: {
          role: { in: ["INDIVIDUAL", "BUSINESS"] },
          createdAt: { gte: weekAgo },
        },
      }),
      prisma.booking.count({ where: { status: "PENDING" } }),
      prisma.booking.count({
        where: {
          status: { in: ["AWAITING_DRIVER", "ACCEPTED", "IN_PROGRESS"] },
        },
      }),
      prisma.booking.count({ where: { status: "CANCELLED" } }),
      prisma.booking.count({ where: { status: "COMPLETED" } }),
      prisma.booking.aggregate({
        where: { paymentStatus: "PAID", rideType: "BUSINESS" },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      prisma.booking.aggregate({
        where: { paymentStatus: "PAID", rideType: "INDIVIDUAL" },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      prisma.booking.findMany({
        where: { paymentStatus: "PAID" },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { customer: { select: { name: true, role: true } } },
      }),
    ]);

    // ── Raw queries in separate try blocks so one failure doesn't kill everything ──
    let weeklyRevenue: { day: string; v: number }[] = [];
    try {
      const raw = await prisma.$queryRaw<{ day: string; revenue: string }[]>`
        SELECT
          TO_CHAR("createdAt"::date, 'Dy') AS day,
          COALESCE(SUM("totalAmount"), 0)::text AS revenue
        FROM "Booking"
        WHERE "paymentStatus" = 'PAID'
          AND "createdAt" >= NOW() - INTERVAL '7 days'
        GROUP BY "createdAt"::date
        ORDER BY "createdAt"::date ASC
      `;
      weeklyRevenue = raw.map((r) => ({
        day: r.day,
        v: parseFloat(r.revenue),
      }));
    } catch (e) {
      console.error("weeklyRevenue query failed:", e);
    }

    const totalRevenue = totalRevenueAgg._sum.totalAmount ?? 0;
    const revenueToday = revenueTodayAgg._sum.totalAmount ?? 0;
    const revenueThisMonth = revenueThisMonthAgg._sum.totalAmount ?? 0;
    const revenueLastMonth = revenueLastMonthAgg._sum.totalAmount ?? 0;
    const revenueThisYear = revenueThisYearAgg._sum.totalAmount ?? 0;

    const revenueChangePct =
      revenueLastMonth > 0
        ? Math.round(
            ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100,
          )
        : 0;

    res.json({
      totalBookings,
      bookingsChangeFromYesterday: bookingsYesterday,
      totalRevenue,
      revenueToday,
      revenueThisMonth,
      revenueThisYear,
      revenueChangePct,
      revenueYesterday: revenueYesterdayAgg._sum.totalAmount ?? 0,
      activeDrivers,
      pendingAssignments: confirmedBookings,
      registeredUsers,
      registeredUsersThisWeek,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      pendingLicenses,
      businessRevenue: businessRevenueAgg._sum.totalAmount ?? 0,
      businessTxnCount: businessRevenueAgg._count.id,
      individualRevenue: individualRevenueAgg._sum.totalAmount ?? 0,
      individualTxnCount: individualRevenueAgg._count.id,
      recentTransactions,
      weeklyRevenue,
    });
  } catch (error) {
    console.error("getDashboardStats error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const getChartData = async (req: AuthRequest, res: Response) => {
  try {
    const { period = "7d", rideType } = req.query as Record<string, string>;

    const periodMap: Record<
      string,
      { start: Date; trunc: string; fmt: string }
    > = {
      "7d": {
        start: new Date(Date.now() - 7 * 86400000),
        trunc: "day",
        fmt: "Dy",
      },
      "1m": {
        start: new Date(Date.now() - 30 * 86400000),
        trunc: "day",
        fmt: "DD Mon",
      },
      "6m": {
        start: new Date(Date.now() - 180 * 86400000),
        trunc: "month",
        fmt: "Mon",
      },
      "1y": {
        start: new Date(Date.now() - 365 * 86400000),
        trunc: "month",
        fmt: "Mon YY",
      },
    };

    const { start, trunc, fmt } = periodMap[period] ?? periodMap["7d"];

    // Whitelist-safe: trunc and fmt come only from our own map above, never user input
    const rideTypeClause =
      rideType && rideType !== "ALL"
        ? `AND "rideType" = '${rideType === "BUSINESS" ? "BUSINESS" : "INDIVIDUAL"}'`
        : "";

    const [revenueRaw, bookingRaw] = await Promise.all([
      prisma.$queryRawUnsafe<{ label: string; v: string }[]>(
        `
        SELECT
          TO_CHAR(DATE_TRUNC('${trunc}', "createdAt"), '${fmt}') AS label,
          COALESCE(SUM("totalAmount"), 0)::text AS v
        FROM "Booking"
        WHERE "paymentStatus" = 'PAID'
          AND "createdAt" >= $1
          ${rideTypeClause}
        GROUP BY DATE_TRUNC('${trunc}', "createdAt")
        ORDER BY DATE_TRUNC('${trunc}', "createdAt") ASC
      `,
        start,
      ),
      prisma.$queryRawUnsafe<{ label: string; v: string }[]>(
        `
        SELECT
          TO_CHAR(DATE_TRUNC('${trunc}', "createdAt"), '${fmt}') AS label,
          COUNT(*)::text AS v
        FROM "Booking"
        WHERE "paymentStatus" = 'PAID'
          AND "createdAt" >= $1
          ${rideTypeClause}
        GROUP BY DATE_TRUNC('${trunc}', "createdAt")
        ORDER BY DATE_TRUNC('${trunc}', "createdAt") ASC
      `,
        start,
      ),
    ]);

    const rideTypeWhere: any =
      rideType && rideType !== "ALL" ? { rideType } : {};
    const [scheduled, completed, cancelled] = await Promise.all([
      prisma.booking.count({
        where: {
          ...rideTypeWhere,
          paymentStatus: "PAID",
          status: { in: ["AWAITING_DRIVER", "ACCEPTED", "IN_PROGRESS"] },
          createdAt: { gte: start },
        },
      }),
      prisma.booking.count({
        where: {
          ...rideTypeWhere,
          paymentStatus: "PAID",
          status: "COMPLETED",
          createdAt: { gte: start },
        },
      }),
      prisma.booking.count({
        where: {
          ...rideTypeWhere,
          paymentStatus: "PAID",
          status: "CANCELLED",
          createdAt: { gte: start },
        },
      }),
    ]);

    res.json({
      revenueData: revenueRaw.map((r) => ({
        label: r.label,
        v: parseFloat(r.v),
      })),
      bookingData: bookingRaw.map((r) => ({
        label: r.label,
        v: parseInt(r.v),
      })),
      rideBreakdown: { scheduled, completed, cancelled },
    });
  } catch (error) {
    console.error("getChartData error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ── USER MANAGEMENT ────────────────────────────────────────────
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const {
      role,
      search,
      page = "1",
      limit = "20",
      isActive,
      dateFrom,
      dateTo,
    } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = { isDeleted: false };
    if (role) {
  const roles = role.includes(',') ? role.split(',') : [role];
  where.role = { in: roles };
}
    if (isActive !== undefined) where.isActive = isActive === "true";
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo)
        where.createdAt.lte = new Date(
          new Date(dateTo).setHours(23, 59, 59, 999),
        );
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          avatarUrl: true,
          authProvider: true,
          driverProfile: {
            select: { licenseStatus: true, isOnline: true, rating: true },
          },
          businessProfile: { select: { companyName: true } },
          _count: { select: { bookingsAsCustomer: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.params.id, isDeleted: false },
      include: {
        driverProfile: true,
        businessProfile: true,
        bookingsAsCustomer: { orderBy: { createdAt: "desc" }, take: 5 },
        _count: {
          select: { bookingsAsCustomer: true, bookingsAsDriver: true },
        },
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    const validRoles = ["INDIVIDUAL", "BUSINESS", "DRIVER", "ADMIN"];
    if (!validRoles.includes(role))
      return res.status(400).json({ message: "Invalid role" });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });
    await audit(req.user!.id, "UPDATE_ROLE", "USER", req.params.id, {
      newRole: role,
    });
    res.json({ message: "Role updated", user: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const setUserActiveStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { isActive } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive },
    });
    await audit(
      req.user!.id,
      isActive ? "REACTIVATE_USER" : "DEACTIVATE_USER",
      "USER",
      req.params.id,
    );
    getIO()
      .to(`user:${req.params.id}`)
      .emit("account:status_changed", { isActive });
    res.json({
      message: `User ${isActive ? "activated" : "deactivated"}`,
      user: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const adminDeleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookingsAsCustomer: true, bookingsAsDriver: true },
        },
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hasHistory =
      user._count.bookingsAsCustomer > 0 || user._count.bookingsAsDriver > 0;

    if (hasHistory) {
      // Soft delete - anonymize PII, keep booking records intact
      await prisma.user.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          isActive: false,
          name: "[Deleted User]",
          email: `deleted_${id}@removed.invalid`,
          phone: null,
          avatarUrl: null,
          password: null,
          pushToken: null,
          verificationToken: null,
          resetToken: null,
          actionOtp: null,
        },
      });
    } else {
      // Hard delete - no booking history, safe to cascade
      await prisma.notification.deleteMany({ where: { userId: id } });
      await prisma.driverProfile.deleteMany({ where: { userId: id } });
      await prisma.businessProfile.deleteMany({ where: { userId: id } });
      await prisma.user.delete({ where: { id } });
    }

    await audit(
      req.user!.id,
      hasHistory ? "SOFT_DELETE_USER" : "HARD_DELETE_USER",
      "USER",
      id,
    );
    res.json({
      message: "User deleted",
      method: hasHistory ? "anonymized" : "hard_deleted",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ── BOOKING MANAGEMENT ─────────────────────────────────────────
export const getAllBookings = async (req: AuthRequest, res: Response) => {
  try {
    const {
      status,
      rideType,
      search,
      page = "1",
      limit = "20",
      dateFrom,
      dateTo,
    } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};
    if (status) where.status = status;
    if (rideType) where.rideType = rideType;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo)
        where.createdAt.lte = new Date(
          new Date(dateTo).setHours(23, 59, 59, 999),
        );
    }
    if (req.query.customerId) where.customerId = req.query.customerId as string;
    if (search) {
      where.OR = [
        { trackingId: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: { name: true, email: true, role: true, avatarUrl: true },
          },
          driver: {
            select: {
              name: true,
              phone: true,
              avatarUrl: true,
              driverProfile: {
                select: {
                  brandModel: true,
                  plateNumber: true,
                  vehicleColor: true,
                },
              },
            },
          },
          extensions: true,
          upgrade: true,
        },
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({ bookings, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const adminCancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (["COMPLETED", "CANCELLED"].includes(booking.status)) {
      return res.status(400).json({ message: "Cannot cancel this booking" });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancellationReason: reason ?? "Cancelled by admin",
      },
    });

    if (booking.driverId) {
      await prisma.driverProfile.update({
        where: { userId: booking.driverId },
        data: { isAvailable: true },
      });
      getIO().to(`user:${booking.driverId}`).emit("booking:updated", updated);
    }
    getIO().to(`user:${booking.customerId}`).emit("booking:updated", updated);

    await audit(req.user!.id, "CANCEL_BOOKING", "BOOKING", id, { reason });
    res.json({ message: "Booking cancelled", booking: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ── DRIVER MANAGEMENT ──────────────────────────────────────────
export const getAllDrivers = async (req: AuthRequest, res: Response) => {
  try {
    const {
      licenseStatus,
      isOnline,
      page = "1",
      limit = "20",
      dateFrom,
      dateTo,
    } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};
    if (licenseStatus) where.licenseStatus = licenseStatus;
    if (isOnline !== undefined) where.isOnline = isOnline === "true";

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo)
        where.createdAt.lte = new Date(
          new Date(dateTo).setHours(23, 59, 59, 999),
        );
    }

    const [drivers, total] = await Promise.all([
      prisma.driverProfile.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
              isActive: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.driverProfile.count({ where }),
    ]);

    res.json({ drivers, total });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Re-exports verifyDriverLicense from driver controller for convenience
// (it's already admin-only in the driver router)

// ── SETTINGS (PRICING) ─────────────────────────────────────────
export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await prisma.appSettings.findMany({
      orderBy: { key: "asc" },
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const updates: { key: string; value: string }[] = req.body.settings;
    if (!Array.isArray(updates))
      return res.status(400).json({ message: "settings must be an array" });

    const results = await Promise.all(
      updates.map(({ key, value }) =>
        prisma.appSettings.upsert({
          where: { key },
          update: { value, updatedBy: req.user!.id },
          create: { key, value, updatedBy: req.user!.id },
        }),
      ),
    );

    await audit(req.user!.id, "UPDATE_SETTINGS", "SETTINGS", undefined, {
      keys: updates.map((u) => u.key),
    });
    res.json({ message: "Settings updated", settings: results });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Public endpoint - frontend fetches prices without auth
export const getPublicPrices = async (req: any, res: Response) => {
  try {
    const settings = await prisma.appSettings.findMany();
    const prices: Record<string, number> = {};
    for (const s of settings) prices[s.key] = parseFloat(s.value);
    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ── PROMO CODES ────────────────────────────────────────────────
export const createPromo = async (req: AuthRequest, res: Response) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minBookingAmount,
      maxDiscount,
      usageLimit,
      expiresAt,
      targetType,
      targetUserIds,
      targetRole,
    } = req.body;

    const existing = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (existing)
      return res.status(400).json({ message: "Promo code already exists" });

    const promo = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue,
        minBookingAmount: minBookingAmount ?? null,
        maxDiscount: maxDiscount ?? null,
        usageLimit: usageLimit ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        targetType: targetType ?? "ALL",
        targetUserIds: targetUserIds ?? [],
        targetRole: targetRole ?? null,
        createdBy: req.user!.id,
      },
    });

    await audit(req.user!.id, "CREATE_PROMO", "SETTINGS", promo.id, {
      code: promo.code,
    });
    res.status(201).json({ message: "Promo created", promo });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAllPromos = async (req: AuthRequest, res: Response) => {
  try {
    const promos = await prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { usages: true } } },
    });
    res.json(promos);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const togglePromo = async (req: AuthRequest, res: Response) => {
  try {
    const promo = await prisma.promoCode.findUnique({
      where: { id: req.params.id },
    });
    if (!promo) return res.status(404).json({ message: "Promo not found" });

    const updated = await prisma.promoCode.update({
      where: { id: req.params.id },
      data: { isActive: !promo.isActive },
    });
    await audit(
      req.user!.id,
      updated.isActive ? "ENABLE_PROMO" : "DISABLE_PROMO",
      "SETTINGS",
      promo.id,
    );
    res.json({
      message: `Promo ${updated.isActive ? "enabled" : "disabled"}`,
      promo: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deletePromo = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.promoUsage.deleteMany({ where: { promoId: req.params.id } });
    await prisma.promoCode.delete({ where: { id: req.params.id } });
    await audit(req.user!.id, "DELETE_PROMO", "SETTINGS", req.params.id);
    res.json({ message: "Promo deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ── PROMO VALIDATION (called from booking flow) ───────────────
export const validatePromoCode = async (req: AuthRequest, res: Response) => {
  try {
    const { code, bookingAmount } = req.body;
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo || !promo.isActive)
      return res
        .status(404)
        .json({ message: "Invalid or inactive promo code" });
    if (promo.expiresAt && new Date() > promo.expiresAt)
      return res.status(400).json({ message: "Promo code has expired" });
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit)
      return res
        .status(400)
        .json({ message: "Promo code usage limit reached" });
    if (promo.minBookingAmount && bookingAmount < promo.minBookingAmount) {
      return res.status(400).json({
        message: `Minimum booking amount is ₦${promo.minBookingAmount.toLocaleString()}`,
      });
    }

    // Check targeting
    if (
      promo.targetType === "USER_SPECIFIC" &&
      !promo.targetUserIds.includes(userId)
    ) {
      return res
        .status(403)
        .json({ message: "This promo code is not available for your account" });
    }
    if (promo.targetType === "INDIVIDUAL" && user?.role !== "INDIVIDUAL") {
      return res
        .status(403)
        .json({ message: "This promo is for individual customers only" });
    }
    if (promo.targetType === "BUSINESS" && user?.role !== "BUSINESS") {
      return res
        .status(403)
        .json({ message: "This promo is for business customers only" });
    }

    // Check if user already used this promo
    const alreadyUsed = await prisma.promoUsage.findFirst({
      where: { promoId: promo.id, userId },
    });
    if (alreadyUsed)
      return res
        .status(400)
        .json({ message: "You have already used this promo code" });

    // Calculate discount
    let discountAmount = 0;
    if (promo.discountType === "PERCENTAGE") {
      discountAmount = (bookingAmount * promo.discountValue) / 100;
      if (promo.maxDiscount)
        discountAmount = Math.min(discountAmount, promo.maxDiscount);
    } else {
      discountAmount = Math.min(promo.discountValue, bookingAmount);
    }

    const finalAmount = bookingAmount - discountAmount;
    res.json({
      valid: true,
      discountAmount,
      finalAmount,
      promo: { code: promo.code, description: promo.description },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Call this after successful payment to log promo usage
export const recordPromoUsage = async (
  promoCode: string,
  userId: string,
  bookingId: string,
  discountAmount: number,
) => {
  const promo = await prisma.promoCode.findUnique({
    where: { code: promoCode.toUpperCase() },
  });
  if (!promo) return;
  await prisma.promoUsage.create({
    data: { promoId: promo.id, userId, bookingId, discountAmount },
  });
  await prisma.promoCode.update({
    where: { id: promo.id },
    data: { usedCount: { increment: 1 } },
  });
};

// ── AUDIT LOG ──────────────────────────────────────────────────
export const getAuditLog = async (req: AuthRequest, res: Response) => {
  try {
    const { page = "1", limit = "50" } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: { admin: { select: { name: true, email: true } } as any },
      }),
      prisma.adminAuditLog.count(),
    ]);
    res.json({ logs, total });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


export const assignPromoToUsers = async (req: AuthRequest, res: Response) => {
  try {
    const {
      userIds,
      // Existing promo path
      promoId,
      // New promo path
      code,
      description,
      discountValue,
      discountType,
      expiresInDays = 30,
      // Notification flags
      sendPush = true,
      sendEmail: doEmail = true,
    } = req.body;

    if (!userIds?.length) {
      return res.status(400).json({ message: "No users specified" });
    }

    let promo: any;

    if (promoId) {
      // ── Use existing promo ──
      promo = await prisma.promoCode.findUnique({ where: { id: promoId } });
      if (!promo) return res.status(404).json({ message: "Promo not found" });
      if (!promo.isActive)
        return res.status(400).json({ message: "Promo is not active" });
      if (promo.targetType === 'USER_SPECIFIC') {
    const merged = Array.from(new Set([...promo.targetUserIds, ...userIds]));
    promo = await prisma.promoCode.update({
      where: { id: promoId },
      data: { targetUserIds: merged },
    });
  }
    } else {
      // ── Create new promo on the fly ──
      if (!code || discountValue === undefined) {
        return res
          .status(400)
          .json({ message: "code and discountValue are required" });
      }
      const upperCode = code.toUpperCase();
      const existing = await prisma.promoCode.findUnique({
        where: { code: upperCode },
      });
      if (existing)
        return res.status(400).json({ message: "Promo code already exists" });

      const expiresAt = new Date(
        Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
      );

      promo = await prisma.promoCode.create({
        data: {
          code: upperCode,
          description: description ?? null,
          discountType: discountType ?? "PERCENTAGE",
          discountValue,
          usageLimit: userIds.length, // one use per targeted user
          expiresAt,
          targetType: "USER_SPECIFIC",
          targetUserIds: userIds,
          isActive: true,
          createdBy: req.user!.id,
        },
      });
    }

    // ── Fetch targeted users ──
    const users = await prisma.user.findMany({
      where: { id: { in: userIds }, isDeleted: false, isActive: true },
      select: { id: true, email: true, name: true },
    });

    if (!users.length) {
      return res.status(404).json({ message: "No valid users found" });
    }

    // ── Notify each user ──
    await Promise.allSettled(
      users.map(async (u) => {
        if (sendPush) {
          await createNotification(
            u.id,
            "🎉 You have a new promo!",
            `${promo.description ?? "Special offer"} - Code: ${promo.code}`,
            "PROMO_GRANTED",
            undefined,
          );
        }

        if (doEmail) {
          await sendPromoEmail(
            u.email,
            u.name,
            promo.code,
            promo.description ?? "Special offer just for you",
            promo.discountValue,
            promo.discountType,
            promo.expiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          );
        }
      }),
    );

    await audit(req.user!.id, "ASSIGN_PROMO", "SETTINGS", promo.id, {
      userIds,
      code: promo.code,
      notifiedPush: sendPush,
      notifiedEmail: doEmail,
    });

    res.status(201).json({
      message: `Promo "${promo.code}" assigned and ${sendPush || doEmail ? "notifications sent" : "no notifications sent"} to ${users.length} user(s)`,
      promo,
      notifiedCount: users.length,
    });
  } catch (error) {
    console.error("assignPromoToUsers error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
