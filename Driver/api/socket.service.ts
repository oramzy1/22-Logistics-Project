import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.API_URL || 'https://two2-logistics-project.onrender.com';

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string, driverProfileId: string) {
    if (this.socket?.connected) return;

    this.socket = io(API_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected');
      this.socket?.emit('join', userId);
      this.socket?.emit('join_driver', driverProfileId);
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });
  }

   onRideRemoved(callback: (bookingId: string) => void) {
    this.socket?.on('ride:removed', callback);
    return () => this.socket?.off('ride:removed', callback);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  // Listen for incoming ride requests
  onRideRequest(callback: (data: any) => void) {
    this.socket?.on('ride:new_request', callback);
    return () => this.socket?.off('ride:new_request', callback);
  }

  // Listen for license verification result
  onLicenseVerified(callback: (data: any) => void) {
    this.socket?.on('license:verified', callback);
    return () => this.socket?.off('license:verified', callback);
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }

  onBookingUpdated(callback: (booking: any) => void) {
  this.socket?.on('booking:updated', callback);
  return () => this.socket?.off('booking:updated', callback);
}
}

export const socketService = new SocketService();