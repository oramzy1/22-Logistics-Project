import apiClient from './api';

const ignoredRideIds = new Set<string>();

export const DriverService = {
  register: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    licenseNumber?: string;
  }) => {
    const res = await apiClient.post('/driver/register', data);
    return res.data;
  },

  uploadLicense: async (imageUri: string) => {
    const formData = new FormData();
    formData.append('license', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'license.jpg',
    } as any);
    const res = await apiClient.post('/driver/license', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getProfile: async () => {
    const res = await apiClient.get('/driver/profile');
    return res.data;
  },

  updateProfile: async (data: any) => {
    const res = await apiClient.patch('/driver/profile', data);
    return res.data;
  },
  
  setOnlineStatus: async (status: "ONLINE" | "AWAY" | "OFFLINE") => {
    const res = await apiClient.patch('/driver/status', { status });
    return res.data;
  },

  setAvailability: async (isAvailable: boolean) => {
    const res = await apiClient.patch('/driver/availability', { isAvailable });
    return res.data;
  },

  ignoreRide: (bookingId: string) => {
    ignoredRideIds.add(bookingId);
  },
  getRideRequests: async () => {
    const res = await apiClient.get('/driver/requests');
    const all = res.data as any[];
    // Filter out locally ignored rides
    return all.filter((r) => !ignoredRideIds.has(r.id));
  },  

  respondToRequest: async (requestId: string, action: 'ACCEPTED' | 'DECLINED') => {
    const res = await apiClient.patch(`/driver/requests/${requestId}/respond`, { action });
    return res.data;
  },

  getTripHistory: async () => {
    const res = await apiClient.get('/driver/trips/history');
    return res.data;
  },

  getActiveTrip: async () => {
    const res = await apiClient.get('/driver/trips/active');
    return res.data;
  },

  startTrip: async (bookingId: string) => {
    const res = await apiClient.patch(`/driver/trips/${bookingId}/start`);
    return res.data;
  },
  endTrip: async (bookingId: string) => {
    const res = await apiClient.patch(`/driver/trips/${bookingId}/end`);
    return res.data;
  },
}; 