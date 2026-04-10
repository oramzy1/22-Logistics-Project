import apiClient from "./api";

export type BookingPayload = {
  pickupAddress: string;
  dropoffAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  scheduledAt: string; // ISO string
  pickupDate?: string; 
  pickupTime?: string;
  outsidePH?: boolean;
  addOns?: string[];
  packageType: string;
  duration?: string;
  notes?: string;
  paymentMethod?: "card" | "bank_transfer";
  totalAmount: number;
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
    const response = await apiClient.post(`/bookings/${id}/cancel`);
    return response.data;
  },

  verifyPayment: async (reference: string) => {
    const response = await apiClient.get(`/bookings/verify/${reference}`);
    return response.data;
  },
  reinitialize: async (
    bookingId: string,
    channel: "card" | "bank_transfer",
  ) => {
    const response = await apiClient.post(
      `/bookings/${bookingId}/reinitialize`,
      { channel },
    );
    return response.data as { authorizationUrl: string; reference: string };
  },
  createExtension: async (bookingId: string, hours: string) => {
  const response = await apiClient.post("/extensions", { bookingId, hours }, {
    baseURL: apiClient.defaults.baseURL?.replace('/bookings', ''),
  });
  return response.data;
},

verifyExtension: async (reference: string) => {
  const response = await apiClient.get(`/extensions/verify/${reference}`, {
    baseURL: apiClient.defaults.baseURL?.replace('/bookings', ''),
  });
  return response.data;
},

endTrip: async (id: string) => {
  const { data } = await apiClient.patch(`/bookings/${id}/end`);
  return data;
},
rateDriver: async (bookingId: string, rating: number, comment?: string) => {
  const { data } = await apiClient.post(`/bookings/${bookingId}/rate-driver`, { rating, comment });
  return data;
},
cancelWithReason: async (id: string, reason: string, requestRefund: boolean) => {
  const { data } = await apiClient.post(`/bookings/${id}/cancel`, { reason, requestRefund });
  return data;
},
};
