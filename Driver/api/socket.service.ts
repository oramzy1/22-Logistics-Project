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
  private registry: { event: string; callback: Function }[] = [];

  connect(userId: string, driverProfileId: string) {
    this.userId = userId;
    if (driverProfileId) {
    this.driverProfileId = driverProfileId;
  }
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
      this._reapplyRegistry();
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
   onSupportMessage(callback: (data: { ticketId: string; message: any }) => void) {
  return this._register("support:new_message", callback);
}

joinTicket(ticketId: string) {
  this.socket?.emit("support:join_ticket", ticketId);
}

leaveTicket(ticketId: string) {
  this.socket?.emit("support:leave_ticket", ticketId);
}
onSupportTicketUpdated(callback: (data: {
    id: string; ticketId: string; status: string; priority: string 
}) => void) {
  return this._register("support:ticket_updated", callback);
}

private _reapplyRegistry() {
    this.registry.forEach(({ event, callback }) => {
      this.socket?.on(event, callback as any);
    });
  }

  private _register(event: string, callback: Function): () => void {
    const entry = { event, callback };
    this.registry.push(entry);
    this.socket?.on(event, callback as any);
    return () => {
      this.registry = this.registry.filter((l) => l !== entry);
      this.socket?.off(event, callback as any);
    };
  }



  disconnect() {
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
    this.userId = null;
    this.driverProfileId = null;
    this.registry = [];
  }

  onRideRemoved(callback: (bookingId: string) => void) {
    return this._register("ride:removed", callback);
  }

  onRideRequest(callback: (data: any) => void) {
    return this._register("ride:new_request", callback);
  }

  onLicenseVerified(callback: (data: any) => void) {
    return this._register("license:verified", callback);
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }

  onBookingUpdated(callback: (booking: any) => void) {
    this.socket?.on("booking:updated", callback);
    return this._register("booking:updated", callback);
  }

  // Add to SocketService class:

getSocketId(): string | null {
  return this.socket?.id ?? null;
}

initiateCall(data: {
  targetUserId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  callType: 'audio' | 'video';
  bookingId: string;
}) {
  this.socket?.emit('call:initiate', data);
}

answerCall(targetSocketId: string, accepted: boolean, bookingId: string) {
  this.socket?.emit('call:answer', { targetSocketId, accepted, bookingId });
}

sendOffer(targetSocketId: string, offer: any) {
  this.socket?.emit('call:offer', { targetSocketId, offer });
}

sendAnswer(targetSocketId: string, answer: any) {
  this.socket?.emit('call:webrtc_answer', { targetSocketId, answer });
}

sendIceCandidate(targetSocketId: string, candidate: any) {
  this.socket?.emit('call:ice_candidate', { targetSocketId, candidate });
}

endCall(targetSocketId: string, bookingId: string) {
  this.socket?.emit('call:end', { targetSocketId, bookingId });
}

rejectCall(targetSocketId: string, bookingId: string) {
  this.socket?.emit('call:reject', { targetSocketId, bookingId });
}

onIncomingCall(callback: (data: {
  callerId: string; callerName: string; callerAvatar?: string;
  callType: 'audio' | 'video'; bookingId: string; socketId: string;
}) => void) {
  return this._register('call:incoming', callback);
}

onCallAnswered(callback: (data: { accepted: boolean; bookingId: string; answerSocketId: string }) => void) {
  return this._register('call:answered', callback);
}

onCallOffer(callback: (data: { offer: any; from: string }) => void) {
  return this._register('call:offer', callback);
}

onCallWebRTCAnswer(callback: (data: { answer: any }) => void) {
  return this._register('call:webrtc_answer', callback);
}

onIceCandidate(callback: (data: { candidate: any }) => void) {
  return this._register('call:ice_candidate', callback);
}

onCallEnded(callback: (data: { bookingId: string }) => void) {
  return this._register('call:ended', callback);
}

onCallRejected(callback: (data: { bookingId: string }) => void) {
  return this._register('call:rejected', callback);
}

}

export const socketService = new SocketService();
