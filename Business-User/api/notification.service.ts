// api/notification.service.ts
import apiClient from './api'; // your existing axios instance

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  bookingId?: string;
  createdAt: string;
}

export const NotificationService = {
  getAll: async (): Promise<AppNotification[]> => {
    const { data } = await apiClient.get('/notifications');
    return data;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const { data } = await apiClient.get('/notifications/unread-count');
    return data;
  },

  markAsRead: async (id: string) => {
    const { data } = await apiClient.patch(`/notifications/${id}/read`);
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await apiClient.patch('/notifications/read-all');
    return data;
  },
};