// import { useBookingSocket } from '@/hooks/useBookingSocket';
// import { useBookings } from '@/context/BookingContext';
// import { useAuth } from '@/context/AuthContext';
// import { socketService } from '@/api/socket.service';
// import { router } from 'expo-router';
// import { useEffect } from 'react';
// import { Alert } from 'react-native';
// import { useRef } from 'react';

// export function GlobalSocketAlerts() {
//   const { patchBooking } = useBookings();
//   const { user } = useAuth();
//   const shownAlerts = useRef<Set<string>>(new Set());

//   // ✅ Ensure socket is connected as soon as user is available
//   useEffect(() => {
//     if (!user?.id) return;
//     const driverProfileId = (user as any)?.driverProfile?.id ?? '';
//     socketService.connect(user.id, driverProfileId);
//   }, [user?.id]);

//   useBookingSocket({
//     onBookingUpdated: (updatedBooking) => {
//       patchBooking(updatedBooking);

//       const alertKey = `${updatedBooking.id}-${updatedBooking.status}`;
//       if (shownAlerts.current.has(alertKey)) return;
//       shownAlerts.current.add(alertKey);

//       if (updatedBooking.status === 'ACCEPTED') {
//         Alert.alert(
//           '🚗 Driver Assigned!',
//           `${updatedBooking.driver?.name ?? 'A driver'} has accepted your booking and is on the way.`,
//           [
//             { text: 'View Live', onPress: () => router.push('/(tabs)/live') },
//             { text: 'OK' },
//           ]
//         );
//       }

//       if (updatedBooking.status === 'IN_PROGRESS') {
//         Alert.alert('✅ Trip Started!', 'Your driver has arrived and started the trip.', [{ text: 'OK' }]);
//       }

//       if (updatedBooking.status === 'CANCELLED') {
//         Alert.alert('Booking Cancelled', 'Your booking has been cancelled.', [{ text: 'OK' }]);
//       }

//       if (updatedBooking.status === 'COMPLETED') {
//         Alert.alert(
//           '🏁 Trip Completed!',
//           'Your trip has ended. Would you like to rate your driver?',
//           [
//             { text: 'Skip', style: 'cancel' },
//             {
//               text: 'Rate Driver',
//               onPress: () =>
//                 router.push({
//                   pathname: '/screens/rate-driver',
//                   params: {
//                     bookingId: updatedBooking.id,
//                     driverName: updatedBooking.driver?.name ?? 'Your Driver',
//                     driverAvatar: updatedBooking.driver?.avatarUrl ?? '',
//                   },
//                 }),
//             },
//           ]
//         );
//       }
//     },
//   });

//   return null;
// }




// Business-User/src/ui/GlobalSocketAlerts.tsx

import { useBookingSocket } from '@/hooks/useBookingSocket';
import { useBookings } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { socketService } from '@/api/socket.service';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Key used to persist the pending rating across app close/reopen
const PENDING_RATING_KEY = 'pendingDriverRating';

type PendingRating = {
  bookingId: string;
  driverName: string;
  driverAvatar: string;
};

async function savePendingRating(data: PendingRating) {
  await AsyncStorage.setItem(PENDING_RATING_KEY, JSON.stringify(data));
}

async function clearPendingRating() {
  await AsyncStorage.removeItem(PENDING_RATING_KEY);
}

async function loadPendingRating(): Promise<PendingRating | null> {
  const raw = await AsyncStorage.getItem(PENDING_RATING_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function showRatingPrompt(data: PendingRating) {
  Alert.alert(
    '🏁 Trip Completed!',
    'Your trip has ended. Would you like to rate your driver?',
    [
      {
        text: 'Skip',
        style: 'cancel',
        onPress: clearPendingRating,
      },
      {
        text: 'Rate Driver ⭐',
        onPress: () => {
          clearPendingRating();
          router.push({
            pathname: '/screens/rate-driver',
            params: {
              bookingId: data.bookingId,
              driverName: data.driverName,
              driverAvatar: data.driverAvatar,
            },
          });
        },
      },
    ]
  );
}

export function GlobalSocketAlerts() {
  const { patchBooking } = useBookings();
  const { user } = useAuth();
  const shownAlerts = useRef<Set<string>>(new Set());
  const appState = useRef<AppStateStatus>(AppState.currentState);

  // ── 1. Connect socket as soon as user is available ─────────────
  useEffect(() => {
    if (!user?.id) return;
    socketService.connect(user.id);
  }, [user?.id]);

  // ── 2. Check for a pending rating on mount and on app foreground ─
  useEffect(() => {
    if (!user?.id) return;

    const checkPending = async () => {
      const pending = await loadPendingRating();
      if (pending) {
        // Small delay so the router is ready before showing alert
        setTimeout(() => showRatingPrompt(pending), 600);
      }
    };

    checkPending(); // On mount (covers login after app was closed)

    // Also check every time the app comes back to foreground
    const sub = AppState.addEventListener('change', (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        checkPending();
      }
      appState.current = nextState;
    });

    return () => sub.remove();
  }, [user?.id]);

  // ── 3. Listen for real-time booking updates ─────────────────────
  useBookingSocket({
    onBookingUpdated: (updatedBooking) => {
      // Always keep BookingContext state in sync
      patchBooking(updatedBooking);

      // Deduplicate — don't show the same alert twice
      const alertKey = `${updatedBooking.id}-${updatedBooking.status}`;
      if (shownAlerts.current.has(alertKey)) return;
      shownAlerts.current.add(alertKey);

      switch (updatedBooking.status) {

        case 'ACCEPTED':
          Alert.alert(
            '🚗 Driver On The Way!',
            `${updatedBooking.driver?.name ?? 'Your driver'} has accepted your booking and is heading to you.`,
            [
              { text: 'View Live', onPress: () => router.push('/(tabs)/live') },
              { text: 'OK' },
            ]
          );
          break;

        case 'IN_PROGRESS':
          Alert.alert(
            '📍 Driver Arrived!',
            'Your driver is at the pickup location and has started the trip.',
            [
              { text: 'View Live', onPress: () => router.push('/(tabs)/live') },
              { text: 'OK' },
            ]
          );
          break;

        case 'CANCELLED':
          Alert.alert(
            '❌ Booking Cancelled',
            'Your booking has been cancelled.',
            [{ text: 'OK' }]
          );
          break;

        case 'COMPLETED': {
          const ratingData: PendingRating = {
            bookingId: updatedBooking.id,
            driverName: updatedBooking.driver?.name ?? 'Your Driver',
            driverAvatar: updatedBooking.driver?.avatarUrl ?? '',
          };
          // Persist first — so if user closes the app it shows on reopen
          savePendingRating(ratingData).then(() => {
            showRatingPrompt(ratingData);
          });
          break;
        }

        default:
          break;
      }
    },
  });

  return null; // Renders nothing — pure side-effect component
}
