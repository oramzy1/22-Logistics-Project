import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useBookings } from "@/context/BookingContext";
import { useSchedule } from "@/context/ScheduleContext";
import { colors, radius, spacing } from "@/src/ui/theme";
import {
  Car,
  ChevronRight,
  Clock,
  Plus,
  TrendingUp,
} from "lucide-react-native";
import { getRideTimeLabel } from "../utils/rideTimer";
import { PackageId } from "../utils/timeSlots";
import { useAppTheme } from "./useAppTheme";

const packages = [
  { title: "3 Hours", price: "₦24,000" },
  { title: "6 Hours", price: "₦34,000" },
  { title: "10 Hours", price: "₦54,000" },
  { title: "Multi-day", price: "" },
  { title: "Airport", price: "Schedule" },
];

export function BusinessHome() {
  const [showDrawer, setShowDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const { setSelectedPackage } = useSchedule();
  const titleToId: Record<string, PackageId> = {
    "3 Hours": "3h",
    "6 Hours": "6h",
    "10 Hours": "10h",
    "Multi-day": "multi",
    Airport: "3h",
  };
  const { bookings, activeBookings, isLoading } = useBookings();
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);

  const now = new Date();
  const thisMonth = bookings.filter((b) => {
    const d = new Date(b.createdAt);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });

  const tripsThisMonth = thisMonth.filter((b) => b.paymentStatus === "PAID");

  const totalSpentThisMonth = thisMonth
    .filter((b) => b.paymentStatus === "PAID")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const activeBooking = activeBookings[0] ?? null;
  const historyBookings = bookings
    // .filter((b) => b.status === "COMPLETED")
    .slice(0, 5);

  const lastMonth = bookings.filter((b) => {
    const d = new Date(b.createdAt);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
    return (
      d.getMonth() === lastMonthDate.getMonth() &&
      d.getFullYear() === lastMonthDate.getFullYear()
    );
  });

  const tripGrowthPercent =
    lastMonth.length === 0
      ? null
      : (
          ((thisMonth.length - lastMonth.length) / lastMonth.length) *
          100
        ).toFixed(1);

  const renderActiveSchedule = () => {
    if (isLoading) return <ActivityIndicator style={{ marginTop: 20 }} />;
    if (!activeBooking)
      return (
        <View style={{ alignItems: "center", padding: 32 }}>
          <Text style={{ color: themeColors.textSecondary, fontSize: 14 }}>
            No active bookings
          </Text>
        </View>
      );

    const scheduled = new Date(activeBooking.scheduledAt);
    return (
      <View style={styles.scheduleCard}>
        <View style={styles.scheduleHeaderRow}>
          <View style={styles.scheduleHeaderLeft}>
            <Car size={20} color={themeColors.text} />
            <Text style={styles.remainingText}>
              {getRideTimeLabel(
                activeBooking.packageType,
                activeBooking.scheduledAt,
              )}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>
              {activeBooking.status.replace("_", " ")}
            </Text>
          </View>
        </View>

        <View style={styles.routeContainer}>
          <View style={styles.routePoint}>
            <View style={styles.greenDot}>
              <Text style={styles.dotText}>A</Text>
            </View>
            <View style={styles.routeContent}>
              <Text style={styles.routeLabel}>PICKUP LOCATION</Text>
              <Text style={styles.routeValue}>
                {activeBooking.pickupAddress}
              </Text>
            </View>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <View style={styles.redDot}>
              <Text style={styles.dotText}>B</Text>
            </View>
            <View style={styles.routeContent}>
              <Text style={styles.routeLabel}>Drop-off LOCATION</Text>
              <Text style={styles.routeValue}>
                {activeBooking.dropoffAddress}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>SCHEDULED DATE</Text>
            <Text style={styles.infoValue}>
              {scheduled.toLocaleDateString("en-NG", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
            <Text style={styles.infoSubValue}>
              {scheduled.toLocaleTimeString("en-NG", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>ESTIMATED DURATION</Text>
            <Text style={styles.infoValue}>{activeBooking.packageType}</Text>
            <Text style={styles.infoSubValue}>Round Trip</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/live")}
          style={styles.viewDetailsBtn}
        >
          <Text style={styles.viewDetailsText}>View details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderScheduleHistory = () => {
    if (isLoading) return <ActivityIndicator style={{ marginTop: 20 }} />;
    if (historyBookings.length === 0)
      return (
        <View style={{ alignItems: "center", padding: 32 }}>
          <Text style={{ color: "#6B7280", fontSize: 14 }}>
            No ride history yet
          </Text>
        </View>
      );

    return (
      <View style={styles.historyContainer}>
        {historyBookings.map((b) => (
          <View key={b.id} style={{ marginBottom: 20 }}>
            <Text style={styles.historyDate}>
              {new Date(b.createdAt).toLocaleDateString("en-NG", {
                month: "short",
                day: "numeric",
              })}
              ,{" "}
              {new Date(b.createdAt).toLocaleTimeString("en-NG", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            <View style={styles.historyRow}>
              <Text style={styles.historyRowLabel}>Ride type</Text>
              <Text style={styles.historyRowValueBlue}>{b.packageType}</Text>
            </View>
            <View style={styles.historyRow}>
              <Text style={styles.historyRowLabel}>Pick up location</Text>
              <Text style={styles.historyRowValueBlue}>{b.pickupAddress}</Text>
            </View>
            <View style={styles.historyRow}>
              <Text style={styles.historyRowLabel}>Booking ID</Text>
              <Text style={styles.historyRowValueBold}>
                #{b.paymentRef.slice(-12).toUpperCase()}
              </Text>
            </View>
            <View style={styles.historyRow}>
              <Text style={styles.historyRowLabel}>Amount</Text>
              <Text style={styles.historyRowValueBold}>
                ₦{b.totalAmount.toLocaleString()}
              </Text>
            </View>
            <View style={styles.historyRow}>
              <Text style={styles.historyRowLabel}>Payment status</Text>
              <Text
                style={
                  b.paymentStatus === "PAID"
                    ? styles.historyRowValueSuccess
                    : { color: "#EF4444", fontSize: 13, fontWeight: "600" }
                }
              >
                {b.paymentStatus === "PAID" ? "Successful" : "Unpaid"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewReceiptBtn}
              onPress={() =>
                router.push({
                  pathname: "/screens/payment-details",
                  params: { id: b.id },
                })
              }
            >
              <Text style={styles.viewReceiptText}>View Receipt</Text>
              <ChevronRight size={16} color="#78350F" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.h1}>Your Ride, On Schedule</Text>

        <Text style={styles.sectionTitle}>Special Offers</Text>
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=60",
          }}
          style={styles.offer}
          imageStyle={{ borderRadius: radius.xl }}
        >
          <View style={styles.offerOverlay} />
          <Text style={styles.offerDiscount}>20% OFF</Text>
          <Text style={styles.offerTitle}>Rent Smart, Save More</Text>
          <Text style={styles.offerSubtitle}>
            Save big on rentals with limited{"\n"}time promotions.
          </Text>
          <Pressable style={styles.offerBtn}>
            <Text style={{ fontWeight: "700" }}>Claim Offer</Text>
          </Pressable>
        </ImageBackground>

        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotInactive]} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotInactive]} />
        </View>

        <Text style={styles.sectionTitle}>Ride Activity</Text>
        <View style={styles.activityRow}>
          <View style={styles.activityCard}>
            <View style={styles.activityCardHeader}>
              <Text style={styles.activityLabel}>Total Trip This Month</Text>
              <View style={styles.activityIconCircle}>
                <Car size={16} color="#111827" />
              </View>
            </View>
            <Text style={styles.activityValue}>
              {tripsThisMonth.length} Trips
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TrendingUp
                size={12}
                color="#10B981"
                style={{ marginRight: 4 }}
              />
              {tripGrowthPercent !== null ? (
                <Text
                  style={[
                    styles.activityIncrease,
                    Number(tripGrowthPercent) < 0 && { color: "#EF4444" },
                  ]}
                >
                  {Number(tripGrowthPercent) >= 0 ? "+" : ""}
                  {tripGrowthPercent}%
                </Text>
              ) : (
                <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                  No data yet
                </Text>
              )}
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityCardHeader}>
              <Text style={styles.activityLabel}>Total Amount Spent</Text>
              <View style={styles.activityIconCircle}>
                <Car size={16} color="#111827" />
              </View>
            </View>
            <Text style={styles.activityValue}>
              ₦{totalSpentThisMonth.toLocaleString()}
            </Text>
            <Text style={styles.activityDesc}>Across trips</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.scheduleBtn}
          onPress={() => setShowDrawer(true)}
        >
          <Plus size={20} color="#3E2723" style={{ marginRight: 8 }} />
          <Text style={styles.scheduleBtnText}>Schedule Ride</Text>
        </TouchableOpacity>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "active" && styles.activeTabBtn,
            ]}
            onPress={() => setActiveTab("active")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "active" && styles.activeTabText,
              ]}
            >
              Active Schedule
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "history" && styles.activeTabBtn,
            ]}
            onPress={() => setActiveTab("history")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "history" && styles.activeTabText,
              ]}
            >
              Schedule History
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "active" && renderActiveSchedule()}
        {activeTab === "history" && renderScheduleHistory()}
      </ScrollView>

      {/* Slide-Up Drawer for Scheduling Grid */}
      <Modal visible={showDrawer} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setShowDrawer(false)}
          />
          <View style={styles.drawerContent}>
            <View style={styles.drawerHandle} />
            <Text style={styles.drawerTitle}>Schedule Your Ride</Text>
            <View style={styles.grid}>
              {packages.map((p) => (
                <Pressable
                  key={p.title}
                  style={styles.pkg}
                  onPress={() => {
                    setSelectedPackage(titleToId[p.title] ?? "3h");
                    setShowDrawer(false);
                    router.push("/(tabs)/schedule");
                  }}
                  android_ripple={{ color: "#0000000C" }}
                >
                  <Clock color={"#3B82F6"} size={12} />
                  <Text
                    style={{
                      fontWeight: "800",
                      fontSize: 18,
                      marginTop: 6,
                      margin: "auto",
                    }}
                  >
                    {p.title}
                  </Text>
                  {!!p.price && (
                    <Text
                      style={{
                        fontWeight: "900",
                        fontSize: 18,
                        marginTop: 6,
                        margin: "auto",
                      }}
                    >
                      {p.price}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (themeColors: any) =>
  StyleSheet.create({
    content: { padding: spacing.lg, paddingBottom: 40 },
    h1: {
      fontSize: 20,
      fontWeight: "600",
      color: themeColors.text,
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontWeight: "600",
      color: themeColors.text,
      fontSize: 16,
      marginTop: spacing.md,
      marginBottom: 16,
    },
    offer: {
      height: 180,
      borderRadius: radius.xl,
      padding: spacing.lg,
      overflow: "hidden",
    },
    offerOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.35)",
    },
    offerDiscount: { color: "#fff", fontWeight: "900", fontSize: 18 },
    offerTitle: {
      color: "#fff",
      fontWeight: "900",
      fontSize: 18,
      marginTop: 10,
    },
    offerSubtitle: { color: "#E5E7EB", marginTop: 6, lineHeight: 18 },
    offerBtn: {
      marginTop: 14,
      alignSelf: "flex-start",
      backgroundColor: "#fff",
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    dots: {
      marginTop: 10,
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
      marginBottom: spacing.lg,
    },
    dot: { width: 18, height: 4, borderRadius: 3, backgroundColor: "#F59E0B" },
    dotInactive: { width: 6, backgroundColor: "#D1D5DB" },

    activityRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
      gap: 12,
    },
    activityCard: {
      flex: 1,
      backgroundColor: themeColors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: themeColors.softBorder,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
    activityCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    activityLabel: {
      fontSize: 11,
      color: themeColors.textSecondary,
      flex: 1,
      paddingRight: 8,
    },
    activityIconCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: themeColors.cardPrimary,
      alignItems: "center",
      justifyContent: "center",
    },
    activityValue: {
      fontSize: 18,
      fontWeight: "800",
      color: themeColors.text,
      marginBottom: 4,
    },
    activityIncrease: { fontSize: 12, color: "#10B981", fontWeight: "600" },
    activityDesc: { fontSize: 12, color: themeColors.textSecondary },

    scheduleBtn: {
      flexDirection: "row",
      backgroundColor: "#E4C77B",
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    scheduleBtnText: { color: "#3E2723", fontWeight: "bold", fontSize: 16 },

    tabsContainer: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#E5E7EB",
      marginBottom: 20,
    },
    tabBtn: { flex: 1, paddingVertical: 12, alignItems: "center" },
    activeTabBtn: { borderBottomWidth: 2, borderBottomColor: "#D97706" },
    tabText: { fontSize: 14, color: "#6B7280", fontWeight: "600" },
    activeTabText: { color: themeColors.text, fontWeight: "700" },

    scheduleCard: {
      backgroundColor: themeColors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: themeColors.softBorder,
      padding: 16,
      marginTop: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    scheduleHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    scheduleHeaderLeft: { flexDirection: "row", alignItems: "center" },
    remainingText: {
      fontSize: 16,
      fontWeight: "700",
      color: themeColors.text,
      marginLeft: 10,
    },
    statusBadge: {
      backgroundColor: "#DBEAFE",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    statusBadgeText: { color: "#2563EB", fontSize: 12, fontWeight: "600" },

    routeContainer: { paddingLeft: 8, marginBottom: 20 },
    routePoint: { flexDirection: "row", alignItems: "flex-start" },
    greenDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: "#10B981",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
      zIndex: 2,
    },
    redDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: "#EF4444",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
      zIndex: 2,
    },
    dotText: { color: "#FFF", fontSize: 9, fontWeight: "bold" },
    routeLine: {
      width: 2,
      height: 26,
      backgroundColor: "#E5E7EB",
      marginLeft: 7,
      marginVertical: 2,
    },
    routeContent: { marginLeft: 12, flex: 1 },
    routeLabel: {
      fontSize: 10,
      color: "#6B7280",
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    routeValue: { fontSize: 14, color: "#111827", fontWeight: "500" },

    infoBox: {
      flexDirection: "row",
      backgroundColor: themeColors.cardPrimary,
      borderRadius: 8,
      padding: 16,
      marginBottom: 20,
    },
    infoCol: { flex: 1 },
    infoLabel: {
      fontSize: 10,
      color: themeColors.textSecondary,
      textTransform: "uppercase",
      marginBottom: 6,
    },
    infoValue: {
      fontSize: 13,
      color: themeColors.text,
      fontWeight: "700",
      marginBottom: 4,
    },
    infoSubValue: { fontSize: 12, color: themeColors.textSecondary },

    viewDetailsBtn: {
      paddingVertical: 14,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: themeColors.siftBorder,
      alignItems: "center",
    },
    viewDetailsText: { color: "#3B82F6", fontWeight: "600", fontSize: 14 },

    historyContainer: { paddingTop: 10 },
    historyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    historyTitle: { fontSize: 14, fontWeight: "700", color: themeColors.text },
    viewMoreText: { fontSize: 13, color: themeColors.textSecondary },
    historyDate: {
      fontSize: 13,
      color: themeColors.text,
      fontWeight: "600",
      marginBottom: 16,
    },
    historyRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    historyRowLabel: { fontSize: 13, color: "#4B5563" },
    historyRowValueBlue: { fontSize: 13, color: "#1D4ED8", fontWeight: "600" },
    historyRowValueBold: {
      fontSize: 13,
      color: themeColors.text,
      fontWeight: "700",
    },
    historyRowValueSuccess: {
      fontSize: 13,
      color: "#10B981",
      fontWeight: "600",
    },
    viewReceiptBtn: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 14,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: themeColors.softBorder,
      marginTop: 10,
    },
    viewReceiptText: {
      color: "#78350F",
      fontWeight: "600",
      fontSize: 14,
      marginRight: 6,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    drawerContent: {
      backgroundColor: themeColors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: 40,
    },
    drawerHandle: {
      width: 40,
      height: 4,
      backgroundColor: "#D1D5DB",
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 20,
    },
    drawerTitle: {
      fontWeight: "500",
      color: themeColors.text,
      fontSize: 18,
      marginBottom: spacing.lg,
      textAlign: "center",
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
      justifyContent: "center",
    },
    pkg: {
      width: "47%",
      minHeight: 120,
      borderRadius: radius.xl,
      backgroundColor: themeColors.background,
      borderWidth: 1,
      borderColor: colors.softBorder,
      padding: spacing.lg,
      justifyContent: "center",
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
  });
