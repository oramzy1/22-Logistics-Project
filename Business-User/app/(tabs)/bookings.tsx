import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/AppText";

import { useBookings } from "@/context/BookingContext";
import { AppHeader } from "@/src/ui/AppHeader";
import { BookingsSkeleton } from "@/src/ui/skeletons/BookingsSkeleton";
import { StatusPill } from "@/src/ui/StatusPill";
import { colors, radius, spacing, text } from "@/src/ui/theme";
import { Image } from "expo-image";
import { useAppTheme } from "@/src/ui/useAppTheme";
import { Calendar, Check, Recycle, X } from "lucide-react-native";
import EmptyState from "@/src/ui/EmptyState";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function BookingsTabScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);
  const [query, setQuery] = useState("");
  const [seg, setSeg] = useState<any>(() => {
    if (params?.tab === "Cancelled") return "Cancelled";
    if (params?.tab === "Upcoming") return "Upcoming";
    if (params?.tab === "Ongoing") return "Ongoing";
    return "Completed";
  });
  const { bookings, isLoading, fetchBookings } = useBookings();

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    const segFiltered = bookings.filter((b) => {
      if (seg === "Ongoing")
        return b.status === "IN_PROGRESS" || b.status === "ACCEPTED";

      if (seg === "Upcoming") return b.status === "AWAITING_DRIVER";

      if (seg === "Completed") return b.status === "COMPLETED";

      if (seg === "Cancelled") return b.status === "CANCELLED";

      return true;
    });
    return q
      ? segFiltered.filter((b) => b.packageType.toLowerCase().includes(q))
      : segFiltered;
  }, [query, seg, bookings]);

  const emptyStateConfig: Record<string, any> = {
    Upcoming: {
      title: "No Upcoming",
      subtitle: "You haven’t booked any trips yet. ",
      Icon: Calendar,
    },
    Completed: {
      title: "No Completed Trips",
      subtitle:
        "Your completed trips will appear here once you've scheduled and finished a trip.",
      Icon: Check,
    },
    Ongoing: {
      title: "No Upcoming Trips",
      subtitle: "You have no ongoing trips.",
      Icon: Recycle,
    },
    Cancelled: {
      title: "No Cancelled Trips",
      subtitle: "Trips you cancel will appear here.",
      Icon: X,
    },
  };

  const { title, subtitle, Icon } = emptyStateConfig[seg];

  if (isLoading) {
    return <BookingsSkeleton />;
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <AppHeader title="Booking" rightIcons />
      <View style={styles.content}>
        <TextInput
          placeholder="Search"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          style={styles.search}
        />

        <View style={styles.segments}>
          {(["Ongoing", "Upcoming", "Cancelled", "Completed"] as const).map((s) => {
            const active = seg === s;
            return (
              <Pressable
                key={s}
                onPress={() => setSeg(s)}
                style={[styles.segment, active && styles.segmentActive]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    active && styles.segmentTextActive,
                  ]}
                >
                  {s}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {data.length === 0 ? (
          <EmptyState Icon={Icon} title={title} subtitle={subtitle} />
        ) : (
          <FlatList
            data={data}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/screens/payment-details",
                    params: { id: item.id },
                  })
                }
                style={styles.card}
              >
                <View style={styles.badge}>
                  <Image
                    source={require("../../assets/images/SmallLogo.png")}
                    style={{ width: "60%", height: "60%" }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{item.packageType}</Text>
                  <Text style={styles.amount}>
                    ₦{item.totalAmount.toLocaleString()}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.date}>
                    {new Date(item.scheduledAt).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                  <StatusPill
                    status={
                      item.paymentStatus === "UNPAID"
                        ? "Pay Later"
                        : item.status === "COMPLETED"
                          ? "Completed"
                          : item.status === "CANCELLED"
                            ? "Cancelled"
                            : user?.role === "BUSINESS"
                              ? "Monthly Billing"
                              : "Active"
                    }
                  />
                </View>
              </Pressable>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (themeColors: any) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: themeColors.navy },
    content: {
      flex: 1,
      padding: spacing.lg,
      backgroundColor: themeColors.background,
    },
    search: {
      height: 46,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: themeColors.border,
      paddingHorizontal: 14,
      backgroundColor: themeColors.background,
    },
    segments: {
      flexDirection: "row",
      gap: 10,
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },
    segment: {
      flex: 1,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: themeColors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: themeColors.background,
    },
    segmentActive: {
      backgroundColor: colors.goldSoft,
      borderColor: colors.goldSoft,
    },
    segmentText: {
      ...text.small,
      color: themeColors.textSecondary,
      fontWeight: "700",
    },
    segmentTextActive: {
      color: "#3A2A00",
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: themeColors.softBorder,
      backgroundColor: themeColors.card,
    },
    badge: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: "#F4F4F4",
      alignItems: "center",
      justifyContent: "center",
    },
    title: { ...text.body, fontWeight: "600", color: themeColors.textPrimary },
    amount: {
      ...text.body,
      fontWeight: "600",
      marginTop: 2,
      color: themeColors.textSecondary,
    },
    date: { ...text.small, color: colors.muted },
  });
