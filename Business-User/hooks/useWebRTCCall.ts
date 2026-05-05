// (Business-User/hooks/)

import { useEffect, useRef, useState, useCallback } from "react";
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from "react-native-webrtc";
import { Audio } from "expo-av";
import { socketService } from "@/api/socket.service";

let outgoingSound: Audio.Sound | null = null;
let incomingSound: Audio.Sound | null = null;

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

type CallMeta = {
  remoteName: string;
  remoteAvatar?: string;
  bookingId: string;
} | null;

async function playOutgoingRing() {
  try {
     await stopOutgoingRing();
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      allowsRecordingIOS: false,        
      playThroughEarpieceAndroid: false, 
    });
    outgoingSound = new Audio.Sound();
    // Standard dial/ringback tone — swap for a local require() if you bundle one
    await outgoingSound.loadAsync(require("../assets/audio/ringback.wav"), {
      isLooping: true,
      volume: 1.0,
    });
    await outgoingSound.playAsync();
  } catch (e) {
    console.warn("outgoing sound error", e);
  }
}

async function playIncomingRing() {
  try {
    await stopIncomingRing();
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      allowsRecordingIOS: false,        
      playThroughEarpieceAndroid: false, 
    });
    incomingSound = new Audio.Sound();
    await incomingSound.loadAsync(require("../assets/audio/ringtone.wav"), {
      isLooping: true,
      volume: 1.0,
    });
    await incomingSound.playAsync();
  } catch (e) {
    console.warn("incoming sound error", e);
  }
}

async function stopOutgoingRing() {
  try {
    await outgoingSound?.stopAsync();
    await outgoingSound?.unloadAsync();
  } catch {}
  outgoingSound = null;
}

async function stopIncomingRing() {
  try {
    await incomingSound?.stopAsync();
    await incomingSound?.unloadAsync();
  } catch {}
  incomingSound = null;
}
export function useWebRTCCall() {
  const [callMeta, setCallMeta] = useState<CallMeta>(null);
  const [callState, setCallState] = useState<CallState>("idle");
  const [callType, setCallType] = useState<"audio" | "video">("audio");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(
    null,
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const noAnswerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callStartTime = useRef<number | null>(null);
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  const pc = useRef<RTCPeerConnection | null>(null);
  const remoteSocketId = useRef<string | null>(null);
  const pendingCandidates = useRef<any[]>([]);
  const sendWebRTCOfferRef = useRef<(id: string) => Promise<void>>(
    async () => {},
  );
  const cleanupRef = useRef<() => void>(() => {});
  const callStateRef = useRef<CallState>('idle');
const localStreamRef = useRef<MediaStream | null>(null);
const targetUserIdRef = useRef<string | null>(null);

  // ── Cleanup ──────────────────────────────────────────────────
 const cleanup = useCallback(() => {
  stopOutgoingRing();
  stopIncomingRing();
  if (noAnswerTimer.current) { clearTimeout(noAnswerTimer.current); noAnswerTimer.current = null; }
  if (durationInterval.current) { clearInterval(durationInterval.current); durationInterval.current = null; }
  callStartTime.current = null;
  setCallDuration(0);
  localStreamRef.current?.getTracks().forEach((t) => t.stop()); // ref, not state
  pc.current?.close();
  pc.current = null;
  remoteSocketId.current = null;
  targetUserIdRef.current = null;
  pendingCandidates.current = [];
  setLocalStream(null);
  setRemoteStream(null);
  callStateRef.current = 'idle';
  setCallState('idle');
  setIncomingCall(null);
  setCallMeta(null);
}, []);

  // ── Create peer connection ───────────────────────────────────
  const createPC = useCallback(() => {
    const peerConnection = new RTCPeerConnection(ICE_SERVERS);

    // react-native-webrtc uses addEventListener, not property assignment
    peerConnection.addEventListener("icecandidate", (event: any) => {
      const candidate = event.candidate;
      if (candidate && remoteSocketId.current) {
        socketService.sendIceCandidate(
          remoteSocketId.current,
          candidate.toJSON(),
        );
      }
    });

    peerConnection.addEventListener("track", (event: any) => {
      const streams = event.streams;
      if (streams?.[0]) {
        setRemoteStream(streams[0]);
      }
    });

    peerConnection.addEventListener("connectionstatechange", () => {
      const state = (peerConnection as any).connectionState;
      if (state === "connected") setCallState("connected");
      if (
        state === "disconnected" ||
        state === "failed" ||
        state === "closed"
      ) {
        if (callStateRef.current !== 'ended') { 
      cleanup();
    }
      }
    });

    // Also listen to iceconnectionstatechange as fallback
    peerConnection.addEventListener("iceconnectionstatechange", () => {
      const state = peerConnection.iceConnectionState;
      if (state === "connected" || state === "completed")
        setCallState("connected");
      if (state === "failed" || state === "closed"){
        if (callStateRef.current !== 'ended') { 
          cleanup();
        }
      }
    });

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
      remoteName: string; 
      remoteAvatar?: string;
    }) => {
      targetUserIdRef.current = params.targetUserId;
      setCallType(params.callType);
      setCallState("connecting");
      playOutgoingRing();
      setCallMeta({
        remoteName: params.remoteName,
        remoteAvatar: params.remoteAvatar,
        bookingId: params.bookingId,
      });

      const stream = await getLocalStream(params.callType);
      const peerConnection = createPC();
      stream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, stream));

      // Notify the other party
      socketService.initiateCall(params);
      noAnswerTimer.current = setTimeout(() => {
      stopOutgoingRing();
      // Notify callee the call was abandoned before answer
      if (targetUserIdRef.current) {
        socketService.cancelCall(targetUserIdRef.current, params.bookingId);
      }
      callStateRef.current = 'no_answer';
        setCallState("no_answer");
        setTimeout(() => cleanup(), 2500);
      }, 30000);
    },
    [createPC, getLocalStream, cleanup],
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
    if (!incomingCall || callStateRef.current === "connected") return;
    stopOutgoingRing();
    stopIncomingRing();
    callStateRef.current = "connected";
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
    stopIncomingRing();
    stopOutgoingRing();
     localStreamRef.current?.getTracks().forEach((t) => t.stop());
  pc.current?.close();
  pc.current = null;
  callStateRef.current = 'rejected';
    setCallState("rejected");
    socketService.rejectCall(incomingCall.socketId, incomingCall.bookingId);
  }, [incomingCall, cleanup]);

  // ── End active call ──────────────────────────────────────────
  const endCall = useCallback((bookingId: string) => {
    stopOutgoingRing(); 
    stopIncomingRing(); 
    
    // Connected? Drop WebRTC
    if (remoteSocketId.current) {
      socketService.endCall(remoteSocketId.current, bookingId);
    } 
    // Ringing but unanswered? Dispatch cancellation
    else if (targetUserIdRef.current) {
      socketService.cancelCall(targetUserIdRef.current, bookingId);
    }else if (callStateRef.current !== 'ended') { 
          cleanup();
        }
    
    callStateRef.current = 'ended';
    setCallState("ended");
  }, []);

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

  useEffect(() => {
    if (callState === "connected") {
      callStartTime.current = Date.now();
      setCallDuration(0);
      durationInterval.current = setInterval(() => {
        setCallDuration(
          Math.floor((Date.now() - callStartTime.current!) / 1000),
        );
      }, 1000);
    } else {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
    }
  }, [callState]);
  // ── Socket listeners ─────────────────────────────────────────
