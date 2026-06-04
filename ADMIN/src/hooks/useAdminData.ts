import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ── Dashboard ───────────────────────────────────────────────────
export const useDashboard = () =>
  useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<any>("/admin/dashboard"),
    refetchInterval: 30000,
  });

export const useChartData = (period: string, rideType: string) =>
  useQuery({
    queryKey: ["charts", period, rideType],
    queryFn: () =>
      api.get<any>(`/admin/charts?period=${period}&rideType=${rideType}`),
    refetchInterval: 60000,
  });

// ── Bookings ────────────────────────────────────────────────────
// export const useBookings = (params: Record<string, string> = {}) => {
//   const qs = new URLSearchParams(params).toString();
//   return useQuery({ queryKey: ['bookings', params], queryFn: () => api.get<any>(`/admin/bookings?${qs}`) });
// };

export const useBookings = (params: Record<string, string> = {}) => {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== "" && v !== undefined),
  );
  const qs = new URLSearchParams(cleaned).toString();
  return useQuery({
    queryKey: ["bookings", params],
    queryFn: () => api.get<any>(`/admin/bookings?${qs}`),
  });
};

export const useCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/admin/bookings/${id}/cancel`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

// ── Drivers ─────────────────────────────────────────────────────
// export const useDrivers = (params: Record<string, string> = {}) => {
//   const qs = new URLSearchParams(params).toString();
//   return useQuery({ queryKey: ['drivers', params], queryFn: () => api.get<any>(`/admin/drivers?${qs}`) });
// };

export const useDrivers = (params: Record<string, string> = {}) => {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== "" && v !== undefined),
  );
  const qs = new URLSearchParams(cleaned).toString();
  return useQuery({
    queryKey: ["drivers", params],
    queryFn: () => api.get<any>(`/admin/drivers?${qs}`),
  });
};

export const useVerifyLicense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      driverProfileId: string;
      status: "APPROVED" | "REJECTED";
      rejectionReason?: string;
    }) => api.post("/admin/drivers/verify-license", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drivers"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] }); // pendingLicenses count changes
    },
  });
};

export const useAssignDriver = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { bookingId: string; driverProfileId: string }) =>
      api.post("/admin/drivers/assign", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["drivers"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useAvailableDrivers = () =>
  useQuery({
    queryKey: ["available-drivers"],
    queryFn: () => api.get<any>("/admin/drivers/available"),
  });

// ── Users ────────────────────────────────────────────────────────
// export const useUsers = (params: Record<string, string> = {}) => {
//   const qs = new URLSearchParams(params).toString();
//   return useQuery({ queryKey: ['users', params], queryFn: () => api.get<any>(`/admin/users?${qs}`) });
// };

export const useUsers = (params: Record<string, string> = {}) => {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== "" && v !== undefined),
  );
  const qs = new URLSearchParams(cleaned).toString();
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => api.get<any>(`/admin/users?${qs}`),
  });
};

export const useSetUserStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/admin/users/${id}/status`, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["drivers"] }); // driver deactivation affects drivers page too
    },
  });
};

export const useUpdateUserRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["drivers"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

// ── Settings ─────────────────────────────────────────────────────
export const useSettings = () =>
  useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<any[]>("/admin/settings"),
  });

export const useUpdateSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: { key: string; value: string }[]) =>
      api.patch("/admin/settings", { settings }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });
};

// ── Promos ────────────────────────────────────────────────────────
export const usePromos = () =>
  useQuery({
    queryKey: ["promos"],
    queryFn: () => api.get<any[]>("/admin/promos"),
  });

// export const useCreatePromo = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (body: any) => api.post('/admin/promos', body),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ['promos'] }),
//   });
// };

export const useTogglePromo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/admin/promos/${id}/toggle`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promos"] }),
  });
};

export const useBookingStats = () =>
  useQuery({
    queryKey: ["booking-stats"],
    queryFn: () => api.get<any>("/admin/dashboard"),
  });

export function useCreatePromo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      code: string;
      description?: string;
      discountType: "PERCENTAGE" | "FIXED";
      discountValue: number;
      minBookingAmount?: number;
      maxDiscount?: number;
      usageLimit?: number;
      expiresAt?: string;
      targetType: "ALL" | "INDIVIDUAL" | "BUSINESS" | "USER_SPECIFIC";
      targetUserIds?: string[];
    }) => api.post("/admin/promos", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promos"] }),
  });
}

export const useDeletePromo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/promos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promos"] }),
  });
};

export function useAssignPromo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      userIds: string[];
      // Either promoId (existing) OR code+discountValue+discountType (new)
      promoId?: string;
      code?: string;
      description?: string;
      discountValue?: number;
      discountType?: "PERCENTAGE" | "FIXED";
      expiresInDays?: number;
      sendPush?: boolean;
      sendEmail?: boolean;
    }) => api.post("/admin/promos/assign", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promos"] }),
  });
}

// useSettings and useUpdateSettings already exist - no changes needed.
// useUsers already exists - no changes needed.

// Optional: dedicated milestone tracker query that enriches users with booking counts.
// Your existing useUsers already returns _count.bookingsAsCustomer so this is just an alias.
export function useUserMilestones(params?: Record<string, string>) {
  const cleaned = Object.fromEntries(
    Object.entries({ limit: "50", ...params }).filter(([_, v]) => v !== ""),
  );
  const qs = new URLSearchParams(cleaned).toString();
  return useQuery({
    queryKey: ["user-milestones", params],
    queryFn: () =>
      api.get<{ users: any[]; total: number }>(`/admin/users?${qs}`),
    staleTime: 30_000,
  });
}

//   export const useBookingStats = useDashboard;
