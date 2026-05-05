 

// Business-User/api/socket.service.ts
import { io, Socket } from "socket.io-client";

const RAW_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://two2-logistics-project.onrender.com";

const API_URL = RAW_URL.replace(/\/api$/, "");

type Listener = { event: string; callback: Function };

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  // Persistent registry — survives socket reconnects and removeAllListeners
  private registry: Listener[] = [];

  connect(userId: string) {
    this.userId = userId;

    // Already fully connected — just re-join rooms (for server restarts)
    if (this.socket?.connected) {
      this._joinRooms();
      return;
    }

    // Already connecting — don't tear it down, just update userId
    if (this.socket) {
      // Socket exists but not connected yet — DO NOT removeAllListeners.
      // The on('connect') handler will fire and call _joinRooms() when ready.
      return;
    }

    // Fresh connect
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
      // Re-apply all registered listeners after reconnect
      this._reapplyRegistry();
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Business-User socket disconnected:", reason);
    });

    // Apply any listeners that were registered before this connect() call
    this._reapplyRegistry();
  }

  private _joinRooms() {
    if (this.userId) {
      this.socket?.emit("join", this.userId);
      console.log(`📡 Joined user room: user:${this.userId}`);
    }
  }

  onSupportMessage(
    callback: (data: { ticketId: string; message: any }) => void,
  ) {
    return this._register("support:new_message", callback);
  }

  joinTicket(ticketId: string) {
    this.socket?.emit("support:join_ticket", ticketId);
  }

  leaveTicket(ticketId: string) {
    this.socket?.emit("support:leave_ticket", ticketId);
  }
  onSupportTicketUpdated(
    callback: (data: {
      id: string;
      ticketId: string;
      status: string;
      priority: string;
    }) => void,
  ) {
    return this._register("support:ticket_updated", callback);
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
    callType: "audio" | "video";
    bookingId: string;
  }) {
    console.log(
      "📞 Emitting call:initiate to",
      data.targetUserId,
      "| socket connected:",
      this.socket?.connected,
    );
    this.socket?.emit("call:initiate", data);
  }

  answerCall(targetSocketId: string, accepted: boolean, bookingId: string) {
    this.socket?.emit("call:answer", { targetSocketId, accepted, bookingId });
  }

  sendOffer(targetSocketId: string, offer: any) {
    this.socket?.emit("call:offer", { targetSocketId, offer });
  }

  sendAnswer(targetSocketId: string, answer: any) {
    this.socket?.emit("call:webrtc_answer", { targetSocketId, answer });
  }

  sendIceCandidate(targetSocketId: string, candidate: any) {
    this.socket?.emit("call:ice_candidate", { targetSocketId, candidate });
  }

  endCall(targetSocketId: string, bookingId: string) {
    this.socket?.emit("call:end", { targetSocketId, bookingId });
  }

  rejectCall(targetSocketId: string, bookingId: string) {
    this.socket?.emit("call:reject", { targetSocketId, bookingId });
  }

  onIncomingCall(
    callback: (data: {
      callerId: string;
      callerName: string;
      callerAvatar?: string;
      callType: "audio" | "video";
      bookingId: string;
      socketId: string;
    }) => void,
  ) {
    return this._register("call:incoming", callback);
  }

  onCallAnswered(
    callback: (data: {
      accepted: boolean;
      bookingId: string;
      answerSocketId: string;
    }) => void,
  ) {
    return this._register("call:answered", callback);
  }

  onCallOffer(callback: (data: { offer: any; from: string }) => void) {
    return this._register("call:offer", callback);
  }

  onCallWebRTCAnswer(callback: (data: { answer: any }) => void) {
    return this._register("call:webrtc_answer", callback);
  }

  onIceCandidate(callback: (data: { candidate: any }) => void) {
    return this._register("call:ice_candidate", callback);
  }

  onCallEnded(callback: (data: { bookingId: string }) => void) {
    return this._register("call:ended", callback);
  }

  onCallRejected(callback: (data: { bookingId: string }) => void) {
    return this._register("call:rejected", callback);
  }

  emitRinging(targetSocketId: string, bookingId: string) {
    this.socket?.emit("call:ringing", { targetSocketId, bookingId });
  }

  onCallRinging(callback: (data: { bookingId: string }) => void) {
    return this._register("call:ringing", callback);
  }

  cancelCall(targetUserId: string, bookingId: string) {
    this.socket?.emit("call:cancel", { targetUserId, bookingId });
  }

  onCallCancelled(callback: (data: { bookingId: string }) => void) {
    return this._register("call:cancelled", callback);
  }

  joinTripChat(bookingId: string) {
  this.socket?.emit('trip:join', bookingId);
}

leaveTripChat(bookingId: string) {
  this.socket?.emit('trip:leave', bookingId);
}

sendTripMessage(data: {
  targetUserId: string;
  message: string;
  sender: string;
  senderId: string;
  bookingId: string;
}) {
  const payload = { ...data, timestamp: new Date().toISOString() };
  this.socket?.emit('trip:send_message', payload);
  return payload; // return so sender can add to local state immediately
}

onTripMessage(callback: (data: {
  id: string;
  targetUserId: string;
  message: string;
  sender: string;
  senderId: string;
  bookingId: string;
  timestamp: string;
  isRead: boolean;
}) => void) {
  return this._register('trip:new_message', callback);
}

onTripMessageSent(callback: (data: any) => void) {
  return this._register('trip:message_sent', callback);
}

onTripHistory(callback: (messages: any[]) => void) {
  return this._register('trip:history', callback);
}

markTripMessagesRead(bookingId: string, readerUserId: string) {
  this.socket?.emit('trip:mark_read', { bookingId, readerUserId });
}

onTripMessagesRead(callback: (data: { bookingId: string }) => void) {
  return this._register('trip:messages_read', callback);
}

onTripMessageError(callback: (data: { error: string }) => void) {
  return this._register('trip:message_error', callback);
}

  private _reapplyRegistry() {
    // Re-register all persistent listeners onto the current socket
    this.registry.forEach(({ event, callback }) => {
      this.socket?.on(event, callback as any);
    });
  }

  private _register(event: string, callback: Function): () => void {
    const entry: Listener = { event, callback };
    this.registry.push(entry);
    // Register immediately if socket exists (connected or connecting)
    this.socket?.on(event, callback as any);

    return () => {
      // Remove from registry so reconnects don't re-add it
      this.registry = this.registry.filter((l) => l !== entry);
      this.socket?.off(event, callback as any);
    };
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.userId = null;
    this.registry = [];
  }

  onBookingUpdated(callback: (booking: any) => void) {
    return this._register("booking:updated", callback);
  }

  onRideRemoved(callback: (bookingId: string) => void) {
    return this._register("ride:removed", callback);
  }

  onRideRequest(callback: (data: any) => void) {
    return this._register("ride:new_request", callback);
  }
}

export const socketService = new SocketService();
