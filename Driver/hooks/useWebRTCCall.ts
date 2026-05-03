// shared hook: hooks/useWebRTCCall.ts
// (copy to both Business-User/hooks/ and Driver/hooks/)

import { useEffect, useRef, useState, useCallback } from "react";
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from "react-native-webrtc";
import { socketService } from "@/api/socket.service";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    // Free TURN fallback via Open Relay — replace with your own for production
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

export type CallState =
  | "idle"
  | "connecting" // outgoing: socket sent, awaiting remote device
  | "ringing" // outgoing: remote device received + is alerting user
  | "incoming" // this device is being called
  | "connected"
  | "rejected" // remote actively declined
  | "no_answer" // timeout expired, nobody picked up
  | "ended";

export type IncomingCallData = {
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  callType: "audio" | "video";
  bookingId: string;
  socketId: string;
};

export function useWebRTCCall() {
  const [callState, setCallState] = useState<CallState>("idle");
  const [callType, setCallType] = useState<"audio" | "video">("audio");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(
    null,
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  const pc = useRef<RTCPeerConnection | null>(null);
  const remoteSocketId = useRef<string | null>(null);
  const pendingCandidates = useRef<any[]>([]);
const noAnswerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Cleanup ──────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    localStream?.getTracks().forEach((t) => t.stop());
    pc.current?.close();
    pc.current = null;
    remoteSocketId.current = null;
    pendingCandidates.current = [];
    setLocalStream(null);
    setRemoteStream(null);
    setCallState("idle");
    setIncomingCall(null);
  }, [localStream]);

  // ── Create peer connection ───────────────────────────────────
  const createPC = useCallback(() => {
    const peerConnection = new RTCPeerConnection(ICE_SERVERS);

    peerConnection.onicecandidate = ({ candidate }) => {
      if (candidate && remoteSocketId.current) {
        socketService.sendIceCandidate(
          remoteSocketId.current,
          candidate.toJSON(),
        );
      }
    };

    peerConnection.ontrack = (event) => {
      if (event.streams?.[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      if (state === "connected") setCallState("connected");
      if (
        state === "disconnected" ||
        state === "failed" ||
        state === "closed"
      ) {
        cleanup();
      }
    };

    pc.current = peerConnection;
    return peerConnection;
  }, [cleanup]);

  // ── Get local media ──────────────────────────────────────────
  const getLocalStream = useCallback(async (type: "audio" | "video") => {
    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video:
        type === "video"
          ? { facingMode: "user", width: 640, height: 480 }
          : false,
    });
    setLocalStream(stream);
    return stream;
  }, []);

  // ── Initiate call ────────────────────────────────────────────
  const startCall = useCallback(
    async (params: {
      targetUserId: string;
      callerId: string;
      callerName: string;
      callerAvatar?: string;
      callType: "audio" | "video";
      bookingId: string;
    }) => {
      setCallType(params.callType);
      setCallState("connecting");

      const stream = await getLocalStream(params.callType);
      const peerConnection = createPC();
      stream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, stream));

      // Notify the other party
      socketService.initiateCall(params);
      
    },
    [createPC, getLocalStream],
  );

  // ── Accept call (called after onCallAnswered fires) ──────────
  const sendWebRTCOffer = useCallback(
    async (targetSocketId: string) => {
      remoteSocketId.current = targetSocketId;
      const offer = await pc.current!.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === "video",
      } as any);
      await pc.current!.setLocalDescription(new RTCSessionDescription(offer));
      socketService.sendOffer(targetSocketId, offer);
    },
    [callType],
  );

  // ── Answer incoming call ─────────────────────────────────────
  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;
    setCallState("connected");
    remoteSocketId.current = incomingCall.socketId;
    setCallType(incomingCall.callType);

    const stream = await getLocalStream(incomingCall.callType);
    const peerConnection = createPC();
    stream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, stream));

    socketService.answerCall(
      incomingCall.socketId,
      true,
      incomingCall.bookingId,
    );
  }, [incomingCall, createPC, getLocalStream]);

  // ── Reject incoming call ─────────────────────────────────────
  const rejectCall = useCallback(() => {
    if (!incomingCall) return;
    socketService.rejectCall(incomingCall.socketId, incomingCall.bookingId);
    cleanup();
  }, [incomingCall, cleanup]);

  // ── End active call ──────────────────────────────────────────
  const endCall = useCallback(
    (bookingId: string) => {
      if (remoteSocketId.current) {
        socketService.endCall(remoteSocketId.current, bookingId);
      }
      setCallState("ended"); // ADD — show "Call Ended" before cleanup
      setTimeout(() => cleanup(), 2500); // ADD — delay so UI can display it
    },
    [cleanup],
  );
  // ── Toggle mute ──────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    localStream?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMuted((m) => !m);
  }, [localStream]);

  // ── Toggle speaker ───────────────────────────────────────────
  const toggleSpeaker = useCallback(() => {
    // react-native-webrtc handles this via _reactNative_forceSpeakerOutput
    (localStream?.getAudioTracks()[0] as any)?._setVolume?.(
      isSpeakerOn ? 1 : 0,
    );
    setIsSpeakerOn((s) => !s);
  }, [localStream, isSpeakerOn]);

  // ── Socket listeners ─────────────────────────────────────────
  useEffect(() => {
    const unsubIncoming = socketService.onIncomingCall((data) => {
      setIncomingCall(data);
      setCallState("incoming");
    });

    const unsubAnswered = socketService.onCallAnswered(
      async ({ accepted, answerSocketId }) => {
        if (accepted) {
          await sendWebRTCOffer(answerSocketId);
        } else {
          cleanup();
        }
      },
    );

    const unsubOffer = socketService.onCallOffer(async ({ offer, from }) => {
      if (!pc.current) return;
      remoteSocketId.current = from;
      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));

      // Flush any pending candidates
      for (const c of pendingCandidates.current) {
        await pc.current.addIceCandidate(new RTCIceCandidate(c));
      }
      pendingCandidates.current = [];

      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(new RTCSessionDescription(answer));
      socketService.sendAnswer(from, answer);
      setCallState("connected");
    });

    const unsubAnswer = socketService.onCallWebRTCAnswer(async ({ answer }) => {
      if (!pc.current) return;
      await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    const unsubCandidate = socketService.onIceCandidate(
      async ({ candidate }) => {
        if (pc.current?.remoteDescription) {
          await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          pendingCandidates.current.push(candidate); // queue until remote desc is set
        }
      },
    );

    const unsubEnded = socketService.onCallEnded(() => cleanup());
    const unsubRejected = socketService.onCallRejected(() => {
      clearTimeout(noAnswerTimer.current); // see step 4
      setCallState("rejected"); // caller sees "Call Declined"
      setTimeout(() => cleanup(), 2500);
    });

    return () => {
      unsubIncoming();
      unsubAnswered();
      unsubOffer();
      unsubAnswer();
      unsubCandidate();
      unsubEnded();
      unsubRejected();
    };
  }, [sendWebRTCOffer, cleanup]);

  return {
    callState,
    callType,
    localStream,
    remoteStream,
    incomingCall,
    isMuted,
    isSpeakerOn,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleSpeaker,
  };
}
