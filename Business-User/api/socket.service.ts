import { io, Socket } from 'socket.io-client';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://two2-logistics-project.onrender.com';

class SocketService {
  private socket: Socket | null = null;

 connect(userId: string, driverProfileId?: string) {
  if (this.socket?.connected) return;
  this.socket = io(API_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
  });
  this.socket.on('connect', () => {
    console.log('🔌 Socket connected');
    this.socket?.emit('join', userId);
    if (driverProfileId) {
      this.socket?.emit('join_driver', driverProfileId);
    }
  });
}

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  // Hook to capture ANY database update on trips you own
onBookingUpdated(callback: (booking: any) => void) {
  this.socket?.on('booking:updated', callback);
  return () => this.socket?.off('booking:updated', callback);
}

onRideRemoved(callback: (bookingId: string) => void) {
  this.socket?.on('ride:removed', callback);
  return () => this.socket?.off('ride:removed', callback);
}
  onRideRequest(callback: (data: any) => void) {
    this.socket?.on('ride:new_request', callback);
    return () => this.socket?.off('ride:new_request', callback);
  }
}

export const socketService = new SocketService();
