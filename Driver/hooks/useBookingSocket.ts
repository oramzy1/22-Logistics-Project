// // Driver/hooks/useBookingSocket.ts

// import { useEffect, useRef } from 'react';
// import { socketService } from '@/api/socket.service';
// import { useAuth } from '@/context/AuthContext';

// type BookingSocketOptions = {
//   onBookingUpdated?: (booking: any) => void;
//   onRideRemoved?: (bookingId: string) => void;
//   onNewRideRequest?: (data: any) => void;
// };

// export function useBookingSocket(options: BookingSocketOptions) {
//   const { user } = useAuth();
//   const optionsRef = useRef(options);
//   optionsRef.current = options; // always latest without re-subscribing

//   useEffect(() => {
//     if (!user?.id) return;

//     const driverProfileId = (user as any)?.driverProfile?.id;

//     // Connect — idempotent, won't reconnect if already connected
//     if (driverProfileId) {
//       socketService.connect(user.id, driverProfileId);
//     } else {
//       socketService.connect(user.id, '');
//     }

//     // Subscribe — each returns an unsubscribe fn
//     const unsubs: (() => void)[] = [];

//     if (optionsRef.current.onBookingUpdated) {
//       unsubs.push(
//         socketService.onBookingUpdated((b) => optionsRef.current.onBookingUpdated?.(b))
//       );
//     }
//     if (optionsRef.current.onRideRemoved) {
//       unsubs.push(
//         socketService.onRideRemoved((id) => optionsRef.current.onRideRemoved?.(id))
//       );
//     }
//     if (optionsRef.current.onNewRideRequest) {
//       unsubs.push(
//         socketService.onRideRequest((d) => optionsRef.current.onNewRideRequest?.(d))
//       );
//     }

//     return () => unsubs.forEach((fn) => fn());
//   }, [user?.id]);
// }



// Driver/hooks/useBookingSocket.ts — full file replacement

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
  optionsRef.current = options;

  const driverProfileId = (user as any)?.driverProfile?.id as string | undefined;

  useEffect(() => {
    if (!user?.id) return;

    // Always pass whatever we have — the service only updates driverProfileId
    // if a truthy value is given, so calling this with undefined is safe.
    // This also means the hook re-runs and re-joins when driverProfile loads.
    socketService.connect(user.id, driverProfileId? driverProfileId : '');

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
  // Add driverProfileId to deps — re-run when profile loads after auth
  }, [user?.id, driverProfileId]);
}
