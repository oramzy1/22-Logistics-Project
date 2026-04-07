import { BookingService } from '@/api/booking.service';
import { Booking, useBookings } from '@/context/BookingContext';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Modal,
  StyleSheet, TouchableOpacity, View,
} from 'react-native';
import { Text } from '../../components/AppText';

const CANCEL_REASONS = [
  'Change of plans',
  'Found another ride',
  'Driver is taking too long',
  'Booked by mistake',
  'Emergency came up',
  'Price is too high',
  'Other',
];

type Step = 'reason' | 'refund' | 'done';

type Props = {
  booking: Booking;
  onClose: () => void;
};

export function CancelRideFlow({ booking, onClose }: Props) {
  const [step, setStep] = useState<Step>('reason');
  const [selectedReason, setSelectedReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { fetchBookings } = useBookings();

  const isPaid = booking.paymentStatus === 'PAID';

  const handleReasonNext = () => {
    if (!selectedReason) {
      Alert.alert('Please select a reason');
      return;
    }
    if (isPaid) {
      setStep('refund'); // ask about refund
    } else {
      handleCancel(false); // no payment, just cancel
    }
  };

const handleCancel = async (requestRefund: boolean) => {
  setIsLoading(true);
  try {
    await BookingService.cancelWithReason(booking.id, selectedReason, requestRefund);
    await fetchBookings();
    onClose();
    router.replace('/(tabs)/bookings');
  } catch (err: any) {
    console.error('Cancel error:', JSON.stringify({
      status: err?.response?.status,
      data: err?.response?.data,
      message: err?.message,
    }));
    Alert.alert(
      'Error',
      err?.response?.data?.message ?? err?.message ?? 'Failed to cancel booking',
    );
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={20} color="#374151" />
          </TouchableOpacity>

          {/* ── SELECT REASON ── */}
          {step === 'reason' && (
            <>
              <Text style={styles.title}>Cancel Booking</Text>
              <Text style={styles.sub}>Please tell us why you're cancelling.</Text>

              <View style={styles.reasonList}>
                {CANCEL_REASONS.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.reasonRow, selectedReason === r && styles.reasonRowSelected]}
                    onPress={() => setSelectedReason(r)}
                  >
                    <View style={[styles.radio, selectedReason === r && styles.radioSelected]}>
                      {selectedReason === r && <View style={styles.radioDot} />}
                    </View>
                    <Text style={[styles.reasonText, selectedReason === r && { color: '#111827', fontWeight: '600' }]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.dangerBtn, !selectedReason && styles.btnDisabled]}
                onPress={handleReasonNext}
                disabled={!selectedReason || isLoading}
              >
                {isLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.dangerBtnText}>Continue</Text>}
              </TouchableOpacity>
            </>
          )}

          {/* ── REFUND REQUEST ── */}
          {step === 'refund' && (
            <>
              <Text style={styles.title}>Request a Refund?</Text>
              <Text style={styles.sub}>
                You paid ₦{booking.totalAmount.toLocaleString()} for this booking.
                Would you like to request a refund?
              </Text>

              <View style={styles.refundInfoBox}>
                <Text style={styles.refundInfoTitle}>Refund Policy</Text>
                <Text style={styles.refundInfoText}>
                  • Refunds are processed within 3–5 business days.{'\n'}
                  • Cancellations made less than 1 hour before pickup may incur a fee.{'\n'}
                  • Refunds are returned to your original payment method.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => handleCancel(true)}
                disabled={isLoading}
              >
                {isLoading
                  ? <ActivityIndicator color="#3E2723" />
                  : <Text style={styles.primaryBtnText}>Yes, Request Refund</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={() => handleCancel(false)}
                disabled={isLoading}
              >
                <Text style={styles.outlineBtnText}>Cancel Without Refund</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 48,
    maxHeight: '90%',
  },
  handle: {
    width: 40, height: 5, backgroundColor: '#E5E7EB',
    borderRadius: 3, alignSelf: 'center', marginBottom: 16,
  },
  closeBtn: {
    position: 'absolute', top: 20, right: 20,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 8, marginTop: 8 },
  sub: { fontSize: 14, color: '#6B7280', marginBottom: 20, lineHeight: 20 },
  reasonList: { marginBottom: 20, gap: 4 },
  reasonRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 12,
    borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6',
    marginBottom: 6,
  },
  reasonRowSelected: { borderColor: '#111827', backgroundColor: '#F9F9F9' },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  radioSelected: { borderColor: '#111827' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#111827' },
  reasonText: { fontSize: 14, color: '#6B7280' },
  dangerBtn: {
    backgroundColor: '#EF4444', paddingVertical: 16,
    borderRadius: 28, alignItems: 'center',
  },
  btnDisabled: { backgroundColor: '#F3F4F6' },
  dangerBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  primaryBtn: {
    backgroundColor: '#E4C77B', paddingVertical: 16,
    borderRadius: 28, alignItems: 'center', marginBottom: 12,
  },
  primaryBtnText: { color: '#3E2723', fontWeight: '700', fontSize: 15 },
  outlineBtn: {
    borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: 16,
    borderRadius: 28, alignItems: 'center',
  },
  outlineBtnText: { color: '#374151', fontWeight: '600', fontSize: 15 },
  refundInfoBox: {
    backgroundColor: '#FEF3C7', borderRadius: 12,
    padding: 16, marginBottom: 24,
  },
  refundInfoTitle: { fontSize: 13, fontWeight: '700', color: '#92400E', marginBottom: 8 },
  refundInfoText: { fontSize: 13, color: '#78350F', lineHeight: 20 },
});