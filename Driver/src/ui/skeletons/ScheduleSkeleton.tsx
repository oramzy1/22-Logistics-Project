import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkeletonBox, SkeletonSpacer } from './SkeletonBase';
import { colors, spacing } from '@/src/ui/theme';

export function ScheduleSkeleton() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.navy }}>
      <View style={styles.sheet}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <SkeletonBox width={200} height={28} radius={8} />
          <SkeletonSpacer height={16} />

          {/* Package pills */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[80, 90, 100, 80, 110].map((w, i) => (
              <SkeletonBox key={i} width={w} height={52} radius={24} />
            ))}
          </View>
          <SkeletonSpacer height={20} />

          {/* Form fields */}
          {Array(6).fill(0).map((_, i) => (
            <View key={i}>
              <SkeletonBox width={160} height={14} radius={6} />
              <SkeletonSpacer height={8} />
              <SkeletonBox width="100%" height={52} radius={10} />
              <SkeletonSpacer height={16} />
            </View>
          ))}

          {/* Extras section */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <SkeletonBox width={160} height={16} radius={6} />
            <SkeletonBox width={44} height={26} radius={13} />
          </View>
          <SkeletonSpacer height={12} />
          <View style={styles.extrasBox}>
            {Array(5).fill(0).map((_, i) => (
              <View key={i} style={styles.extrasRow}>
                <SkeletonBox width={20} height={20} radius={4} />
                <SkeletonBox width={140} height={14} radius={6} />
                <SkeletonBox width={60} height={14} radius={6} />
              </View>
            ))}
          </View>
          <SkeletonSpacer height={20} />

          {/* Total box */}
          <SkeletonBox width={120} height={16} radius={6} />
          <SkeletonSpacer height={8} />
          <SkeletonBox width="100%" height={56} radius={10} />
          <SkeletonSpacer height={20} />

          {/* Button */}
          <SkeletonBox width="100%" height={54} radius={27} />
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
  content: { padding: spacing.lg, paddingBottom: 32 },
  extrasBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 10,
    gap: 14,
  },
  extrasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});