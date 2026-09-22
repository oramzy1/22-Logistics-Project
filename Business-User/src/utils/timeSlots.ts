// export type PackageId = "3h" | "6h" | "10h" | "multi" | "airport";

// function fmt(h: number) {
//   const period = h < 12 ? "AM" : "PM";
//   const hour = h % 12 === 0 ? 12 : h % 12;
//   return `${hour}:00 ${period}`;
// }

// export function generateTimeSlots(pkgId: PackageId): string[] {
//   if (pkgId === "multi") {
//     return [
//       "10-20 hours",
//       "20-30 hours",
//       "30-40 hours",
//       "40-50 hours",
//       "50-60 hours",
//       "Custom start time (contact support)",
//     ];
//   }

//   const duration = pkgId === "3h" ? 3 : pkgId === "6h" ? 6 : 10;
//   const slots: string[] = [];

//   for (let h = 8; h + duration <= 22; h++) {
//     slots.push(`${fmt(h)} – ${fmt(h + duration)}`);
//   }
//   return slots;
// }


export type PackageId =
  | "3h"
  | "6h"
  | "10h"
  | "multi"
  | "airport";

export type AirportService =
  | "AIRPORT_PICKUP"
  | "AIRPORT_DROPOFF"
  | "AIRPORT_ROUND_TRIP";

export type MultiDayTripType = "INTRA_STATE" | "INTER_STATE";

export const OPERATING_START_HOUR = 7;
export const OPERATING_END_HOUR = 22;
export const ADVANCE_BOOKING_HOURS = 2;

export const PACKAGE_DURATION_HOURS: Record<PackageId, number | null> = {
  "3h": 3,
  "6h": 6,
  "10h": 10,
  airport: 3,
  multi: null,
};

export function combinePickupDateTime(date: Date | null, time: Date | null) {
  if (!date || !time) return null;

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.getHours(),
    time.getMinutes(),
    0,
    0,
  );
}

export function getMinimumPickupDateTime(now = new Date()) {
  return new Date(now.getTime() + ADVANCE_BOOKING_HOURS * 60 * 60 * 1000);
}

export function isWithinOperatingHours(date: Date) {
  const minutes = date.getHours() * 60 + date.getMinutes();
  return (
    minutes >= OPERATING_START_HOUR * 60 &&
    minutes <= OPERATING_END_HOUR * 60
  );
}

export function isValidPickupDateTime(date: Date, now = new Date()) {
  return date.getTime() >= getMinimumPickupDateTime(now).getTime();
}

export function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export function formatTime(date: Date) {
  return date.toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function calculateDropoffTime(pkg: PackageId, pickupAt: Date | null, multiDayCount = 1) {
  if (!pickupAt) return null;

  if (pkg === "multi") {
    return addHours(pickupAt, multiDayCount * 24);
  }

  const duration = PACKAGE_DURATION_HOURS[pkg];
  if (!duration) return null;

  return addHours(pickupAt, duration);
}

export function isExtensionAllowed(currentEndAt: Date, extraHours: number) {
  const nextEndAt = addHours(currentEndAt, extraHours);
  return nextEndAt.getHours() * 60 + nextEndAt.getMinutes() <= OPERATING_END_HOUR * 60;
}