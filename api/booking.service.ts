import apiClient from "./api";

export type BookingPayload = {
  pickupAddress: string;
  dropoffAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  scheduledAt: string; // ISO string
  packageType: string;
  duration?: number;
  notes?: string;
};

export const BookingService = {
  create: async (payload: BookingPayload) => {
    const response = await apiClient.post("/bookings", payload);
    return response.data;
  },

  getAll: async () => {
    const response = await apiClient.get("/bookings");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await apiClient.patch(`/bookings/${id}/cancel`);
    return response.data;
  },

  verifyPayment: async (reference: string) => {
    const response = await apiClient.get(`/bookings/verify/${reference}`);
    return response.data;
  },
};