import React from 'react';
import { useCall } from '@/context/CallContext';
import { CallScreen } from '@/app/screens/call-screen'; 

export const GlobalCallUI = () => {
  const webrtc = useCall();
  
  if (webrtc.callState === 'idle' || !webrtc.callMeta) return null;

  return (
    <CallScreen
      webrtc={webrtc}
      remoteName={webrtc.callMeta.remoteName}
      remoteAvatar={webrtc.callMeta.remoteAvatar}
      bookingId={webrtc.callMeta.bookingId}
      callType={webrtc.callType}
      onClose={() => webrtc.cleanup()} // Explicitly clean up on UI exit
    />
  );
};
