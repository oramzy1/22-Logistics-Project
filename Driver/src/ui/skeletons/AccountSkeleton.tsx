import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkeletonBox, SkeletonSpacer } from './SkeletonBase';
import { colors, spacing } from '@/src/ui/theme';

function AccordionSkeleton() {
  return (
    <View style={styles.accordion}>
      <View style={styles.accordionRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <SkeletonBox width={36} height={36} radius={8} />
          <SkeletonBox width={100} height={14} radius={6} />
        </View>
        <SkeletonBox width={20} height={20} radius={4} />
      </View>
    </View>
  );
}

export function AccountSkeleton() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.navy }}>
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Profile header */}
          <View style={styles.profileHeader}>
            <SkeletonBox width={80} height={80} radius={40} />
            <SkeletonSpacer height={12} />
            <SkeletonBox width={140} height={20} radius={8} />
            <SkeletonSpacer height={6} />
            <SkeletonBox width={110} height={14} radius={6} />
            <SkeletonSpacer height={4} />
            <SkeletonBox width={160} height={14} radius={6} />
            <SkeletonSpacer height={14} />
            <SkeletonBox width={120} height={36} radius={18} />
          </View>

          <SkeletonSpacer height={8} />

          {/* Accordion items */}
          {Array(7).fill(0).map((_, i) => (
            <AccordionSkeleton key={i} />
          ))}

          <SkeletonSpacer height={12} />

          {/* Danger zone */}
          <SkeletonBox width={100} height={12} radius={4} />
          <SkeletonSpacer height={8} />
          <View style={styles.dangerCard}>
            {Array(3).fill(0).map((_, i) => (
              <View key={i} style={[styles.accordionRow, i < 2 && styles.borderBottom]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <SkeletonBox width={18} height={18} radius={4} />
                  <View style={{ gap: 5 }}>
                    <SkeletonBox width={130} height={14} radius={6} />
                    <SkeletonBox width={180} height={11} radius={4} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: { padding: spacing.lg, paddingBottom: 60 },
  profileHeader: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
  accordion: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 1,
  },
  accordionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  dangerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    overflow: 'hidden',
    elevation: 1,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
});