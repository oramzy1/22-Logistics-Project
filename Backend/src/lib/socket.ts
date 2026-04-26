// // backend/src/lib/socket.ts

// import { Server as HttpServer } from 'http';
// import { Server as SocketServer, Socket } from 'socket.io';

// let io: SocketServer;

// export const initSocket = (httpServer: HttpServer): SocketServer => {
//   io = new SocketServer(httpServer, {
//     cors: { origin: '*', methods: ['GET', 'POST'] },
//     transports: ['websocket', 'polling'],
//   });

//   io.on('connection', (socket: Socket) => {
//     console.log('🔌 Socket connected:', socket.id);

//     // Each user joins their own room by userId
//     socket.on('join', (userId: string) => {
//       socket.join(`user:${userId}`);
//       console.log(`User ${userId} joined their room`);
//     });

//     // Driver joins driver room for broadcast ride requests
//   socket.on('join_driver', (driverProfileId: string) => {
//   socket.join(`driver:${driverProfileId}`);
//   socket.join('drivers:available'); // ✅ auto-join pool on connect
//   console.log(`Driver ${driverProfileId} joined driver room + available pool`);
// });
//     socket.on('join_pool', () => {
//       socket.join('drivers:available');
//       console.log(`Driver ${socket.id} joined available pool`);
//     })

//     socket.on('disconnect', () => {
//       console.log('🔌 Socket disconnected:', socket.id);
//     });
//   });

//   return io;
// };

// export const getIO = (): SocketServer => {
//   if (!io) throw new Error('Socket.IO not initialized');
//   return io;
// };



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
  | 'admin:new_booking'        // booking created and paid
  | 'admin:booking_cancelled'  // any cancellation
  | 'admin:booking_completed'  // trip ended
  | 'admin:driver_online'      // driver status changed to ONLINE
  | 'admin:driver_offline'     // driver status changed to OFFLINE
  | 'admin:license_submitted'  // driver uploaded a license (pending review)
  | 'admin:payment_received'   // payment verified
  | 'admin:user_registered'   // new user signed up
  | 'admin:support_new_ticket'
