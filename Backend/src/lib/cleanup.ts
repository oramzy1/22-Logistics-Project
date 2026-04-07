import prisma from './prisma';

export async function cleanupStaleBookings() {
  const deleted = await prisma.booking.deleteMany({
    where: {
      paymentStatus: 'UNPAID',
      createdAt: { lt: new Date(Date.now() - 30 * 60 * 1000) },
    },
  });
  if (deleted.count > 0) {
    console.log(`🧹 Cleaned up ${deleted.count} stale unpaid bookings`);
  }
}

export async function expireRideRequests() {
  const expired = await prisma.rideRequest.updateMany({
    where: {
      status: 'PENDING',
      expiresAt: { lt: new Date() },
    },
    data: { status: 'EXPIRED' },
  });
  if (expired.count > 0) {
    console.log(`⏰ Expired ${expired.count} ride requests`);
  }
}