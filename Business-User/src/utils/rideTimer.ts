// Business-User/src/utils/rideTimer.ts

export type RideTimeResult =
  | { type: 'not_started'; label: string }
  | { type: 'countdown'; hoursLeft: number; minutesLeft: number; totalMinutes: number; percentUsed: number; hasExtension: boolean; extensionMinutes: number }
  | { type: 'multiday'; daysLeft: number; hoursLeft: number; minutesLeft: number; label: string; timeUsed: string }
  | { type: 'airport'; label: string; timeUsed: string }
  | { type: 'ended'; label: string }
  | { type: 'unknown'; label: string };

const PACKAGE_DURATION_HOURS: Record<string, number> = {
  '3 Hours': 3,
  '6 Hours': 6,
  '10 Hours': 10,
};

// Parse time slot string like "8:00 AM" → hour offset from midnight in minutes
function parseTimeSlot(timeSlot: string | undefined): number | null {
  if (!timeSlot) return null;
  // Handle formats like "8:00 AM", "10:30 AM", "2:00 PM"
  const match = timeSlot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// Build the expected start time from pickupDate + timeSlot
function buildExpectedStart(scheduledAt: string, timeSlot?: string): Date {
  const base = new Date(scheduledAt);
  const slotMinutes = parseTimeSlot(timeSlot);
  if (slotMinutes !== null) {
    // scheduledAt already has the correct datetime — use it as-is
    // but if a timeSlot is provided separately, reconstruct
    const d = new Date(base);
    d.setHours(Math.floor(slotMinutes / 60), slotMinutes % 60, 0, 0);
    return d;
  }
  return base;
}

export function getRideTimeRemaining(
  packageType: string,
  scheduledAt: string,
  options?: {
    tripStartedAt?: string | null;      // when driver pressed "Start Trip"
    extensionMinutes?: number;           // total paid extension minutes added
    timeSlot?: string;                   // e.g. "8:00 AM" for display
  }
): RideTimeResult {
  const now = new Date();
  const expectedStart = buildExpectedStart(scheduledAt, options?.timeSlot);
  const tripStartedAt = options?.tripStartedAt ? new Date(options.tripStartedAt) : null;
  const extensionMinutes = options?.extensionMinutes ?? 0;

  // ── AIRPORT ─────────────────────────────────────────────────
  if (packageType === 'Airport Schedule') {
    const timeUsed = tripStartedAt
      ? formatElapsed(now.getTime() - tripStartedAt.getTime())
      : '—';

    if (!tripStartedAt) {
      return { type: 'not_started', label: 'Awaiting driver departure' };
    }
    return { type: 'airport', label: 'Airport ride in progress', timeUsed };
  }

  // ── MULTI-DAY ────────────────────────────────────────────────
  if (packageType === 'Multi-day') {
    const timeUsed = tripStartedAt
      ? formatElapsed(now.getTime() - tripStartedAt.getTime())
      : '—';

    if (!tripStartedAt) {
      return { type: 'not_started', label: 'Awaiting driver to start' };
    }

    // Multi-day: just show time used, no fixed end
    const elapsedMs = now.getTime() - tripStartedAt.getTime();
    const remainingMs = 24 * 3600000 - elapsedMs; // treat 1 day as unit
    const daysLeft = Math.max(0, Math.floor(remainingMs / 86400000));
    const hoursLeft = Math.max(0, Math.floor((remainingMs % 86400000) / 3600000));
    const minutesLeft = Math.max(0, Math.floor((remainingMs % 3600000) / 60000));

    return {
      type: 'multiday',
      daysLeft,
      hoursLeft,
      minutesLeft,
      label: `${timeUsed} used`,
      timeUsed,
    };
  }

  // ── STANDARD HOURLY PACKAGES ─────────────────────────────────
  const durationHours = PACKAGE_DURATION_HOURS[packageType];
  if (!durationHours) return { type: 'unknown', label: packageType };

  // Trip not started yet
  if (!tripStartedAt) {
    return { type: 'not_started', label: 'Not yet started' };
  }

  const totalBaseMinutes = durationHours * 60;
  const totalMinutes = totalBaseMinutes + extensionMinutes;
  const elapsedMs = now.getTime() - tripStartedAt.getTime();
  const elapsedMinutes = Math.floor(elapsedMs / 60000);
  const remainingMinutes = totalMinutes - elapsedMinutes;

  if (remainingMinutes <= 0) return { type: 'ended', label: 'Trip ended' };

  const hoursLeft = Math.floor(remainingMinutes / 60);
  const minutesLeft = remainingMinutes % 60;
  const percentUsed = Math.min((elapsedMinutes / totalMinutes) * 100, 100);

  return {
    type: 'countdown',
    hoursLeft,
    minutesLeft,
    totalMinutes,
    percentUsed,
    hasExtension: extensionMinutes > 0,
    extensionMinutes,
  };
}

function formatElapsed(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function getRideTimeLabel(
  packageType: string,
  scheduledAt: string,
  options?: Parameters<typeof getRideTimeRemaining>[2]
): string {
  const result = getRideTimeRemaining(packageType, scheduledAt, options);
  switch (result.type) {
    case 'not_started': return result.label;
    case 'countdown': {
      const base = result.hoursLeft > 0
        ? `${result.hoursLeft}h ${result.minutesLeft}m left`
        : `${result.minutesLeft}m left`;
      return result.hasExtension ? `${base} (ext)` : base;
    }
    case 'multiday': return result.timeUsed + ' used';
    case 'airport': return result.label;
    case 'ended': return result.label;
    case 'unknown': return result.label;
  }
}

// Returns delay in minutes between expected start and actual start
// Returns null if trip hasn't started yet or started on time
export function getTripDelayMinutes(
  scheduledAt: string,
  tripStartedAt: string | null | undefined,
): number | null {
  if (!tripStartedAt) return null;
  const expected = new Date(scheduledAt);
  const actual = new Date(tripStartedAt);
  const delayMs = actual.getTime() - expected.getTime();
  const delayMinutes = Math.floor(delayMs / 60000);
  return delayMinutes > 0 ? delayMinutes : null;
}