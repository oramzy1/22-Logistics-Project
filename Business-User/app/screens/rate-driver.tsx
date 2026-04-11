import { BookingService } from '@/api/booking.service';
import { router, useLocalSearchParams } from 'expo-router';
import { Star } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Image, ScrollView,
  StyleSheet, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/AppText';
import { AppHeader } from '@/src/ui/AppHeader';
import { colors, spacing, radius } from '@/src/ui/theme';

const APP_LABELS = ['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];

function StarRow({ value, onChange, size = 36 }: { value: number; onChange: (v: number) => void; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 12 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <TouchableOpacity key={s} onPress={() => onChange(s)} style={{ marginHorizontal: 6 }}>
          <Star size={size} color="#FBBF24" fill={s <= value ? '#FBBF24' : 'transparent'} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function RateDriverScreen() {
  const { bookingId, driverName, driverAvatar } = useLocalSearchParams<{
    bookingId: string;
    driverName: string;
    driverAvatar: string;
  }>();

  const [step, setStep] = useState<'driver' | 'app' | 'done'>('driver');
  const [driverRating, setDriverRating] = useState(0);
  const [driverComment, setDriverComment] = useState('');
  const [appRating, setAppRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitDriver = async () => {
    if (driverRating > 0) {
      setIsLoading(true);
      try {
        await BookingService.rateDriver(bookingId, driverRating, driverComment);
      } catch { /* non-blocking */ }
      finally { setIsLoading(false); }
    }
    setStep('app');
  };

  const handleFinish = () => {
    setStep('done');
    setTimeout(() => {
      router.replace('/(tabs)/bookings');
    }, 2000);
  };

  if (step === 'done') {
    return (
      <SafeAreaView style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 64 }}>🎉</Text>
        <Text style={styles.title}>Thank You!</Text>
        <Text style={styles.sub}>Your feedback helps us improve 22Logistics.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <AppHeader title={step === 'driver' ? 'Rate Your Driver' : 'Rate 22Logistics'} showBack />
      <ScrollView contentContainerStyle={styles.content}>

        {step === 'driver' && (
          <>
            {/* Driver card with real avatar */}
            <View style={styles.driverCard}>
              {driverAvatar ? (
                <Image source={{ uri: driverAvatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>
                    {driverName?.charAt(0)?.toUpperCase() ?? '?'}
                  </Text>
                </View>
              )}
              <Text style={styles.driverName}>{driverName ?? 'Your Driver'}</Text>
              <Text style={styles.sub}>How was your experience?</Text>
            </View>

            <StarRow value={driverRating} onChange={setDriverRating} size={40} />
            {driverRating > 0 && (
              <Text style={styles.ratingLabel}>
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][driverRating]}
              </Text>
            )}

            <Text style={styles.inputLabel}>Leave a comment (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Tell us about your experience..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              value={driverComment}
              onChangeText={setDriverComment}
            />

            <TouchableOpacity style={styles.btn} onPress={handleSubmitDriver} disabled={isLoading}>
              {isLoading
                ? <ActivityIndicator color="#3E2723" />
                : <Text style={styles.btnText}>{driverRating === 0 ? 'Skip' : 'Submit Rating'}</Text>}
            </TouchableOpacity>
          </>
        )}

        {step === 'app' && (
          <>
            <Text style={[styles.title, { marginTop: 24 }]}>Rate 22Logistics</Text>
            <Text style={styles.sub}>How was your overall app experience?</Text>
            <View style={{ alignItems: 'center', marginVertical: 16 }}>
              <Text style={{ fontSize: 56 }}>⭐</Text>
            </View>
            <StarRow value={appRating} onChange={setAppRating} size={40} />
            {appRating > 0 && (
              <Text style={styles.ratingLabel}>{APP_LABELS[appRating - 1]}</Text>
            )}
            <View style={styles.pillRow}>
              {['Great ride!', 'Easy to use', 'Fast booking', 'Reliable', 'Affordable'].map(tag => (
                <TouchableOpacity key={tag} style={styles.pill}>
                  <Text style={styles.pillText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.btn} onPress={handleFinish}>
              <Text style={styles.btnText}>{appRating === 0 ? 'Skip & Finish' : 'Submit & Finish'}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 48 },
  driverCard: { alignItems: 'center', marginBottom: 8 },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 12 },
  avatarFallback: { backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  driverName: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  ratingLabel: { textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#F59E0B', marginBottom: 8 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 12, fontSize: 14, color: '#111827',
    textAlignVertical: 'top', minHeight: 80,
  },
  btn: { backgroundColor: '#E4C77B', paddingVertical: 16, borderRadius: 28, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#3E2723', fontWeight: '700', fontSize: 15 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 16 },
  pill: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  pillText: { fontSize: 13, color: '#374151' },
});