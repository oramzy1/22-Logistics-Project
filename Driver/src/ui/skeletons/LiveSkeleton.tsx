import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkeletonBox, SkeletonSpacer } from './SkeletonBase';

export function LiveSkeleton() {
  return (
    <View style={styles.root}>
      {/* Map placeholder */}
      <SkeletonBox width="100%" height="100%" radius={0} />

      {/* Bottom card overlay */}
      <SafeAreaView style={styles.overlay} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <SkeletonBox width={44} height={44} radius={22} />
          <SkeletonBox width={60} height={20} radius={8} />
          <SkeletonBox width={44} height={44} radius={22} />
        </View>

        <View style={styles.bottomCard}>
          {/* Drawer handle */}
          <View style={styles.handle} />

          {/* Route box */}
          <View style={styles.routeBox}>
            <View style={styles.routeRow}>
              <SkeletonBox width={10} height={10} radius={5} />
              <View style={{ marginLeft: 16, flex: 1, gap: 5 }}>
                <SkeletonBox width={80} height={11} radius={4} />
                <SkeletonBox width="70%" height={14} radius={6} />
              </View>
            </View>
            <SkeletonSpacer height={12} />
            <View style={styles.routeRow}>
              <SkeletonBox width={10} height={10} radius={5} />
              <View style={{ marginLeft: 16, flex: 1, gap: 5 }}>
                <SkeletonBox width={80} height={11} radius={4} />
                <SkeletonBox width="60%" height={14} radius={6} />
              </View>
            </View>
          </View>
          <SkeletonSpacer height={16} />

          {/* Driver card */}
          <View style={styles.driverCard}>
            <View style={styles.driverTop}>
              <SkeletonBox width={50} height={50} radius={25} />
              <View style={{ flex: 1, marginLeft: 12, gap: 6 }}>
                <SkeletonBox width={120} height={16} radius={6} />
                <SkeletonBox width={90} height={12} radius={4} />
                <SkeletonBox width={80} height={12} radius={4} />
              </View>
              <View style={{ alignItems: 'flex-end', gap: 8 }}>
                <SkeletonBox width={60} height={35} radius={6} />
                <SkeletonBox width={80} height={26} radius={13} />
              </View>
            </View>
            <SkeletonSpacer height={16} />
            <View style={styles.timesRow}>
              <SkeletonBox width={90} height={32} radius={8} />
              <SkeletonBox width={90} height={32} radius={8} />
            </View>
          </View>
          <SkeletonSpacer height={16} />

          {/* Extend section */}
          <View style={styles.extendBox}>
            <View style={styles.routeRow}>
              <SkeletonBox width={100} height={16} radius={6} />
              <SkeletonBox width={44} height={26} radius={13} />
            </View>
          </View>
          <SkeletonSpacer height={16} />

          {/* End trip button */}
          <SkeletonBox width="100%" height={54} radius={27} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'space-between' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  bottomCard: {
    flex: 0.8,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },
  handle: {
    width: 40, height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  routeBox: {
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  driverCard: {
    backgroundColor: '#E8EFFF',
    borderRadius: 16,
    padding: 16,
  },
  driverTop: { flexDirection: 'row', alignItems: 'center' },
  timesRow: { flexDirection: 'row', justifyContent: 'space-between' },
  extendBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
  },
});