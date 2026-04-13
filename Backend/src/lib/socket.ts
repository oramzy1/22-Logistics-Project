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
