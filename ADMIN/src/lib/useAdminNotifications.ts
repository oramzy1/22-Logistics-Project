// import { useState, useCallback } from "react";
// import { AdminNotification } from "@/components/dashboard/NotificationsSheet";

// let _id = 0;
// const nextId = () => String(++_id);

// export function useAdminNotifications() {
//   const [notifications, setNotifications] = useState<AdminNotification[]>([]);

//   const push = useCallback((n: Omit<AdminNotification, "id" | "read" | "createdAt">) => {
//     setNotifications(prev => [{
//       ...n,
//       id: nextId(),
//       read: false,
//       createdAt: new Date(),
//     }, ...prev].slice(0, 50)); // keep last 50
//   }, []);

//   const markRead = useCallback((id: string) => {
//     setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
//   }, []);

//   const markAllRead = useCallback(() => {
//     setNotifications(prev => prev.map(n => ({ ...n, read: true })));
//   }, []);

//   const unreadCount = notifications.filter(n => !n.read).length;

//   return { notifications, push, markRead, markAllRead, unreadCount };
// }

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AdminNotification } from "@/components/dashboard/NotificationsSheet";

const TYPE_MAP: Record<string, AdminNotification["type"]> = {
  NEW_BOOKING:       "new_booking",
  LICENSE_SUBMITTED: "license_submitted",
  DRIVER_ONLINE:     "driver_online",
  NEW_USER:          "new_user",
  PAYMENT_RECEIVED:  "payment",
};

const LINK_MAP: Record<AdminNotification["type"], string> = {
  new_booking:       "/bookings",
  license_submitted: "/drivers",
  driver_online:     "/drivers",
  new_user:          "/users",
  payment:           "/payment",
};

function toAdminNotif(n: any): AdminNotification {
  const type = TYPE_MAP[n.type] ?? "new_booking";
  return {
    id:        n.id,
    type,
    title:     n.title,
    body:      n.message,
    link:      LINK_MAP[type] ?? "/",
    linkId:    n.bookingId ?? undefined,
    read:      n.read,
    createdAt: new Date(n.createdAt),
  };
}

export function useAdminNotifications() {
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn:  () => api.get<any[]>("/notifications"),
    refetchInterval: 30_000,
    select: (data) => data.map(toAdminNotif),
  });

  const markReadMut = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`, {}),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["admin-notifications"] }),
  });

  const markAllReadMut = useMutation({
    mutationFn: () => api.patch("/notifications/read-all", {}),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["admin-notifications"] }),
  });

  // Socket handlers still call push() — it just triggers a re-fetch now
  const push = useCallback(
    (_n: Omit<AdminNotification, "id" | "read" | "createdAt">) => {
      qc.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
    [qc],
  );

  return {
    notifications,
    push,
    markRead:     (id: string) => markReadMut.mutate(id),
    markAllRead:  () => markAllReadMut.mutate(),
    unreadCount:  notifications.filter((n) => !n.read).length,
  };
}