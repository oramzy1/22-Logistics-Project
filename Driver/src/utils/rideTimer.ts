export type RideTimeResult =
  | { type: 'countdown'; hoursLeft: number; minutesLeft: number; totalMinutes: number; percentUsed: number }
  | { type: 'multiday'; daysLeft: number; label: string }
  | { type: 'airport'; label: string }
  | { type: 'ended'; label: string }
  | { type: 'unknown'; label: string };

const PACKAGE_DURATION_HOURS: Record<string, number> = {
  '3 Hours': 3,
  '6 Hours': 6,
  '10 Hours': 10,
};

const MULTIDAY_DURATION_HOURS = 24;

export function getRideTimeRemaining(
  packageType: string,
  scheduledAt: string,
): RideTimeResult {
  const now = new Date();
  const start = new Date(scheduledAt);
  const elapsedMs = now.getTime() - start.getTime();
  const elapsedMinutes = Math.floor(elapsedMs / 60000);

  // Airport ride
  if (packageType === 'Airport Schedule') {
    const diffMs = start.getTime() - now.getTime();
    if (diffMs > 0) {
      const hoursUntil = Math.floor(diffMs / 3600000);
      const minsUntil = Math.floor((diffMs % 3600000) / 60000);
      return {
        type: 'airport',
        label: hoursUntil > 0
          ? `Pickup in ${hoursUntil}h ${minsUntil}m`
          : `Pickup in ${minsUntil}m`,
      };
    }
    return { type: 'airport', label: 'Airport ride in progress' };
  }

  // Multi-day ride
  if (packageType === 'Multi-day') {
    const endTime = new Date(start.getTime() + MULTIDAY_DURATION_HOURS * 3600000);
    const remainingMs = endTime.getTime() - now.getTime();
    if (remainingMs <= 0) return { type: 'ended', label: 'Trip ended' };
    const daysLeft = Math.ceil(remainingMs / 86400000);
    const hoursLeft = Math.floor(remainingMs / 3600000);
    const minsLeft = Math.floor((remainingMs % 3600000) / 60000);
    return {
      type: 'multiday',
      daysLeft,
      label: daysLeft >= 1
        ? `${daysLeft}d remaining`
        : `${hoursLeft}h ${minsLeft}m remaining`,
    };
  }

  // Standard hourly packages
  const durationHours = PACKAGE_DURATION_HOURS[packageType];
  if (!durationHours) return { type: 'unknown', label: packageType };

  const totalMinutes = durationHours * 60;
  const remainingMinutes = totalMinutes - elapsedMinutes;

  if (remainingMinutes <= 0) return { type: 'ended', label: 'Trip ended' };

  const hoursLeft = Math.floor(remainingMinutes / 60);
  const minutesLeft = remainingMinutes % 60;
  const percentUsed = Math.min((elapsedMinutes / totalMinutes) * 100, 100);

  return { type: 'countdown', hoursLeft, minutesLeft, totalMinutes, percentUsed };
}

// Convenience label for display
export function getRideTimeLabel(packageType: string, scheduledAt: string): string {
  const result = getRideTimeRemaining(packageType, scheduledAt);
  switch (result.type) {
    case 'countdown':
      return result.hoursLeft > 0
        ? `${result.hoursLeft}h ${result.minutesLeft}m left`
        : `${result.minutesLeft}m left`;
    case 'multiday':
    case 'airport':
    case 'ended':
    case 'unknown':
      return result.label;
  }
}