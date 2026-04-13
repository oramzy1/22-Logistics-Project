// Business-User/hooks/useBookingSocket.ts

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

    socketService.connect(user.id);

    // Subscribe — each returns an unsubscribe fn
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

    return () => unsubs.forEach((fn) => fn());
  }, [user?.id]);
}