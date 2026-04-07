import { BookingService } from '@/api/booking.service';
import { useBookings } from '@/context/BookingContext';
import { colors, radius, spacing } from '@/src/ui/theme';
import { router } from 'expo-router';
import { Star, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Modal, ScrollView,
  StyleSheet, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Text } from '../../components/AppText';

type Step = 'confirm' | 'rate_driver' | 'rate_app' | 'done';

type Props = {
  bookingId: string;
  driverName?: string;
  onClose: () => void;
};

const APP_RATING_LABELS = ['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];

export function EndTripFlow({ bookingId, driverName, onClose }: Props) {
  const [step, setStep] = useState<Step>('confirm');
  const [isLoading, setIsLoading] = useState(false);

  // Driver rating state
  const [driverRating, setDriverRating] = useState(0);
  const [driverComment, setDriverComment] = useState('');

  // App rating state
  const [appRating, setAppRating] = useState(0);

  const { fetchBookings } = useBookings();

  const handleEndTrip = async () => {
    setIsLoading(true);
    try {
      await BookingService.endTrip(bookingId);
      setStep('rate_driver');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to end trip');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitDriverRating = async () => {
    if (driverRating === 0) {
      setStep('rate_app');
      return;
    }
    setIsLoading(true);
    try {
      await BookingService.rateDriver(bookingId, driverRating, driverComment);
    } catch {
      // Non-blocking — proceed anyway
    } finally {
      setIsLoading(false);
      setStep('rate_app');
    }
  };

// const handleFinish = async () => {
//   setIsLoading(true);
//   await new Promise(res => setTimeout(res, 50));
//   try {
//     await fetchBookings();
//   } catch {
//     // non-blocking
//   } finally {
//     setIsLoading(false);
//     onClose();                          // close modal first
//     router.replace('/(tabs)/bookings'); // then navigate
//   }
// };


const handleFinish = () => {
  setIsLoading(true);
  // 1. Move to the Thank You 'done' step immediately
  setStep('done');
  // 2. Wait 3 Seconds (3000ms), then close modal, navigate away, and trigger the data fetch!
  setTimeout(() => {
    onClose(); 
    router.replace('/(tabs)/bookings'); 
    
    // Trigger the context fetch slightly after navigating so the Booking tab shows the skeleton
    setTimeout(() => {
       fetchBookings().catch(console.error);
    }, 100);
  }, 3000); // 3-second delay
};


  const StarRow = ({
    value, onChange, size = 36,
  }: { value: number; onChange: (v: number) => void; size?: number }) => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <TouchableOpacity key={s} onPress={() => onChange(s)} style={{ marginHorizontal: 4 }}>
          <Star
            size={size}
            color="#FBBF24"
            fill={s <= value ? '#FBBF24' : 'transparent'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* ── CONFIRM END ── */}
          {step === 'confirm' && (
            <>
              <Text style={styles.sheetTitle}>End Trip?</Text>
              <Text style={styles.sheetSub}>
                Are you sure you want to end your current trip? This action cannot be undone.
              </Text>
              <View style={styles.emoji}><Text style={{ fontSize: 48 }}>🏁</Text></View>
              <TouchableOpacity
                style={styles.dangerBtn}
                onPress={handleEndTrip}
                disabled={isLoading}
              >
                {isLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.dangerBtnText}>Yes, End Trip</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.outlineBtn} onPress={onClose} disabled={isLoading}>
                <Text style={styles.outlineBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── RATE DRIVER ── */}
          {step === 'rate_driver' && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sheetTitle}>Rate Your Driver</Text>
              <Text style={styles.sheetSub}>
                How was your experience with {driverName ?? 'your driver'}?
              </Text>

              <View style={styles.driverCard}>
                <View style={styles.driverAvatar}>
                  <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>
                    {driverName?.charAt(0)?.toUpperCase() ?? '?'}
                  </Text>
                </View>
                <Text style={styles.driverName}>{driverName ?? 'Your Driver'}</Text>
              </View>

              <StarRow value={driverRating} onChange={setDriverRating} />

              {driverRating > 0 && (
                <Text style={styles.ratingLabel}>{
                  ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][driverRating]
                }</Text>
              )}

              <Text style={styles.inputLabel}>Leave a comment (optional)</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Tell us about your experience..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                value={driverComment}
                onChangeText={setDriverComment}
              />

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleSubmitDriverRating}
                disabled={isLoading}
              >
                {isLoading
                  ? <ActivityIndicator color="#3E2723" />
                  : <Text style={styles.primaryBtnText}>
                      {driverRating === 0 ? 'Skip' : 'Submit Rating'}
                    </Text>}
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* ── RATE APP ── */}
          {step === 'rate_app' && (
            <>
              <Text style={styles.sheetTitle}>Rate 22Logistics</Text>
              <Text style={styles.sheetSub}>
                How was your overall experience with our app?
              </Text>
              <View style={styles.emoji}><Text style={{ fontSize: 56 }}>⭐</Text></View>

              <StarRow value={appRating} onChange={setAppRating} size={40} />

              {appRating > 0 && (
                <Text style={styles.ratingLabel}>{APP_RATING_LABELS[appRating - 1]}</Text>
              )}

              <View style={styles.appRatingPills}>
                {['Great ride!', 'Easy to use', 'Fast booking', 'Reliable', 'Affordable'].map(tag => (
                  <TouchableOpacity key={tag} style={styles.pill}>
                    <Text style={styles.pillText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleFinish} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#3E2723" />
                ) : (
                  <Text style={styles.primaryBtnText} >
                    {appRating === 0 ? 'Skip & Finish' : 'Submit & Finish'}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {step === 'done' && (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ fontSize: 64, marginBottom: 16 }}>🎉</Text>
              <Text style={styles.sheetTitle}>Thank You!</Text>
              <Text style={styles.sheetSub}>
                Your feedback helps us improve 22Logistics.
              </Text>
              
              {/* Optional: A spinner so the user knows it's working before navigating away */}
              <ActivityIndicator color="#E4C77B" size="large" style={{ marginTop: 24 }} />
            </View>
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
    borderRadius: 3, alignSelf: 'center', marginBottom: 24,
  },
  sheetTitle: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 },
  sheetSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  emoji: { alignItems: 'center', marginBottom: 24 },
  dangerBtn: {
    backgroundColor: '#EF4444', paddingVertical: 16,
    borderRadius: 28, alignItems: 'center', marginBottom: 12,
  },
  dangerBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  outlineBtn: {
    borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: 16,
    borderRadius: 28, alignItems: 'center',
  },
  outlineBtnText: { color: '#374151', fontWeight: '600', fontSize: 15 },
  primaryBtn: {
    backgroundColor: '#E4C77B', paddingVertical: 16,
    borderRadius: 28, alignItems: 'center', marginTop: 16,
  },
  primaryBtnText: { color: '#3E2723', fontWeight: '700', fontSize: 15 },
  driverCard: { alignItems: 'center', marginBottom: 20 },
  driverAvatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.navy, alignItems: 'center',
    justifyContent: 'center', marginBottom: 10,
  },
  driverName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  starRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  ratingLabel: {
    textAlign: 'center', fontSize: 16, fontWeight: '700',
    color: '#F59E0B', marginBottom: 16,
  },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  commentInput: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 12, fontSize: 14, color: '#111827',
    textAlignVertical: 'top', minHeight: 80, marginBottom: 4,
  },
  appRatingPills: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    justifyContent: 'center', marginTop: 16,
  },
  pill: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  pillText: { fontSize: 13, color: '#374151', fontWeight: '500' },
});