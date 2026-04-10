export type PackageId = "3h" | "6h" | "10h" | "multi" | "airport";

function fmt(h: number) {
  const period = h < 12 ? "AM" : "PM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:00 ${period}`;
}

export function generateTimeSlots(pkgId: PackageId): string[] {
  if (pkgId === "multi") {
    return [
      "10-20 hours",
      "20-30 hours",
      "30-40 hours",
      "40-50 hours",
      "50-60 hours",
      "Custom start time (contact support)",
    ];
  }

  const duration = pkgId === "3h" ? 3 : pkgId === "6h" ? 6 : 10;
  const slots: string[] = [];

  for (let h = 8; h + duration <= 22; h++) {
    slots.push(`${fmt(h)} – ${fmt(h + duration)}`);
  }
  return slots;
}