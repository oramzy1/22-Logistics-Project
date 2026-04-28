// backend/src/lib/tripDelayMonitor.ts
import prisma from "./prisma";
import { notifyAdmins } from "./notifications";
import { emitToAdmin } from "./socket";
import { sendTripDelayEmail } from "./email.service"; // add this template

const DELAY_THRESHOLD_MINUTES = 15;
const checkedBookings = new Set<string>(); // in-memory dedup per server restart

export async function checkTripDelays() {
  const now = new Date();
  const thresholdAgo = new Date(
    now.getTime() - DELAY_THRESHOLD_MINUTES * 60000,
  );

  // Find ACCEPTED bookings where scheduledAt was 15+ min ago but trip hasn't started
  const delayedBookings = await prisma.booking.findMany({
    where: {
      status: "ACCEPTED", // driver assigned but not started
      scheduledAt: { lte: thresholdAgo },
      // acceptedByDriverAt exists means driver is assigned
      acceptedByDriverAt: { not: null },
    },
    include: {
      driver: { select: { name: true, phone: true } },
      customer: { select: { name: true } },
    },
  });

  for (const booking of delayedBookings) {
    if (checkedBookings.has(booking.id)) continue; // already notified
    checkedBookings.add(booking.id);

    const delayMinutes = Math.floor(
      (now.getTime() - new Date(booking.scheduledAt).getTime()) / 60000,
    );

    try {
      await notifyAdmins(
        "⚠️ Trip Delay Alert",
        `Driver ${booking.driver?.name ?? "Unknown"} has not started booking ${booking.trackingId} — ${delayMinutes} min late. Customer: ${booking.customer?.name}. Driver phone: ${booking.driver?.phone ?? "N/A"}`,
        "TRIP_DELAY",
        booking.id,
      );

      emitToAdmin("admin:trip_delay", {
        bookingId: booking.id,
        trackingId: booking.trackingId,
        driverName: booking.driver?.name,
        driverPhone: booking.driver?.phone,
        customerName: booking.customer?.name,
        delayMinutes,
        scheduledAt: booking.scheduledAt,
      });
    } catch (e) {
      console.error("Trip delay notification failed:", e);
    }
    const adminUsers = await prisma.user.findMany({
  where: { role: 'ADMIN', isActive: true },
  select: { email: true },
});
for (const admin of adminUsers) {
  sendTripDelayEmail(
    admin.email,
    booking.driver?.name ?? 'Unknown',
    booking.trackingId ?? booking.id,
    delayMinutes,
    booking.driver?.phone ?? 'N/A',
    booking.customer?.name ?? 'Unknown',
  );
}
  }
}
