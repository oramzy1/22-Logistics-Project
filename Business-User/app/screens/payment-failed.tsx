import { router, useLocalSearchParams } from 'expo-router';
import { XCircle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/AppText';
import { colors, radius, spacing } from '@/src/ui/theme';

export default function PaymentFailedScreen() {
  const { reference, bookingId } = useLocalSearchParams<{
    reference: string;
    bookingId: string;
  }>();

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <XCircle size={64} color="#EF4444" strokeWidth={1.5} />
        </View>
        <Text style={styles.title}>Payment Failed</Text>
        <Text style={styles.sub}>
          We couldn't process your payment. Your booking is still saved — you can retry or choose a different method.
        </Text>

        {reference ? (
          <View style={styles.refBox}>
            <Text style={styles.refLabel}>Reference</Text>
            <Text style={styles.refValue}>{reference}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.replace('/(tabs)/bookings')}
        >
          <Text style={styles.cancelText}>Go to My Bookings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
  content: { padding: spacing.lg, alignItems: 'center' },
  iconWrap: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 12, textAlign: 'center' },
  sub: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  refBox: {
    borderWidth: 1,
    borderColor: colors.softBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
    width: '100%',
    marginBottom: 32,
    alignItems: 'center',
  },
  refLabel: { fontSize: 11, color: colors.muted, marginBottom: 4 },
  refValue: { fontSize: 14, fontWeight: '700', color: '#111827' },
  retryBtn: {
    backgroundColor: '#E4C77B',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  retryText: { fontWeight: '700', color: '#3E2723', fontSize: 15 },
  cancelBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    width: '100%',
  },
  cancelText: { fontWeight: '600', color: '#374151', fontSize: 15 },
});