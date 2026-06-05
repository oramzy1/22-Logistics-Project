import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getIO } from '../lib/socket';

export const addStop = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, address, lat, lng } = req.body;

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, driverId: req.user!.id, status: 'IN_PROGRESS' },
    });
    if (!booking) return res.status(404).json({ message: 'Active trip not found' });

    const stopCount = await prisma.tripStop.count({ where: { bookingId } });

    const stop = await prisma.tripStop.create({
      data: {
        bookingId,
        driverId: req.user!.id,
        stopOrder: stopCount + 1,
        address,
        lat: lat ?? null,
        lng: lng ?? null,
      },
    });

    // Notify customer
    getIO().to(`user:${booking.customerId}`).emit('trip:stop_added', {
      bookingId,
      stop,
    });

    res.status(201).json({ stop });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getTripStops = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.params;
    const stops = await prisma.tripStop.findMany({
      where: { bookingId },
      orderBy: { stopOrder: 'asc' },
    });
    res.json(stops);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// ── ADMIN DEMOGRAPHICS ────────────────────────────────────────
export const getStopDemographics = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = '10' } = req.query as Record<string, string>;

    const [topPickups, topStops, topDropoffs, mostStopsPerUser, driverStopLeaderboard] =
      await Promise.all([
        // Top pickup locations (from Booking)
        prisma.$queryRaw<{ address: string; count: string }[]>`
          SELECT "pickupAddress" AS address, COUNT(*)::text AS count
          FROM "Booking"
          WHERE "paymentStatus" = 'PAID'
          GROUP BY "pickupAddress"
          ORDER BY COUNT(*) DESC
          LIMIT ${parseInt(limit)}
        `,

        // Top intermediate stops
        prisma.$queryRaw<{ address: string; count: string }[]>`
          SELECT address, COUNT(*)::text AS count
          FROM "TripStop"
          GROUP BY address
          ORDER BY COUNT(*) DESC
          LIMIT ${parseInt(limit)}
        `,

        // Top dropoff locations
        prisma.$queryRaw<{ address: string; count: string }[]>`
          SELECT "dropoffAddress" AS address, COUNT(*)::text AS count
          FROM "Booking"
          WHERE "paymentStatus" = 'PAID'
          GROUP BY "dropoffAddress"
          ORDER BY COUNT(*) DESC
          LIMIT ${parseInt(limit)}
        `,

        // Users with highest total stops across all trips
        prisma.$queryRaw<{ name: string; email: string; totalStops: string }[]>`
          SELECT u.name, u.email, COUNT(ts.id)::text AS "totalStops"
          FROM "TripStop" ts
          JOIN "Booking" b ON ts."bookingId" = b.id
          JOIN "User" u ON b."customerId" = u.id
          GROUP BY u.id, u.name, u.email
          ORDER BY COUNT(ts.id) DESC
          LIMIT ${parseInt(limit)}
        `,

        // Drivers with most stops recorded
        prisma.$queryRaw<{ name: string; totalStops: string }[]>`
          SELECT u.name, COUNT(ts.id)::text AS "totalStops"
          FROM "TripStop" ts
          JOIN "User" u ON ts."driverId" = u.id
          GROUP BY u.id, u.name
          ORDER BY COUNT(ts.id) DESC
          LIMIT ${parseInt(limit)}
        `,
      ]);

    res.json({
      topPickups: topPickups.map(r => ({ address: r.address, count: parseInt(r.count) })),
      topStops: topStops.map(r => ({ address: r.address, count: parseInt(r.count) })),
      topDropoffs: topDropoffs.map(r => ({ address: r.address, count: parseInt(r.count) })),
      mostStopsPerUser: mostStopsPerUser.map(r => ({ ...r, totalStops: parseInt(r.totalStops) })),
      driverStopLeaderboard: driverStopLeaderboard.map(r => ({ ...r, totalStops: parseInt(r.totalStops) })),
    });
  } catch (error) {
    console.error('getStopDemographics error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};