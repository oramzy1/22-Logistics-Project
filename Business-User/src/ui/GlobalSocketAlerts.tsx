import { useBookingSocket } from '@/hooks/useBookingSocket';
import { useBookings } from '@/context/BookingContext';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { useRef } from 'react';

// This component renders nothing — it just wires up global socket alerts
// Place it inside your root _layout.tsx once, inside BookingProvider
export function GlobalSocketAlerts() {
  const { patchBooking } = useBookings();
  const shownAlerts = useRef<Set<string>>(new Set()); // prevent duplicate alerts

  useBookingSocket({
    onBookingUpdated: (updatedBooking) => {
      patchBooking(updatedBooking);

      const alertKey = `${updatedBooking.id}-${updatedBooking.status}`;
      if (shownAlerts.current.has(alertKey)) return;
      shownAlerts.current.add(alertKey);

      if (updatedBooking.status === 'ACCEPTED') {
        Alert.alert(
          '🚗 Driver Assigned!',
          `${updatedBooking.driver?.name ?? 'A driver'} has accepted your booking and is on the way.`,
          [{ text: 'View Live', onPress: () => router.push('/(tabs)/live') }, { text: 'OK' }]
        );
      }

      if (updatedBooking.status === 'IN_PROGRESS') {
        Alert.alert(
          '✅ Trip Started!',
          'Your driver has arrived and started the trip. Have a safe journey!',
          [{ text: 'OK' }]
        );
      }

      if (updatedBooking.status === 'CANCELLED') {
        Alert.alert(
          'Booking Cancelled',
          'Your booking has been cancelled.',
          [{ text: 'OK' }]
        );
      }

      if (updatedBooking.status === 'COMPLETED') {
        // Pass driver info for rating
        Alert.alert(
          '🏁 Trip Completed!',
          'Your trip has ended. Would you like to rate your driver?',
          [
            { text: 'Skip', style: 'cancel' },
            {
              text: 'Rate Driver',
              onPress: () => router.push({
                pathname: '/screens/rate-driver',
                params: {
                  bookingId: updatedBooking.id,
                  driverName: updatedBooking.driver?.name ?? 'Your Driver',
                  driverAvatar: updatedBooking.driver?.avatarUrl ?? '',
                }
              }),
            },
          ]
        );
      }
    },
  });

  return null; // renders nothing
}