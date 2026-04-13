// // Driver/api/socket.service.ts

// import { io, Socket } from "socket.io-client";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const RAW_URL =
//   process.env.EXPO_PUBLIC_API_URL ||
//   process.env.API_URL ||
//   "https://two2-logistics-project.onrender.com";

// const API_URL = RAW_URL.replace(/\/api$/, "");

// class SocketService {
//   private socket: Socket | null = null;

//   connect(userId: string, driverProfileId: string) {
//     if (this.socket?.connected) return;

//     this.socket = io(API_URL, {
//       transports: ["websocket"],
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 2000,
//     });

//     this.socket.on("connect", () => {
//       console.log("🔌 Socket connected");
//       this.socket?.emit("join", userId);
//       this.socket?.emit("join_driver", driverProfileId);
//     });

//     this.socket.on("disconnect", () => {
//       console.log("🔌 Socket disconnected");
//     });
//   }

//   onRideRemoved(callback: (bookingId: string) => void) {
//     this.socket?.on("ride:removed", callback);
//     return () => this.socket?.off("ride:removed", callback);
//   }

//   disconnect() {
//     this.socket?.disconnect();
//     this.socket = null;
//   }

//   // Listen for incoming ride requests
//   onRideRequest(callback: (data: any) => void) {
//     this.socket?.on("ride:new_request", callback);
//     return () => this.socket?.off("ride:new_request", callback);
//   }

//   // Listen for license verification result
//   onLicenseVerified(callback: (data: any) => void) {
//     this.socket?.on("license:verified", callback);
//     return () => this.socket?.off("license:verified", callback);
//   }

//   isConnected() {
//     return this.socket?.connected ?? false;
//   }

//   onBookingUpdated(callback: (booking: any) => void) {
//     this.socket?.on("booking:updated", callback);
//     return () => this.socket?.off("booking:updated", callback);
//   }
// }

// export const socketService = new SocketService();



// Driver/api/socket.service.ts
import { io, Socket } from "socket.io-client";

const RAW_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.API_URL ||
  "https://two2-logistics-project.onrender.com";

const API_URL = RAW_URL.replace(/\/api$/, "");

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private driverProfileId: string | null = null;

  connect(userId: string, driverProfileId: string) {
    this.userId = userId;
    this.driverProfileId = driverProfileId;

    // If already connected with same identity, skip
    if (this.socket?.connected) {
      // Re-emit join rooms in case server restarted (rooms wiped)
      this._joinRooms();
      return;
    }

    // Disconnect any stale socket before creating new one
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
      console.log("🔌 Socket connected:", this.socket?.id);
      this._joinRooms();
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (err) => {
      console.log("🔌 Socket connection error:", err.message);
    });
  }

  private _joinRooms() {
    if (this.userId) {
      this.socket?.emit("join", this.userId);
      console.log(`📡 Joined user room: user:${this.userId}`);
    }
    if (this.driverProfileId) {
      this.socket?.emit("join_driver", this.driverProfileId);
      console.log(`📡 Joined driver room: driver:${this.driverProfileId}`);
    }
  }

  disconnect() {
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
    this.userId = null;
    this.driverProfileId = null;
  }

  onRideRemoved(callback: (bookingId: string) => void) {
    this.socket?.on("ride:removed", callback);
    return () => this.socket?.off("ride:removed", callback);
  }

  onRideRequest(callback: (data: any) => void) {
    this.socket?.on("ride:new_request", callback);
    return () => this.socket?.off("ride:new_request", callback);
  }

  onLicenseVerified(callback: (data: any) => void) {
    this.socket?.on("license:verified", callback);
    return () => this.socket?.off("license:verified", callback);
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }

  onBookingUpdated(callback: (booking: any) => void) {
    this.socket?.on("booking:updated", callback);
    return () => this.socket?.off("booking:updated", callback);
  }
}

export const socketService = new SocketService();
