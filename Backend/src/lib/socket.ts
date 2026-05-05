// backend/src/lib/socket.ts
import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: SocketServer;

export const initSocket = (httpServer: HttpServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Socket connected: ${socket.id} | Total: ${io.engine.clientsCount}`);

    socket.on('join', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`📡 User ${userId} joined room user:${userId} [socket: ${socket.id}]`);
    });

    socket.on('join_driver', (driverProfileId: string) => {
      socket.join(`driver:${driverProfileId}`);
      socket.join('drivers:available');
      console.log(`📡 Driver ${driverProfileId} joined driver:${driverProfileId} + drivers:available [socket: ${socket.id}]`);
    });

    socket.on('join_pool', () => {
      socket.join('drivers:available');
      console.log(`📡 Socket ${socket.id} joined available pool`);
    });

     socket.on('join_admin', (token: string) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string; role: string };
        if (decoded.role !== 'ADMIN') {
          socket.emit('admin:error', { message: 'Unauthorized' });
          return;
        }
        socket.join('admin:dashboard');
        // Tag the socket so we can reference the adminId in emitToAdmin if needed
        socket.data.adminId = decoded.id;
        console.log(`📡 Admin ${decoded.id} joined admin:dashboard [socket: ${socket.id}]`);
        socket.emit('admin:joined', { message: 'Connected to admin channel' });
      } catch {
        socket.emit('admin:error', { message: 'Invalid or expired token' });
      }
    });

    socket.on('support:join_ticket', (ticketId: string) => {
  socket.join(`ticket:${ticketId}`);
  console.log(`📡 Socket ${socket.id} joined ticket:${ticketId}`);
});

socket.on('support:leave_ticket', (ticketId: string) => {
  socket.leave(`ticket:${ticketId}`);
});

socket.on('trip:send_message', (data: { targetUserId: string; message: string; sender: string }) => {
  // Immediately relay to target user's personal room
  io.to(`user:${data.targetUserId}`).emit('trip:new_message', data);
});

// ── WebRTC Signaling ─────────────────────────────────────────
socket.on('call:initiate', (data: { 
  targetUserId: string; 
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  callType: 'audio' | 'video';
  bookingId: string;
}) => {
  // Forward call invitation to target user's room
  io.to(`user:${data.targetUserId}`).emit('call:incoming', {
    callerId: data.callerId,
    callerName: data.callerName,
    callerAvatar: data.callerAvatar,
    callType: data.callType,
    bookingId: data.bookingId,
    socketId: socket.id, // needed for direct P2P signaling
  });
  console.log(`📞 Call from ${data.callerId} → user:${data.targetUserId}`);
});

socket.on('call:answer', (data: { targetSocketId: string; accepted: boolean; bookingId: string }) => {
  io.to(data.targetSocketId).emit('call:answered', { 
    accepted: data.accepted,
    bookingId: data.bookingId,
    answerSocketId: socket.id,
  });
});

socket.on('call:offer', (data: { targetSocketId: string; offer: any }) => {
  io.to(data.targetSocketId).emit('call:offer', { offer: data.offer, from: socket.id });
});

socket.on('call:webrtc_answer', (data: { targetSocketId: string; answer: any }) => {
  io.to(data.targetSocketId).emit('call:webrtc_answer', { answer: data.answer });
});

socket.on('call:ice_candidate', (data: { targetSocketId: string; candidate: any }) => {
  io.to(data.targetSocketId).emit('call:ice_candidate', { candidate: data.candidate });
});

socket.on('call:end', (data: { targetSocketId: string; bookingId: string }) => {
  io.to(data.targetSocketId).emit('call:ended', { bookingId: data.bookingId });
});

socket.on('call:reject', (data: { targetSocketId: string; bookingId: string }) => {
  io.to(data.targetSocketId).emit('call:rejected', { bookingId: data.bookingId });
});

socket.on('call:ringing', (data: { targetSocketId: string; bookingId: string }) => {
  io.to(data.targetSocketId).emit('call:ringing', { bookingId: data.bookingId });
});

socket.on('call:cancel', (data: { targetUserId: string; bookingId: string }) => {
  // Gracefully tell targeted user that the incoming call was cancelled
  io.to(`user:${data.targetUserId}`).emit('call:cancelled', { bookingId: data.bookingId });
});

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} | Reason: ${reason}`);
    });
  });

  return io;
};

export const getIO = (): SocketServer => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

// Helper with logging — use this instead of raw getIO() for important emits
export const emitTo = (room: string, event: string, data: any) => {
  console.log(`📤 EMIT → room: "${room}" | event: "${event}" | data:`, JSON.stringify(data).slice(0, 200));
  io.to(room).emit(event, data);
};

export const emitToAdmin = (event: AdminDashboardEvent, data: object) => {
  console.log(`📤 ADMIN EMIT → event: "${event}" | data:`, JSON.stringify(data).slice(0, 200));
  io.to('admin:dashboard').emit(event, data);
};

export type AdminDashboardEvent =
  | 'admin:new_booking'      
  | 'admin:booking_cancelled'  
  | 'admin:booking_completed'  
  | 'admin:driver_online'      
  | 'admin:driver_offline'     
  | 'admin:license_submitted'  
  | 'admin:payment_received' 
  | 'admin:user_registered'  
  | 'admin:support_new_ticket'
  | 'admin:trip_delay';
