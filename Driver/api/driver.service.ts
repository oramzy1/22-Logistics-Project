import apiClient from './api';

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

  setOnlineStatus: async (isOnline: boolean) => {
    const res = await apiClient.patch('/driver/status', { isOnline });
    return res.data;
  },

  setAvailability: async (isAvailable: boolean) => {
    const res = await apiClient.patch('/driver/availability', { isAvailable });
    return res.data;
  },

  getRideRequests: async () => {
    const res = await apiClient.get('/driver/requests');
    return res.data;
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
};