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

type BookingStatus = "Successful" | "Pay Later" | "Monthly Billing" | null;

type BookingItem = {
  id: string;
  title: string;
  amount: string;
  date: string;
  status: BookingStatus;
};

const BOOKINGS: BookingItem[] = [
  {
    id: "1",
    title: "3 hrs Ride",
    amount: "₦24,000",
    date: "Mar 15, 2025",
    status: "Successful",
  },
  {
    id: "2",
    title: "3 hrs Ride",
    amount: "₦24,000",
    date: "Mar 15, 2025",
    status: "Successful",
  },
  {
    id: "3",
    title: "6 hrs Ride",
    amount: "₦34,000",
    date: "Mar 15, 2025",
    status: "Successful",
  },
  {
    id: "4",
    title: "Airport Pickup",
    amount: "₦54,000",
    date: "Mar 15, 2025",
    status: "Pay Later",
  },
  {
    id: "5",
    title: "Multi-day",
    amount: "₦80,000",
    date: "Mar 15, 2025",
    status: "Successful",
  },
  {
    id: "6",
    title: "Multi-day",
    amount: "₦77,000",
    date: "Mar 15, 2025",
    status: "Monthly Billing",
  },
  {
    id: "7",
    title: "Multi-day",
    amount: "₦77,000",
    date: "Mar 15, 2025",
    status: "Pay Later",
  },
  {
    id: "8",
    title: "Airport Pickup",
    amount: "₦54,000",
    date: "Mar 15, 2025",
    status: "Pay Later",
  },
];

export default function BookingsTabScreen() {
  const [query, setQuery] = useState("");
  const [seg, setSeg] = useState<"Ongoing" | "Upcoming" | "Completed">(
    "Upcoming",
  );
  const { bookings, isLoading, fetchBookings } = useBookings();

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    const segFiltered = bookings.filter((b) => {
      if (seg === "Ongoing") return b.status === "IN_PROGRESS" ||  b.status === "ACCEPTED";
      if (seg === "Upcoming")
        return b.status === "AWAITING_DRIVER";
      if (seg === "Completed")
        return b.status === "COMPLETED" || b.status === "CANCELLED";
      return true;
    });
    return q
      ? segFiltered.filter((b) => b.packageType.toLowerCase().includes(q))
      : segFiltered;
  }, [query, seg, bookings]);

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
          {(["Ongoing", "Upcoming", "Completed"] as const).map((s) => {
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
                <Image source={require("../../assets/images/SmallLogo.png")} style={{width: '60%', height: '60%'}} />
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
                        ? "Successful"
                        : null
                  }
                />
              </View>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  content: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  search: {
    height: 46,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
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
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  segmentActive: {
    backgroundColor: colors.goldSoft,
    borderColor: colors.goldSoft,
  },
  segmentText: {
    ...text.small,
    color: colors.muted,
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
    borderColor: colors.softBorder,
    backgroundColor: "#fff",
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F4F4F4",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { ...text.body, fontWeight: "700" },
  amount: { ...text.body, fontWeight: "900", marginTop: 2 },
  date: { ...text.small, color: colors.muted },
});
