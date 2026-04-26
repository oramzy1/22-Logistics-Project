// admin/src/lib/socket.ts
import { io, Socket } from 'socket.io-client';

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:5000';

// Single shared socket instance for the whole admin app
export const socket: Socket = io(BASE, {
  transports: ['websocket', 'polling'],
  autoConnect: false, // AdminLayout controls connect/disconnect
}); 