import React, { useEffect } from 'react';
import {
  View, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { useKeepAwake } from 'expo-keep-awake';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Video, VideoOff } from 'lucide-react-native';
import { Text } from '../../components/AppText';
import { useWebRTCCall } from '@/hooks/useWebRTCCall';
import { useAppTheme } from '@/src/ui/useAppTheme';

type Props = {
  // Caller props (when initiating)
  targetUserId?: string;
  callerId?: string;
  callerName?: string;
  callerAvatar?: string;
  callType?: 'audio' | 'video';
  bookingId?: string;
  // Display
  remoteName: string;
  remoteAvatar?: string;
  onClose: () => void;
};

export function CallScreen({
  targetUserId, callerId, callerName, callerAvatar,
  callType = 'audio', bookingId = '', remoteName, onClose,
}: Props) {
  useKeepAwake();
  const { colors: themeColors } = useAppTheme();
  const {
    callState, localStream, remoteStream,
    incomingCall, isMuted, isSpeakerOn,
    startCall, acceptCall, rejectCall, endCall,
    toggleMute, toggleSpeaker,
  } = useWebRTCCall();

  // Auto-initiate if we have a target (outgoing call)
  useEffect(() => {
    if (targetUserId && callerId && callerName && bookingId) {
      startCall({ targetUserId, callerId, callerName, callerAvatar, callType, bookingId });
    }
  }, []);

  const handleEnd = () => {
    endCall(bookingId);
    onClose();
  };

  const handleReject = () => {
    rejectCall();
    onClose();
  };

  const isVideo = callType === 'video';
  const isConnected = callState === 'connected';
  const isIncoming = callState === 'incoming';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Video streams */}
      {isVideo && remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={StyleSheet.absoluteFillObject}
          objectFit="cover"
          mirror={false}
        />
      )}
      {isVideo && localStream && isConnected && (
        <View style={styles.localVideoWrapper}>
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.localVideo}
            objectFit="cover"
            mirror
          />
        </View>
      )}

      {/* Audio call — show avatar/name */}
      {!isVideo && (
        <View style={styles.audioContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {remoteName?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text style={styles.remoteName}>{remoteName}</Text>
          <Text style={styles.callStatus}>
            {isIncoming ? 'Incoming call...' :
             callState === 'calling' ? 'Calling...' :
             isConnected ? 'Connected' : 'Connecting...'}
          </Text>
        </View>
      )}

      {/* Incoming call UI */}
      {isIncoming && (
        <View style={styles.incomingActions}>
          <Text style={styles.incomingLabel}>
            {incomingCall?.callerName} is calling...
          </Text>
          <View style={styles.incomingBtns}>
            <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
              <PhoneOff size={28} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} onPress={acceptCall}>
              <Phone size={28} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Active call controls */}
      {!isIncoming && (
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlBtn} onPress={toggleMute}>
            {isMuted ? <MicOff size={22} color="#FFF" /> : <Mic size={22} color="#FFF" />}
            <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.endBtn} onPress={handleEnd}>
            <PhoneOff size={28} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={toggleSpeaker}>
            {isSpeakerOn ? <Volume2 size={22} color="#FFF" /> : <VolumeX size={22} color="#FFF" />}
            <Text style={styles.controlLabel}>{isSpeakerOn ? 'Speaker' : 'Earpiece'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B1B2B' },
  audioContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  avatarCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#1D3557', alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#E4C77B',
  },
  avatarInitial: { fontSize: 40, fontWeight: '800', color: '#E4C77B' },
  remoteName: { fontSize: 24, fontWeight: '700', color: '#FFF' },
  callStatus: { fontSize: 14, color: '#9CA3AF' },
  localVideoWrapper: {
    position: 'absolute', top: 60, right: 20,
    width: 100, height: 140, borderRadius: 12,
    overflow: 'hidden', borderWidth: 2, borderColor: '#E4C77B',
  },
  localVideo: { flex: 1 },
  controls: {
    position: 'absolute', bottom: 60, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-around', paddingHorizontal: 40,
  },
  controlBtn: { alignItems: 'center', gap: 6 },
  controlLabel: { color: '#D1D5DB', fontSize: 11 },
  endBtn: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center',
  },
  incomingActions: {
    position: 'absolute', bottom: 80, left: 0, right: 0, alignItems: 'center', gap: 32,
  },
  incomingLabel: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  incomingBtns: { flexDirection: 'row', gap: 60 },
  rejectBtn: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center',
  },
  acceptBtn: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center',
  },
});