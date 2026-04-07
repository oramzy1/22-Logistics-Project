import apiClient from './api';

export const OrderService = {
  createOrder: async (orderData: any) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  getOrders: async () => {
    const response = await apiClient.get('/orders');
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    const response = await apiClient.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },
};
