import { BookingService } from '@/api/booking.service';
import { useBookings } from '@/context/BookingContext';
import { colors, radius, spacing } from '@/src/ui/theme';
import { router, useLocalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/AppText';

export default function ExtensionSuccessScreen() {
  const { reference, bookingId } = useLocalSearchParams<{
    reference: string;
    bookingId: string;
  }>();

  const { fetchBookings } = useBookings();
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending');

  useEffect(() => {
    const verify = async () => {
      let attempts = 0;
      const tryVerify = async (): Promise<void> => {
        attempts++;
        try {
          await BookingService.verifyExtension(reference);
          await fetchBookings();
          setStatus('confirmed');
        } catch (err: any) {
          // Already paid — webhook beat us
          if (err?.response?.status === 400) {
            await fetchBookings();
            setStatus('confirmed');
            return;
          }
          if (attempts < 3) {
            await new Promise(r => setTimeout(r, 2000));
            return tryVerify();
          }
          setStatus('failed');
        }
      };

      await new Promise(r => setTimeout(r, 1500));
      await tryVerify();
    };

    verify();
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.lottieContainer}>
          <LottieView
            source={require('../../assets/animations/Done_tick.json')}
            autoPlay loop={false}
            style={{ width: 150, height: 150 }}
          />
        </View>

        <Text style={styles.title}>Trip Extended!</Text>
        <Text style={styles.subtitle}>Your trip has been extended successfully.</Text>

        {/* <View style={[styles.badge, status === 'confirmed' && styles.badgeConfirmed]}>
          {status === 'pending' ? (
            <>
              <ActivityIndicator size="small" color="#92400E" style={{ marginRight: 8 }} />
              <Text style={styles.badgeText}>Confirming payment...</Text>
            </>
          ) : status === 'confirmed' ? (
            <Text style={[styles.badgeText, { color: '#166534' }]}>✓ Extension confirmed</Text>
          ) : (
            <Text style={[styles.badgeText, { color: '#991B1B' }]}>Payment verification pending</Text>
          )}
        </View> */}

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace('/(tabs)/live')}
          disabled={status === 'pending'}
        >
          <Text style={styles.primaryBtnText}>{status === 'pending' ? 'Loading...' : 'View Live Trip'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={() => router.push({
            pathname: '/screens/payment-details',
            params: { id: bookingId },
          })}
          disabled={status === 'pending'}
        >
          <Text style={styles.outlineBtnText}>View Booking & Extensions</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 40, alignItems: 'center' },
  lottieContainer: { height: 200, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 16 },
  badge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FEF3C7', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8, marginBottom: 32,
  },
  badgeConfirmed: { backgroundColor: '#DCFCE7' },
  badgeText: { fontSize: 13, fontWeight: '600', color: '#92400E' },
  primaryBtn: {
    width: '100%', backgroundColor: '#E4C77B',
    paddingVertical: 16, borderRadius: 28, alignItems: 'center', marginBottom: 12,
  },
  primaryBtnText: { fontWeight: '700', color: '#3E2723', fontSize: 15 },
  outlineBtn: {
    width: '100%', borderWidth: 1, borderColor: '#E5E7EB',
    paddingVertical: 16, borderRadius: 28, alignItems: 'center',
  },
  outlineBtnText: { fontWeight: '600', color: '#374151', fontSize: 15 },
});