
import React, { createContext, useContext } from 'react';
import { useWebRTCCall, CallState, IncomingCallData } from '@/hooks/useWebRTCCall';

const CallContext = createContext<ReturnType<typeof useWebRTCCall> | null>(null);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const call = useWebRTCCall();
  return <CallContext.Provider value={call}>{children}</CallContext.Provider>;
}

export const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within CallProvider');
  return ctx;
};