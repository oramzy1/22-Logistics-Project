import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/AppText';
import { AppHeader } from '@/src/ui/AppHeader';
import { InfoBanner } from '@/src/ui/InfoBanner';
import { PrimaryButton } from '@/src/ui/PrimaryButton';
import { colors, radius, spacing, text } from '@/src/ui/theme';

function Row({ label, value, valueStyle }: { label: string; value: string; valueStyle?: any }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueStyle]}>{value}</Text>
    </View>
  );
}

export default function ConfirmationScreen() {
  // Params passed from ScheduleTabScreen after createBooking succeeds
  const {
    bookingId,
    packageType,
    scheduledAt,
    pickupAddress,
    dropoffAddress,
    totalAmount,
    authorizationUrl,
    reference,
    addOns,
  } = useLocalSearchParams<{
    bookingId: string;
    packageType: string;
    scheduledAt: string;
    pickupAddress: string;
    dropoffAddress: string;
    totalAmount: string;
    authorizationUrl: string;
    reference: string;
    addOns?: string;
  }>();

  const formattedDate = scheduledAt
    ? new Date(scheduledAt).toLocaleDateString('en-NG', { month: 'long', day: 'numeric' })
    : '—';

  const formattedTime = scheduledAt
    ? new Date(scheduledAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <SafeAreaView style={styles.root}>
      <AppHeader title="Confirmation" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          Your ride is reserved. Complete payment to lock in your booking.
        </Text>

        <View style={styles.card}>
          <Row label="Ride type" value={packageType ?? '—'} />
          <Row label="Schedule date" value={formattedDate} />
          <Row label="Schedule time" value={formattedTime} />
          <Row label="Pick up location" value={pickupAddress ?? '—'} />
          <Row label="Drop off location" value={dropoffAddress ?? '—'} />
          {addOns ? <Row label="Add-ons selected" value={addOns} /> : null}
          <Row label="Amount" value={`₦${Number(totalAmount ?? 0).toLocaleString()}`} />
          {bookingId ? (
            <Row label="Booking ID" value={`#${bookingId.slice(-10).toUpperCase()}`} />
          ) : null}
        </View>

        <View style={styles.driverPending}>
          <Text style={{ fontWeight: '800', color: '#1D4ED8' }}>Driver will be assigned soon...</Text>
          <Text style={{ fontSize: 18 }}>🚗</Text>
        </View>

        <InfoBanner variant="info" text="Reminder: Please fuel the car as needed during your trip." />

        <View style={styles.btnRow}>
          <View style={{ flex: 1 }}>
            <PrimaryButton title="Cancel" variant="outline" onPress={() => router.back()} />
          </View>
          <View style={{ width: spacing.md }} />
          <View style={{ flex: 1 }}>
            <PrimaryButton
              title="Proceed to Payment"
              onPress={() =>
                router.push({
                  pathname: '/screens/payment',
                  params: {
                    bookingId,
                    packageType,
                    scheduledAt,
                    pickupAddress,
                    dropoffAddress,
                    totalAmount,
                    authorizationUrl,
                    reference,
                    addOns,
                  },
                })
              }
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 40 },
  title: { ...text.h2, fontSize: 18, lineHeight: 24, marginBottom: spacing.lg },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.softBorder,
    backgroundColor: '#fff',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowLabel: { ...text.body, color: colors.muted },
  rowValue: { ...text.body, fontWeight: '800' },
  driverPending: {
    marginBottom: spacing.lg,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.sky,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btnRow: { flexDirection: 'row', marginTop: spacing.lg },
});