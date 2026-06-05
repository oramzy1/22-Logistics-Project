import prisma from "./prisma";
import { createNotification, notifyAdmins } from "./notifications";
import { sendEmail } from "./email.service";

// Parse "8:00 AM" style time slots into today's Date
function parseTimeSlot(slot: string, referenceDate: Date): Date | null {
  // Slot format: "8:00 AM", "10:30 AM", "2:00 PM" etc.
  const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  const d = new Date(referenceDate);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

// Duration in minutes for each package type
const PACKAGE_DURATION: Record<string, number> = {
  "3 Hours": 180,
  "6 Hours": 360,
  "10 Hours": 600,
};

// Which reminder keys we've already sent - stored in AppSettings with key = `reminder:${bookingId}:${type}`
async function hasReminder(bookingId: string, type: string): Promise<boolean> {
  const key = `reminder:${bookingId}:${type}`;
  const row = await prisma.appSettings.findUnique({ where: { key } });
  return !!row;
}

async function markReminder(bookingId: string, type: string) {
  const key = `reminder:${bookingId}:${type}`;
  await prisma.appSettings.upsert({
    where: { key },
    update: { value: new Date().toISOString() },
    create: { key, value: new Date().toISOString(), updatedBy: "system" },
  });
}

async function sendReminderNotification(
  userId: string,
  title: string,
  body: string,
  bookingId: string,
  email?: string,
  emailSubject?: string,
) {
  await createNotification(userId, title, body, "BOOKING_REMINDER", bookingId);
  if (email && emailSubject) {
    await sendEmail(
      email,
      emailSubject,
      `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:16px">
        <h2 style="color:#0B1B2B">${title}</h2>
        <p style="color:#374151">${body}</p>
        <p style="color:#9CA3AF;font-size:12px;text-align:center;margin-top:24px">© 22Logistics - Moving you forward.</p>
      </div>
    `,
    );
  }
}

export async function runReminderCheck() {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 60 * 1000); // 1 min ago (polling window)

  // Fetch all active bookings that are relevant (package types with durations)
  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ["AWAITING_DRIVER", "ACCEPTED", "ARRIVED", "IN_PROGRESS"] },
      packageType: { in: ["3 Hours", "6 Hours", "10 Hours"] },
      paymentStatus: "PAID",
    },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      driver: { select: { id: true, name: true, email: true } },
    },
  });

  for (const booking of bookings) {
    const duration = PACKAGE_DURATION[booking.packageType ?? ""];
    if (!duration) continue;

    // Parse the time slot from booking.duration field (stores selected slot like "8:00 AM")
    const slotTime = booking.duration
      ? parseTimeSlot(booking.duration, booking.scheduledAt)
      : null;
    if (!slotTime) continue;

    const slotMs = slotTime.getTime();
    const nowMs = now.getTime();
    const durationMs = duration * 60 * 1000;

    const customerEmail = booking.customer?.email;
    const customerId = booking.customer?.id ?? booking.customerId;
    const driverId = booking.driver?.id ?? booking.driverId;
    const driverEmail = booking.driver?.email;
    const trackingId = booking.trackingId ?? booking.id;

    // ── AWAITING_DRIVER: Admin reminders if unaccepted ──────────────
    if (booking.status === "AWAITING_DRIVER") {
      const minus60 = slotMs - 60 * 60 * 1000;
      const minus30 = slotMs - 30 * 60 * 1000;

      if (
        nowMs >= minus60 &&
        nowMs < minus60 + 60000 &&
        !(await hasReminder(booking.id, "unaccepted_60"))
      ) {
        await markReminder(booking.id, "unaccepted_60");
        await notifyAdmins(
          "⚠️ Ride Unaccepted - 1 Hour to Start",
          `Booking ${trackingId} for ${booking.packageType} at ${booking.duration} has no driver yet. 60 minutes to slot time.`,
          "BOOKING_REMINDER",
          booking.id,
        );
        const admins = await prisma.user.findMany({
          where: { role: "ADMIN", isActive: true },
          select: { email: true },
        });
        admins.forEach((a) =>
          sendReminderNotification(
            "",
            `⚠️ Unaccepted Ride - 1hr to Start`,
            `Booking ${trackingId} (${booking.packageType}) starts at ${booking.duration}. No driver assigned yet.`,
            booking.id,
            a.email,
            `⚠️ Ride ${trackingId} Unaccepted - 1hr Remaining`,
          ),
        );
      }

      if (
        nowMs >= minus30 &&
        nowMs < minus30 + 60000 &&
        !(await hasReminder(booking.id, "unaccepted_30"))
      ) {
        await markReminder(booking.id, "unaccepted_30");
        await notifyAdmins(
          "🚨 Ride Still Unaccepted - 30 Mins to Start",
          `Booking ${trackingId} still has no driver. 30 minutes to slot time ${booking.duration}.`,
          "BOOKING_REMINDER",
          booking.id,
        );
        const admins = await prisma.user.findMany({
          where: { role: "ADMIN", isActive: true },
          select: { email: true },
        });
        admins.forEach((a) =>
          sendReminderNotification(
            "",
            `🚨 Unaccepted Ride - 30min to Start`,
            `Booking ${trackingId} (${booking.packageType}) starts at ${booking.duration}. URGENT: No driver assigned.`,
            booking.id,
            a.email,
            `🚨 Ride ${trackingId} Still Unaccepted`,
          ),
        );
      }
    }

    // ── ACCEPTED / ARRIVED: Pre-start reminders to driver + user ────
    if (booking.status === "ACCEPTED" || booking.status === "ARRIVED") {
      const minus30 = slotMs - 30 * 60 * 1000;
      const minus5 = slotMs - 5 * 60 * 1000;

      // 30 mins before slot - remind driver and user
      if (
        nowMs >= minus30 &&
        nowMs < minus30 + 60000 &&
        !(await hasReminder(booking.id, "prestart_30"))
      ) {
        await markReminder(booking.id, "prestart_30");
        const msg = `Your ${booking.packageType} ride starts at ${booking.duration}. 30 minutes remaining.`;
        if (driverId)
          await sendReminderNotification(
            driverId,
            "⏰ Ride Starts in 30 Minutes",
            msg,
            booking.id,
            driverEmail,
            `⏰ Ride ${trackingId} Starts Soon`,
          );
        await sendReminderNotification(
          customerId,
          "⏰ Your Ride Starts in 30 Minutes",
          msg,
          booking.id,
          customerEmail,
          `⏰ Your Ride Starts Soon`,
        );
      }

      // 5 mins before slot
      if (
        nowMs >= minus5 &&
        nowMs < minus5 + 60000 &&
        !(await hasReminder(booking.id, "prestart_5"))
      ) {
        await markReminder(booking.id, "prestart_5");
        const msg = `Your ${booking.packageType} ride starts in 5 minutes at ${booking.duration}. Please be ready.`;
        if (driverId)
          await sendReminderNotification(
            driverId,
            "🔔 Ride Starts in 5 Minutes",
            msg,
            booking.id,
            driverEmail,
            `🔔 Ride ${trackingId} - 5 Min Alert`,
          );
        await sendReminderNotification(
          customerId,
          "🔔 Your Ride Starts in 5 Minutes",
          msg,
          booking.id,
          customerEmail,
          `🔔 Your Ride - 5 Min Alert`,
        );
      }
    }
    // 5 mins AFTER slot - trip hasn't started, alert admin
    const plus5 = slotMs + 5 * 60 * 1000;
    const notYetStarted = ["ACCEPTED", "ARRIVED"].includes(booking.status);
    if (
      notYetStarted &&
      nowMs >= plus5 &&
      nowMs < plus5 + 60000 &&
      !(await hasReminder(booking.id, "late_start"))
    ) {
      await markReminder(booking.id, "late_start");
      const driverInfo = `Driver: ${booking.driver?.name ?? "Unknown"} | Customer: ${booking.customer?.name ?? "Unknown"} | Tracking: ${trackingId}`;
      await notifyAdmins(
        "🚨 Trip Not Started - Past Slot Time",
        `Booking ${trackingId} was scheduled for ${booking.duration} but has not started. ${driverInfo}`,
        "BOOKING_REMINDER",
        booking.id,
      );
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN", isActive: true },
        select: { email: true },
      });
      admins.forEach((a) =>
        sendReminderNotification(
          "",
          "🚨 Trip Not Started",
          `${driverInfo}. The ride slot was ${booking.duration} and the trip has not been started.`,
          booking.id,
          a.email,
          `🚨 Booking ${trackingId} Not Started`,
        ),
      );
    }

    // ── IN_PROGRESS: Mid-ride and end reminders ──────────────────────
    if (booking.status === "IN_PROGRESS") {
      // Use updatedAt as trip start time (set when status changed to IN_PROGRESS)
      const tripStartMs = new Date(booking.updatedAt).getTime();
      const halfMs = tripStartMs + durationMs / 2;
      const end10Ms = tripStartMs + durationMs - 10 * 60 * 1000;
      const end20Ms = tripStartMs + durationMs - 20 * 60 * 1000;
      const end30Ms = tripStartMs + durationMs - 30 * 60 * 1000;
      const startPlus10Ms = slotMs + 10 * 60 * 1000; // 10 mins after slot start

      // 10 mins after slot start - "ride has begun" confirmation
      if (
        nowMs >= startPlus10Ms &&
        nowMs < startPlus10Ms + 60000 &&
        !(await hasReminder(booking.id, "started_10"))
      ) {
        await markReminder(booking.id, "started_10");
        const timeLeft = duration;
        const msg = `Your ${booking.packageType} ride is underway. You have ${timeLeft} minutes total.`;
        if (driverId)
          await sendReminderNotification(
            driverId,
            "Ride In Progress",
            msg,
            booking.id,
            driverEmail,
            `Ride ${trackingId} - In Progress`,
          );
        await sendReminderNotification(
          customerId,
          "Your Ride Is Underway",
          msg,
          booking.id,
          customerEmail,
          `Your Ride ${trackingId} - In Progress`,
        );
      }

      // Halfway reminder
      if (
        nowMs >= halfMs &&
        nowMs < halfMs + 60000 &&
        !(await hasReminder(booking.id, "halfway"))
      ) {
        await markReminder(booking.id, "halfway");
        const halfHours = duration / 2 / 60;
        const msg = `You're halfway through your ${booking.packageType} ride. ${halfHours} hour(s) remaining.`;
        if (driverId)
          await sendReminderNotification(
            driverId,
            "⏱️ Halfway Through Ride",
            msg,
            booking.id,
            driverEmail,
            `⏱️ Ride ${trackingId} - Halfway`,
          );
        await sendReminderNotification(
          customerId,
          "⏱️ Halfway Through Your Ride",
          msg,
          booking.id,
          customerEmail,
          `⏱️ Your Ride ${trackingId} - Halfway`,
        );
      }

      // 30 mins before end
      if (
        nowMs >= end30Ms &&
        nowMs < end30Ms + 60000 &&
        !(await hasReminder(booking.id, "end_30"))
      ) {
        await markReminder(booking.id, "end_30");
        const msg = `30 minutes remaining on your ${booking.packageType} ride. Consider extending if needed.`;
        if (driverId)
          await sendReminderNotification(
            driverId,
            "⏰ 30 Minutes Remaining",
            msg,
            booking.id,
            driverEmail,
            `⏰ Ride ${trackingId} - 30min Left`,
          );
        await sendReminderNotification(
          customerId,
          "⏰ 30 Minutes Left on Your Ride",
          msg,
          booking.id,
          customerEmail,
          `⏰ Your Ride ${trackingId} - 30min Left`,
        );
      }

      // 20 mins before end
      if (
        nowMs >= end20Ms &&
        nowMs < end20Ms + 60000 &&
        !(await hasReminder(booking.id, "end_20"))
      ) {
        await markReminder(booking.id, "end_20");
        const msg = `20 minutes remaining on your ${booking.packageType} ride.`;
        if (driverId)
          await sendReminderNotification(
            driverId,
            "⏰ 20 Minutes Remaining",
            msg,
            booking.id,
            driverEmail,
            `⏰ Ride ${trackingId} - 20min Left`,
          );
        await sendReminderNotification(
          customerId,
          "⏰ 20 Minutes Left on Your Ride",
          msg,
          booking.id,
          customerEmail,
          `⏰ Your Ride ${trackingId} - 20min Left`,
        );
      }

      // 10 mins before end
      if (
        nowMs >= end10Ms &&
        nowMs < end10Ms + 60000 &&
        !(await hasReminder(booking.id, "end_10"))
      ) {
        await markReminder(booking.id, "end_10");
        const msg = `10 minutes remaining on your ${booking.packageType} ride. You can extend from the app.`;
        if (driverId)
          await sendReminderNotification(
            driverId,
            "🔔 10 Minutes Remaining",
            msg,
            booking.id,
            driverEmail,
            `🔔 Ride ${trackingId} - 10min Left`,
          );
        await sendReminderNotification(
          customerId,
          "🔔 10 Minutes Left - Extend Your Ride?",
          msg,
          booking.id,
          customerEmail,
          `🔔 Your Ride ${trackingId} - 10min Left`,
        );
      }
    }
  }
}