useEffect(() => {
  const unsubIncoming = socketService.onIncomingCall((data) => {
    // Critical guard: ignore if WE are the one placing a call
    if (['connecting', 'ringing', 'connected'].includes(callStateRef.current)) return;
     setCallMeta({
      remoteName: data.callerName,
      remoteAvatar: data.callerAvatar,
      bookingId: data.bookingId,
    });
    setIncomingCall(data);
    callStateRef.current = 'incoming';
    setCallState('incoming');
    playIncomingRing();
    socketService.emitRinging(data.socketId, data.bookingId);
  });

  const unsubRinging = socketService.onCallRinging(() => {
    callStateRef.current = 'ringing';
    setCallState('ringing');
  });

  const unsubAnswered = socketService.onCallAnswered(async ({ accepted, answerSocketId }) => {
    if (callStateRef.current === 'connected') return;
    stopOutgoingRing();
    if (noAnswerTimer.current) { clearTimeout(noAnswerTimer.current); noAnswerTimer.current = null; }
    if (accepted) {
       callStateRef.current = 'connected';
      setCallState('connected');
      await sendWebRTCOfferRef.current(answerSocketId);
    } else {
      cleanupRef.current();
    }
  });

  const unsubOffer = socketService.onCallOffer(async ({ offer, from }) => {
    if (!pc.current) return;
    if (pc.current.signalingState !== 'stable' && pc.current.remoteDescription) return;
    remoteSocketId.current = from;
    try {
      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      for (const c of pendingCandidates.current) {
        await pc.current.addIceCandidate(new RTCIceCandidate(c));
      }
      pendingCandidates.current = [];
      if (pc.current.signalingState === 'have-remote-offer') {
        const answer = await pc.current.createAnswer();
        await pc.current.setLocalDescription(new RTCSessionDescription(answer));
        socketService.sendAnswer(from, answer);
      }
    } catch (e) { console.warn('offer handling error', e); }
  });

  const unsubAnswer = socketService.onCallWebRTCAnswer(async ({ answer }) => {
    if (!pc.current) return;
    if (pc.current.signalingState === 'have-local-offer') {
      try {
        await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (e) { console.warn('answer handling error', e); }
    }
  });

  const unsubCandidate = socketService.onIceCandidate(async ({ candidate }) => {
    if (pc.current?.remoteDescription) {
      try { await pc.current.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
    } else {
      pendingCandidates.current.push(candidate);
    }
  });

  const unsubEnded = socketService.onCallEnded(() => {
    stopIncomingRing();
    stopOutgoingRing();
    // Cut media on the receiving end immediately
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    pc.current?.close();
    pc.current = null;
    callStateRef.current = 'ended';
    setCallState('ended');
  });

  const unsubRejected = socketService.onCallRejected(() => {
    stopOutgoingRing();
    if (noAnswerTimer.current) { clearTimeout(noAnswerTimer.current); noAnswerTimer.current = null; }
    callStateRef.current = 'rejected';
    setCallState('rejected');
  });

  // Caller cancelled before callee answered
  const unsubCancelled = socketService.onCallCancelled(() => {
    stopIncomingRing();
    callStateRef.current = 'ended';
    setCallState('ended');
  });

  return () => {
    unsubIncoming(); unsubRinging(); unsubAnswered();
    unsubOffer(); unsubAnswer(); unsubCandidate();
    unsubEnded(); unsubRejected(); unsubCancelled();
  };
}, []);

useEffect(() => { localStreamRef.current = localStream; }, [localStream]);
  useEffect(() => {
    sendWebRTCOfferRef.current = sendWebRTCOffer;
  }, [sendWebRTCOffer]);
  useEffect(() => {
    cleanupRef.current = cleanup;
  }, [cleanup]);

  return {
    callState,
    callType,
    localStream,
    remoteStream,
    incomingCall,
    isMuted,
    isSpeakerOn,
    callDuration,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    cleanup,
    callMeta,
    toggleSpeaker,
  };
}
