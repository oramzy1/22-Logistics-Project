import { useCallback, useState } from "react";
import apiClient from "@/api/api"; // ⚠ swap for the same axios instance usePrices() uses
import type { PackageId } from "@/src/utils/timeSlots";



const api = apiClient;

export type HomeRide = {
  id: string;
  packageId: PackageId;
  title: string;
  startsAt: Date;
  purpose?: string;
  status: string;
  confirmed: boolean;
  driverAssigned: boolean;
  vehicleAssigned: boolean;
};

// ⚠ Set to your "my upcoming bookings" endpoint.
const ENDPOINT = "/bookings/upcoming";

// Statuses that mean the ride is over. ARRIVED / IN_PROGRESS stay visible.
const FINISHED = new Set(["COMPLETED", "CANCELLED"]);

const PACKAGE_LABEL: Record<PackageId, string> = {
  "3h": "3 Hours",
  "6h": "6 Hours",
  "10h": "10 Hours",
  multi: "Multi-Day",
  airport: "Airport",
};

/**
 * ⚠ ADAPTER — the ONLY place that knows the backend response shape.
 * Field names below are best guesses; adjust them to match your booking payload.
 */
function toHomeRide(raw: any): HomeRide {
  const packageId = (raw.packageId ?? raw.package ?? "3h") as PackageId;
  return {
    id: String(raw.id),
    packageId,
    title: raw.title ?? `${PACKAGE_LABEL[packageId] ?? "Scheduled"} Schedule`,
    startsAt: new Date(raw.startTime ?? raw.scheduledAt),
    purpose: raw.purpose ?? undefined,
    status: String(raw.status ?? ""),
    confirmed: raw.status === "CONFIRMED" || raw.status === "ASSIGNED" || raw.status === "ARRIVED",
    driverAssigned: !!(raw.driver ?? raw.driverId),
    vehicleAssigned: !!(raw.vehicle ?? raw.vehicleId),
  };
}

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

export function useTodaySchedule() {
  const [ride, setRide] = useState<HomeRide | null>(null);
  const [loading, setLoading] = useState(true);

  // Rethrows so the screen's existing 401 handling still works.
  const refetch = useCallback(async () => {
    try {
      const { data } = await api.get(ENDPOINT);
      const list: any[] = Array.isArray(data) ? data : data?.data ?? [];

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const next = list
        .map(toHomeRide)
        .filter((r) => !FINISHED.has(r.status) && r.startsAt >= startOfToday)
        .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

      setRide(next[0] ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    ride,
    isToday: !!ride && sameDay(ride.startsAt, new Date()),
    loading,
    refetch,
  };
}
