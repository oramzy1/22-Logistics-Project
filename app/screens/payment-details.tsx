import { router, useLocalSearchParams } from 'expo-router';
import { Download } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/AppText';
import { AppHeader } from '@/src/ui/AppHeader';
import { useBookings } from '@/context/BookingContext';
import { colors, radius, spacing, text } from '@/src/ui/theme';

function Row({
  label, value, valueStyle, noBorder,
}: {
  label: string; value: string; valueStyle?: any; noBorder?: boolean;
}) {
  return (
    <View style={[styles.row, noBorder && { borderBottomWidth: 0 }]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueStyle]}>{value}</Text>
    </View>
  );
}

export default function PaymentHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bookings } = useBookings();

  const booking = bookings.find((b) => b.id === id);

  if (!booking) {
    return (
      <SafeAreaView style={styles.root}>
        <AppHeader title="View Payment History" showBack rightIcons />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.muted }}>Booking not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate = new Date(booking.scheduledAt).toLocaleDateString('en-NG', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  const formattedTime = new Date(booking.scheduledAt).toLocaleTimeString('en-NG', {
    hour: '2-digit', minute: '2-digit',
  });

  const statusColor =
    booking.status === 'COMPLETED' ? '#22C55E'
    : booking.status === 'CANCELLED' ? '#EF4444'
    : '#F59E0B';

  const paymentColor = booking.paymentStatus === 'PAID' ? '#22C55E' : '#EF4444';

  return (
    <SafeAreaView style={styles.root}>
      <AppHeader title="View Payment History" showBack rightIcons />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Billing Header */}
        <View style={styles.billingHeader}>
          <View>
            <Text style={styles.billingTitle}>BILLING Details</Text>
            <Text style={styles.billingRideType}>{booking.packageType}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.billingAmount}>₦{booking.totalAmount.toLocaleString()}</Text>
          </View>
        </View>

        {/* Top Meta Row */}
        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>{formattedDate}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.metaLabel}>Ride Status</Text>
            <Text style={[styles.metaValue, { color: statusColor }]}>
              {booking.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Invoice Row */}
        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>INVOICE NUMBER</Text>
            <Text style={styles.metaValue}>22LOG{booking.id.slice(-8).toUpperCase()}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.metaLabel}>Payment</Text>
            <Text style={styles.metaValue}>
              {booking.paymentStatus === 'PAID' ? 'Card' : 'Pending'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Detail Rows */}
        <View style={styles.card}>
          <Row label="Schedule date" value={formattedDate} />
          <Row label="Schedule time" value={formattedTime} />
          <Row label="Pick up location" value={booking.pickupAddress} />
          <Row label="Drop off location" value={booking.dropoffAddress} />
          {booking.notes ? (
            <Row label="Add-ons selected" value={booking.notes.replace('Interstate: ', '')} />
          ) : null}
          <Row label="Booking ID" value={`#${booking.paymentRef.slice(-12).toUpperCase()}`} />
          <Row
            label="Driver Status"
            value={booking.driver ? 'Assigned' : 'Pending'}
            valueStyle={{ color: booking.driver ? '#22C55E' : '#F59E0B' }}
          />
          <Row
            label="Status Badge"
            value={booking.status === 'CANCELLED' ? 'Cancel' : booking.status.replace('_', ' ')}
            valueStyle={{ color: statusColor }}
          />
          <Row
            label="Payment status"
            value={booking.paymentStatus === 'PAID' ? 'Successful' : 'Unpaid'}
            valueStyle={{ color: paymentColor }}
            noBorder
          />
        </View>

        {/* Download Button */}
        <TouchableOpacity style={styles.downloadBtn}>
          <Download size={16} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.downloadText}>Download</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 40 },
  billingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  billingTitle: { fontSize: 13, fontWeight: '800', color: '#111827', marginBottom: 4 },
  billingRideType: { fontSize: 22, fontWeight: '900', color: '#111827' },
  billingAmount: { fontSize: 22, fontWeight: '900', color: '#111827' },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  metaLabel: { fontSize: 11, color: colors.muted, marginBottom: 2 },
  metaValue: { fontSize: 13, fontWeight: '700', color: '#111827' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: spacing.md },
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
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowLabel: { ...text.body, color: colors.muted },
  rowValue: { ...text.body, fontWeight: '800', textAlign: 'right', flex: 1, marginLeft: 16 },
  downloadBtn: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});