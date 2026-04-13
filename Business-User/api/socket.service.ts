// // Business-User/api/socket.service.ts

// import { io, Socket } from "socket.io-client";

// const RAW_URL =
//   process.env.EXPO_PUBLIC_API_URL ||
//   "https://two2-logistics-project.onrender.com";

// const API_URL = RAW_URL.replace(/\/api$/, "");

// class SocketService {
//   private socket: Socket | null = null;

//   connect(userId: string, driverProfileId?: string) {
//     if (this.socket?.connected) return;
//     this.socket = io(API_URL, {
//       transports: ["websocket", "polling"],
//       reconnection: true,
//       reconnectionAttempts: 10,
//     });
//     this.socket.on("connect", () => {
//       console.log("🔌 Socket connected");
//       this.socket?.emit("join", userId);
//       if (driverProfileId) {
//         this.socket?.emit("join_driver", driverProfileId);
//       }
//     });
//   }

//   disconnect() {
//     this.socket?.disconnect();
//     this.socket = null;
//   }

//   // Hook to capture ANY database update on trips you own
//   onBookingUpdated(callback: (booking: any) => void) {
//     this.socket?.on("booking:updated", callback);
//     return () => this.socket?.off("booking:updated", callback);
//   }

//   onRideRemoved(callback: (bookingId: string) => void) {
//     this.socket?.on("ride:removed", callback);
//     return () => this.socket?.off("ride:removed", callback);
//   }
//   onRideRequest(callback: (data: any) => void) {
//     this.socket?.on("ride:new_request", callback);
//     return () => this.socket?.off("ride:new_request", callback);
//   }
// }

// export const socketService = new SocketService();



// Business-User/api/socket.service.ts
import { io, Socket } from "socket.io-client";

const RAW_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://two2-logistics-project.onrender.com";

const API_URL = RAW_URL.replace(/\/api$/, "");

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(userId: string) {
    this.userId = userId;

    if (this.socket?.connected) {
      this._joinRooms();
      return;
    }

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    this.socket = io(API_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on("connect", () => {
      console.log("🔌 Business-User socket connected:", this.socket?.id);
      this._joinRooms();
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Business-User socket disconnected:", reason);
    });
  }

  private _joinRooms() {
    if (this.userId) {
      this.socket?.emit("join", this.userId);
      console.log(`📡 Joined user room: user:${this.userId}`);
    }
  }

  disconnect() {
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
    this.userId = null;
  }

  onBookingUpdated(callback: (booking: any) => void) {
    this.socket?.on("booking:updated", callback);
    return () => this.socket?.off("booking:updated", callback);
  }

  onRideRemoved(callback: (bookingId: string) => void) {
    this.socket?.on("ride:removed", callback);
    return () => this.socket?.off("ride:removed", callback);
  }

  onRideRequest(callback: (data: any) => void) {
    this.socket?.on("ride:new_request", callback);
    return () => this.socket?.off("ride:new_request", callback);
  }
}

export const socketService = new SocketService();
