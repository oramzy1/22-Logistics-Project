import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkeletonBox, SkeletonSpacer } from './SkeletonBase';
import { colors, spacing } from '@/src/ui/theme';
import { AppHeader } from '../AppHeader';

function HistoryCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <SkeletonBox width='100%' height={200} radius={6} />
      </View>
    </View>
  );
}

export function HistorySkeleton() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1}}>
      <AppHeader title="Trip History" showBack  rightIcons />
      <View style={styles.sheet}>
        {/* Filter pills */}
          <View style={{paddingHorizontal: spacing.lg, gap: 12}}>
          <SkeletonSpacer height={30} />
          <SkeletonBox width={90} height={30} radius={20}/>
          <SkeletonBox width={95} height={20} radius={20}/>
          </View>
        <View style={styles.filterRow}>
          {[100].map((w, i) => (
            <SkeletonBox key={i} width='95%' height={40} radius={50} />
          ))}
        </View>
        < SkeletonSpacer height={spacing.lg} />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {Array(14).fill(0).map((_, i) => (
            <HistoryCardSkeleton key={i} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    // backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10, 
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    // backgroundColor:' #333',
  },
  content: { padding: spacing.sm, paddingBottom: 32, gap: 12 },
  card: {
    // backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    // borderColor: '#F1F5F9',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});