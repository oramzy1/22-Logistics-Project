import { useEffect, useRef } from 'react';
import { socketService } from '@/api/socket.service';
import { useAuth } from '@/context/AuthContext';

type BookingSocketOptions = {
  onBookingUpdated?: (booking: any) => void;
  onRideRemoved?: (bookingId: string) => void;
  onNewRideRequest?: (data: any) => void;
};

export function useBookingSocket(options: BookingSocketOptions) {
  const { user } = useAuth();
  const optionsRef = useRef(options);
  optionsRef.current = options; // always latest without re-subscribing

  useEffect(() => {
  if (!user?.id) return;

  const driverProfileId = (user as any)?.driverProfile?.id;

  if (driverProfileId) {
    socketService.connect(user.id, driverProfileId);
  } else {
    socketService.connect(user.id, '');
  }

  // Small delay to ensure socket handshake completes before subscribing
  // This is only needed the very first time — subsequent calls are instant
  const timeout = setTimeout(() => {
    const unsubs: (() => void)[] = [];

    if (optionsRef.current.onBookingUpdated) {
      unsubs.push(
        socketService.onBookingUpdated((b) => optionsRef.current.onBookingUpdated?.(b))
      );
    }
    if (optionsRef.current.onRideRemoved) {
      unsubs.push(
        socketService.onRideRemoved((id) => optionsRef.current.onRideRemoved?.(id))
      );
    }
    if (optionsRef.current.onNewRideRequest) {
      unsubs.push(
        socketService.onRideRequest((d) => optionsRef.current.onNewRideRequest?.(d))
      );
    }

    // Store unsubs for cleanup
    (timeout as any)._unsubs = unsubs;
  }, 100);

  return () => {
    clearTimeout(timeout);
    ((timeout as any)._unsubs ?? []).forEach((fn: () => void) => fn());
  };
}, [user?.id]);
}