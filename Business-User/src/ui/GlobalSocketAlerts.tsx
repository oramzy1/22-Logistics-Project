import { useBookingSocket } from '@/hooks/useBookingSocket';
import { useBookings } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { socketService } from '@/api/socket.service';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useRef } from 'react';

export function GlobalSocketAlerts() {
  const { patchBooking } = useBookings();
  const { user } = useAuth();
  const shownAlerts = useRef<Set<string>>(new Set());

  // ✅ Ensure socket is connected as soon as user is available
  useEffect(() => {
    if (!user?.id) return;
    const driverProfileId = (user as any)?.driverProfile?.id ?? '';
    socketService.connect(user.id, driverProfileId);
  }, [user?.id]);

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
          [
            { text: 'View Live', onPress: () => router.push('/(tabs)/live') },
            { text: 'OK' },
          ]
        );
      }

      if (updatedBooking.status === 'IN_PROGRESS') {
        Alert.alert('✅ Trip Started!', 'Your driver has arrived and started the trip.', [{ text: 'OK' }]);
      }

      if (updatedBooking.status === 'CANCELLED') {
        Alert.alert('Booking Cancelled', 'Your booking has been cancelled.', [{ text: 'OK' }]);
      }

      if (updatedBooking.status === 'COMPLETED') {
        Alert.alert(
          '🏁 Trip Completed!',
          'Your trip has ended. Would you like to rate your driver?',
          [
            { text: 'Skip', style: 'cancel' },
            {
              text: 'Rate Driver',
              onPress: () =>
                router.push({
                  pathname: '/screens/rate-driver',
                  params: {
                    bookingId: updatedBooking.id,
                    driverName: updatedBooking.driver?.name ?? 'Your Driver',
                    driverAvatar: updatedBooking.driver?.avatarUrl ?? '',
                  },
                }),
            },
          ]
        );
      }
    },
  });

  return null;
}