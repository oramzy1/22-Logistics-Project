import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkeletonBox, SkeletonSpacer } from './SkeletonBase';
import { colors, spacing } from '@/src/ui/theme';
import { AppHeader } from '../AppHeader';

function BookingCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <SkeletonBox width={50} height={45} radius={6} />
        <SkeletonBox width={100} height={30} radius={3} />
        <SkeletonBox width={80} height={30} radius={3} />
      </View>
    </View>
  );
}

export function BookingsSkeleton() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#333' }}>
      <AppHeader title="My Bookings" rightIcons />
      <View style={styles.sheet}>
        {/* Filter pills */}
        <View style={styles.filterRow}>
          {[100].map((w, i) => (
            <SkeletonBox key={i} width='95%' height={40} radius={10} />
          ))}
        </View>
        <View style={styles.filterRow}>
          {[100, 100, 100].map((w, i) => (
            <SkeletonBox key={i} width={w} height={40} radius={20} />
          ))}
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {Array(14).fill(0).map((_, i) => (
            <BookingCardSkeleton key={i} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    backgroundColor:' #333',
  },
  content: { padding: spacing.lg, paddingBottom: 32, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});