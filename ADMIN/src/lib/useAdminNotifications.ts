import { useState, useCallback } from "react";
import { AdminNotification } from "@/components/dashboard/NotificationsSheet";

let _id = 0;
const nextId = () => String(++_id);

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  const push = useCallback((n: Omit<AdminNotification, "id" | "read" | "createdAt">) => {
    setNotifications(prev => [{
      ...n,
      id: nextId(),
      read: false,
      createdAt: new Date(),
    }, ...prev].slice(0, 50)); // keep last 50
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, push, markRead, markAllRead, unreadCount };
}