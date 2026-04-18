import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SkeletonBox, SkeletonSpacer } from "./SkeletonBase";
import { colors, radius, spacing } from "@/src/ui/theme";
import { useAppTheme } from "../useAppTheme";

function PackageCardSkeleton() {
  const {  colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);
  return (
    <View style={styles.pkg}>
      <SkeletonBox width={10} height={10} radius={5} />
      <SkeletonSpacer height={10} />
      <SkeletonBox width={80} height={20} radius={6} />
      <SkeletonSpacer height={8} />
      <SkeletonBox width={60} height={20} radius={6} />
    </View>
  );
}

export function HomeSkeleton() {
  const { isDark, colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);
  return (
    <SafeAreaView edges={["top"]} style={styles.origin}>
      <View style={styles.root}>
        {/* Header */}
        <View style={styles.top}>
          <View style={styles.header}>
            {/* Left avatar */}
            <SkeletonBox width={38} height={38} radius={19} />
            {/* Title block */}
            <View style={{ flex: 1, marginLeft: 12, gap: 6 }}>
              <SkeletonBox width={140} height={16} radius={6} />
              <SkeletonBox width={100} height={12} radius={4} />
            </View>
            {/* Right icons */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <SkeletonBox width={36} height={36} radius={18} />
              <SkeletonBox width={36} height={36} radius={18} />
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* h1 */}
          <SkeletonBox width={200} height={26} radius={8} />
          <SkeletonSpacer height={spacing.lg} />

          {/* "Special Offers" label */}
          <SkeletonBox width={120} height={16} radius={6} />
          <SkeletonSpacer height={12} />

          {/* Offer banner */}
          <View style={styles.offerBanner}>
            <SkeletonBox width="100%" height={180} radius={radius.xl} />
            {/* Overlay content shimmer */}
            <View style={styles.offerContent}>
              <SkeletonBox width={80} height={20} radius={6} />
              <SkeletonSpacer height={10} />
              <SkeletonBox width={160} height={20} radius={6} />
              <SkeletonSpacer height={8} />
              <SkeletonBox width={200} height={14} radius={4} />
              <SkeletonSpacer height={4} />
              <SkeletonBox width={180} height={14} radius={4} />
              <SkeletonSpacer height={14} />
              <SkeletonBox width={100} height={38} radius={20} />
            </View>
          </View>

          {/* Dots */}
          {/* <View style={styles.dots}>
            <SkeletonBox width={6} height={4} radius={3} />
            <SkeletonBox width={18} height={4} radius={3} />
            <SkeletonBox width={6} height={4} radius={3} />
          </View> */}
          <SkeletonSpacer height={spacing.lg} />

          {/* "Schedule Your Ride" label */}
          <SkeletonBox width={160} height={16} radius={6} />
          <SkeletonSpacer height={12} />

          {/* Package grid — 5 cards, matching "47%" width layout */}
          <View style={styles.grid}>
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <PackageCardSkeleton key={i} />
              ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (themeColors: any) =>
  StyleSheet.create({
    origin: { flex: 1, backgroundColor: themeColors.navy },
    root: { backgroundColor: themeColors.background, height: "100%" },
    top: { backgroundColor: themeColors.navy, paddingBottom: spacing.md },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: 12,
    },
    content: { padding: spacing.lg, paddingBottom: 40 },
    offerBanner: {
      position: "relative",
      borderRadius: radius.xl,
      overflow: "hidden",
    },
    offerContent: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: spacing.lg,
      justifyContent: "center",
      // backgroundColor: themeColors.background,
    },
    dots: {
      marginTop: 10,
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
      alignItems: "center",
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
    },
    pkg: {
      width: "47%",
      minHeight: 120,
      borderRadius: radius.xl,
      backgroundColor: themeColors.background,
      // borderWidth: 1,
      // borderColor: themeColors.border,
      padding: spacing.lg,
      justifyContent: "center",
    },
  });
