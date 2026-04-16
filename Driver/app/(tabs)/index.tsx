// Driver/app/(tabs)/index.tsx

import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Headphones,
  Bell,
  MapPin,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  X,
  Check,
  Car,
  CarFront,
} from "lucide-react-native";
import { DriverService } from "@/api/driver.service";
import { useAuth } from "@/context/AuthContext";
import { useFocusEffect } from "expo-router";
import { AppHeader } from "@/src/ui/AppHeader";
import { router } from "expo-router";
import { Text } from "../../components/AppText";
import { HomeSkeleton } from "@/src/ui/skeletons/HomeSkeleton";
import { colors, spacing } from "@/src/ui/theme";
import { useBookingSocket } from "@/hooks/useBookingSocket";
import EmptyState from "@/src/ui/EmptyState";
import { useAppTheme } from "@/src/ui/useAppTheme";
import {
  ProfileCompletionCard,
  isProfileComplete,
} from "@/src/ui/ProfileCompletionCard";

export default function HomeTabScreen() {
  const [isOnline, setIsOnline] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState<string>("OFFLINE");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    hours: "0h",
    rating: 5.0,
    acceptance: 0,
  });
  const [isOnTrip, setIsOnTrip] = useState(false);
  const { user, isLoading, updateUser, signOut } = useAuth();
  const { isDark, colors: themeColors } = useAppTheme();
  const profileComplete = isProfileComplete(user);

  useBookingSocket({
    onNewRideRequest: (data) => {
      // New booking available — add to requests if not already there
      const incoming = data.booking ?? data;
      setRequests((prev) => {
        if (prev.find((r) => r.id === incoming.id)) return prev;
        return [incoming, ...prev];
      });
    },
    onRideRemoved: (bookingId) => {
      // Another driver accepted — remove from this driver's list
      setRequests((prev) => prev.filter((r) => r.id !== bookingId));
    },
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const profile = await DriverService.getProfile();
      setIsOnline(profile.isOnline);
      const pendingReqs = await DriverService.getRideRequests();
      setRequests(pendingReqs);
      const trips = await DriverService.getTripHistory();
      setHistory(trips.slice(0, 3)); // Show only recent 3
      const totalMinutes = trips
        .filter(
          (t: any) =>
            t.status === "COMPLETED" && t.acceptedByDriverAt && t.updatedAt,
        )
        .reduce((acc: number, t: any) => {
          const start = new Date(t.acceptedByDriverAt).getTime();
          const end = new Date(t.updatedAt).getTime();
          return acc + Math.max(0, (end - start) / 60000); // ms to minutes
        }, 0);

      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.floor(totalMinutes % 60);

      setStats({
        totalTrips: profile.totalTrips ?? 0,
        hours: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
        rating: profile.rating ?? 5.0,
        acceptance: profile.acceptanceRate ?? 0,
      });

      setOnlineStatus(profile.onlineStatus ?? "OFFLINE");
      setIsOnTrip(profile.onlineStatus === "AWAY");
    } catch (err: any) {
      if (err?.response?.status === 401) {
        Alert.alert("Session Expired", "Please log in again.");
        signOut();
        router.push("/(auth)/sign-in");
        return;
      }
      console.log("Error fetching home data:", err?.message);
    } finally {
      setLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const toggleStatus = async (value: boolean) => {
    if (value && !profileComplete) {
      Alert.alert(
        "Profile Incomplete",
        "Please complete your profile setup before going online.",
      );
      return;
    }
    const newStatus = value ? "ONLINE" : "OFFLINE";
    try {
      await DriverService.setOnlineStatus(newStatus);
      setIsOnline(value);
      await updateUser({
        driverProfile: { ...user?.driverProfile, onlineStatus: newStatus },
      });
    } catch (err) {
      Alert.alert("Error", "Could not update status");
    }
  };

  const respondToRide = async (id: string, action: "ACCEPTED" | "DECLINED") => {
    if (action === "DECLINED") {
      // Just hide locally — no API call needed, other drivers still see it
      setRequests((prev) => prev.filter((r) => r.id !== id));
      return;
    }
    setActionLoading(true);
    try {
      await DriverService.respondToRequest(id, action);
      router.push("/(tabs)/active-trip");
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (!user || isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={[{ flex: 1 }, { backgroundColor: themeColors.navy }]}
    >
      <View style={styles.root}>
        <View style={styles.top}>
          <AppHeader
            title={
              <View>
                <Text
                  style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}
                >
                  Hello, {user?.name}
                </Text>
              </View>
            }
            rightIcons
            leftAvatar
          />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { backgroundColor: themeColors.background },
          ]}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchData} />
          }
        >
          {/* Availability Toggle Box */}
          <View
            style={[
              styles.statusBox,
              isOnline ? styles.onlineBox : styles.offlineBox,
            ]}
          >
            <View style={styles.statusHeaderRow}>
              <View style={styles.statusLabelRow}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: isOnline ? "#10B981" : "#EF4444" },
                  ]}
                />
                <Text style={styles.statusTitle}>
                  Availability Status ({isOnline ? "Online" : "Offline"})
                </Text>
              </View>

              <Switch
                value={isOnline}
                onValueChange={toggleStatus}
                trackColor={{ false: "#D1D5DB", true: "#FFF" }}
                thumbColor={isOnline ? "#0B1B2B" : "#FFF"}
                disabled={!profileComplete && !isOnline}
              />
            </View>
            <Text style={styles.statusSubtitle}>
              {isOnline && onlineStatus === "AWAY"
                ? "On a Trip (Away)"
                : isOnline
                  ? "Waiting for Ride Assignment"
                  : "Waiting for Rides"}
            </Text>
            <Text style={styles.statusDesc}>
              {isOnline
                ? "You're online and ready to accept ride"
                : "Stay online to receive ride requests"}
            </Text>
          </View>

{!profileComplete && (
  <ProfileCompletionCard user={user} isDark={isDark} />
)}

          {(!isOnline && profileComplete) && (
            <View
              style={{
                backgroundColor: "#FFF",
                borderRadius: 12,
                padding: 30,
                alignItems: "center",
                marginBottom: 25,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#ECFDF5",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 15,
                }}
              >
                <Clock color="#10B981" size={24} />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#111827",
                  marginBottom: 5,
                }}
              >
                Waiting for Rides
              </Text>
              <Text
                style={{ fontSize: 13, color: "#6B7280", textAlign: "center" }}
              >
                Stay online to receive ride requests
              </Text>
            </View>
          )}
          {/* Pending Requests */}
          {requests.length > 0 && isOnline && (
            <View style={styles.section}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 15,
                }}
              >
                <Text style={styles.sectionTitle}>Ride Request</Text>
                <Text
                  style={{ color: "#3B82F6", fontSize: 13, fontWeight: "600" }}
                >
                  {requests.length} available
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingRight: 4 }}
                decelerationRate="fast"
                snapToInterval={300} // card width + gap
                snapToAlignment="start"
              >
                {requests.map((req) => {
                  const scheduledDate = req.scheduledAt
                    ? new Date(req.scheduledAt).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";
                  const scheduledTime = req.scheduledAt
                    ? new Date(req.scheduledAt).toLocaleTimeString("en-NG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—";
                  const isBusinessType = req.customer?.role === "BUSINESS";

                  return (
                    <View key={req.id} style={styles.rideCard}>
                      {/* Orange header */}
                      <View style={styles.rideCardHeader}>
                        <View style={styles.rideCardHeaderLeft}>
                          <Bell
                            size={14}
                            color="#FFF"
                            style={{ marginRight: 6 }}
                          />
                          <Text style={styles.rideCardHeaderText}>
                            New Ride Request
                          </Text>
                        </View>
                      </View>

                      <View style={styles.rideCardBody}>
                        {/* Meta row: Ride ID | Ride Type */}
                        <View style={styles.rideMetaRow}>
                          <View style={styles.rideMetaCol}>
                            <Text style={styles.rideMetaLabel}>Ride ID</Text>
                            <Text style={styles.rideMetaValue}>
                              Log-{req.id?.slice(0, 5)}
                            </Text>
                          </View>
                          <View style={styles.rideMetaCol}>
                            <Text style={styles.rideMetaLabel}>Ride Type</Text>
                            <View
                              style={[
                                styles.rideTypeBadge,
                                {
                                  backgroundColor: isBusinessType
                                    ? "#DBEAFE"
                                    : "#FEF3C7",
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.rideTypeBadgeText,
                                  {
                                    color: isBusinessType
                                      ? "#1D4ED8"
                                      : "#92400E",
                                  },
                                ]}
                              >
                                {isBusinessType ? "Business" : "Individual"}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Pickup */}
                        <View style={styles.rideLocRow}>
                          <View
                            style={[
                              styles.rideLocDot,
                              { backgroundColor: "#10B981" },
                            ]}
                          >
                            <MapPin size={12} color="#FFF" />
                          </View>
                          <View>
                            <Text style={styles.rideLocLabel}>
                              PICKUP LOCATION
                            </Text>
                            <Text style={styles.rideLocValue}>
                              {req.pickupAddress}
                            </Text>
                          </View>
                        </View>

                        {/* Dropoff */}
                        <View style={styles.rideLocRow}>
                          <View
                            style={[
                              styles.rideLocDot,
                              { backgroundColor: "#EF4444" },
                            ]}
                          >
                            <MapPin size={12} color="#FFF" />
                          </View>
                          <View>
                            <Text style={styles.rideLocLabel}>
                              DROP-OFF LOCATION
                            </Text>
                            <Text style={styles.rideLocValue}>
                              {req.dropoffAddress}
                            </Text>
                          </View>
                        </View>

                         <View style={styles.rideMetaCol}>
                            <Text style={styles.rideMetaLabel}>Add Ons</Text>
                            <Text style={styles.rideMetaValue}>
                             {req.addOns?.join(", ")}
                            </Text>
                          </View>

                        {/* Scheduled date + duration */}
                        <View style={styles.rideFooterRow}>
                          <View style={styles.rideFooterCol}>
                            <Text style={styles.rideMetaLabel}>
                              SCHEDULED DATE
                            </Text>
                            <Text style={styles.rideFooterVal}>
                              {scheduledDate}
                            </Text>
                            <Text style={styles.rideFooterSub}>
                              {scheduledTime}
                            </Text>
                          </View>
                          <View style={styles.rideFooterCol}>
                            <Text style={styles.rideMetaLabel}>
                              ESTIMATED DURATION
                            </Text>
                            <Text style={styles.rideFooterVal}>
                              {req.packageType ?? "—"}
                            </Text>
                            <Text style={styles.rideFooterSub}>Round Trip</Text>
                          </View>
                        </View>

                        {/* Actions */}
                        <View style={styles.rideActionRow}>
                          <TouchableOpacity
                            style={styles.rideBtnReject}
                            onPress={() => {
                              DriverService.ignoreRide(req.id);
                              setRequests((prev) =>
                                prev.filter((r) => r.id !== req.id),
                              );
                            }}
                            disabled={actionLoading}
                          >
                            <X
                              size={15}
                              color="#EF4444"
                              style={{ marginRight: 6 }}
                            />
                            <Text style={styles.rideBtnRejectText}>
                              Reject Ride
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.rideBtnAccept,
                              actionLoading && { opacity: 0.6 },
                            ]}
                            onPress={() => {
                              if (isOnTrip) {
                                Alert.alert(
                                  "Active Trip",
                                  "Please complete your current trip before accepting a new one.",
                                );
                                return;
                              }
                              respondToRide(req.id, "ACCEPTED");
                            }}
                            disabled={actionLoading}
                          >
                            {actionLoading ? (
                              <ActivityIndicator size="small" color="#3E2723" />
                            ) : (
                              <>
                                <Check
                                  size={15}
                                  color="#3E2723"
                                  style={{ marginRight: 6 }}
                                />
                                <Text style={styles.rideBtnAcceptText}>
                                  Accept Ride
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}
          {/* Dashboard Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Calendar size={20} color="#3B82F6" />
                <Text style={styles.statValue}>{stats.totalTrips}</Text>
                <Text style={styles.statLabel}>Trip this week</Text>
              </View>
              <View style={styles.statCard}>
                <Clock size={20} color="#3B82F6" />
                <Text style={styles.statValue}>{stats.hours}</Text>
                <Text style={styles.statLabel}>Total Hours</Text>
              </View>
              <View style={styles.statCard}>
                <Star size={20} color="#3B82F6" />
                <Text style={styles.statValue}>{stats.rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statCard}>
                <TrendingUp size={20} color="#3B82F6" />
                <Text style={styles.statValue}>{stats.acceptance}%</Text>
                <Text style={styles.statLabel}>Acceptance Rate</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <Text style={styles.sectionTitle}>Recent Trip History</Text>

              {/* Navigate to the History Tab natively! */}
              <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
                <Text
                  style={{ color: "#3B82F6", fontSize: 13, fontWeight: "600" }}
                >
                  View more
                </Text>
              </TouchableOpacity>
            </View>
            {history.length === 0 ? (
              <EmptyState
                Icon={CarFront}
                title="No Trip History"
                subtitle="Your completed trips will appear here once you've scheduled and finished a trip."
              />
            ) : (
              history.map((trip) => {
                const isCompleted = trip.status === "COMPLETED";
                const isCancelled = trip.status === "CANCELLED";
                const statusColor = isCompleted
                  ? "#10B981"
                  : isCancelled
                    ? "#EF4444"
                    : "#F59E0B";
                const statusLabel = isCompleted
                  ? "Completed"
                  : isCancelled
                    ? "Cancelled"
                    : "In Progress";
                const tripDate = trip.scheduledAt
                  ? new Date(trip.scheduledAt).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—";
                const tripTime = trip.scheduledAt
                  ? new Date(trip.scheduledAt).toLocaleTimeString("en-NG", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—";

                return (
                  <View key={trip.id} style={styles.historyCard}>
                    {/* Header: ID + date + status */}
                    <View style={styles.historyHeader}>
                      <View style={styles.historyIdRow}>
                        {isCompleted ? (
                          <Check
                            size={13}
                            color="#10B981"
                            style={{ marginRight: 4 }}
                          />
                        ) : (
                          <X
                            size={13}
                            color="#EF4444"
                            style={{ marginRight: 4 }}
                          />
                        )}
                        <Text style={styles.historyId}>
                          Trip #{trip.trackingId}
                        </Text>
                        <Text style={styles.historyMeta}>
                          , {tripDate}, {tripTime}
                        </Text>
                      </View>
                      <Text
                        style={[styles.statusBadge, { color: statusColor }]}
                      >
                        {statusLabel}
                      </Text>
                    </View>

                    {/* Pickup */}
                    <View style={styles.historyLocRow}>
                      <View
                        style={[styles.locDot, { backgroundColor: "#10B981" }]}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.locLabel}>PICKUP LOCATION</Text>
                        <Text style={styles.locValue}>
                          {trip.pickupAddress}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.locLabel}>HOURS</Text>
                        <Text style={styles.locMeta}>
                          {trip.packageType?.replace(" Hours", "") ?? "—"}
                        </Text>
                      </View>
                    </View>

                    {/* Dropoff */}
                    <View style={styles.historyLocRow}>
                      <View
                        style={[styles.locDot, { backgroundColor: "#EF4444" }]}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.locLabel}>DROP-OFF LOCATION</Text>
                        <Text style={styles.locValue}>
                          {trip.dropoffAddress}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.locLabel}>TYPE</Text>
                        <Text style={styles.locMeta}>
                          {trip.customer?.role === "BUSINESS"
                            ? "Business"
                            : "Individual"}
                        </Text>
                      </View>
                    </View>

                    {/* Bottom meta */}
                    <View style={styles.historyFooter}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.locLabel}>SCHEDULED DATE</Text>
                        <Text style={styles.footerVal}>{tripDate}</Text>
                        <Text style={styles.footerSub}>{tripTime}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.locLabel}>ESTIMATED DURATION</Text>
                        <Text style={styles.footerVal}>
                          {trip.packageType ?? "—"}
                        </Text>
                        <Text style={styles.footerSub}>Round Trip</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  origin: { backgroundColor: colors.navy },
  root: { backgroundColor: colors.background, height: "100%" },
  top: { backgroundColor: colors.navy, paddingBottom: spacing.md },
  // content: { padding: spacing.lg, paddingBottom: 40 },

  content: {
    backgroundColor: "#FFF",
    flexGrow: 1,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  statusBox: { borderRadius: 12, padding: 20, marginBottom: 25 },
  onlineBox: { backgroundColor: "#1D4ED8" }, // Blue
  offlineBox: { backgroundColor: "#1E3A8A" }, // Darker
  statusHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  statusLabelRow: { flexDirection: "row", alignItems: "center" },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  statusTitle: { color: "#FFF", fontWeight: "600", fontSize: 16 },
  statusSubtitle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 5,
  },
  statusDesc: { color: "#E5E7EB", fontSize: 12 },
  section: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 15,
  },

  requestCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 15,
  },
  reqHeader: {
    backgroundColor: "#F97316",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reqHeaderText: { color: "#FFF", fontWeight: "700", fontSize: 14, flex: 1 },
  timerBadge: {
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timerText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  reqBody: { padding: 15 },
  rideId: { fontSize: 12, color: "#6B7280", marginBottom: 15 },
  locationRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  locationText: { marginLeft: 10, fontSize: 14, color: "#374151", flex: 1 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 20 },
  btnReject: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    py: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 12,
  },
  rejectText: { color: "#EF4444", fontWeight: "600" },
  btnAccept: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    py: 12,
    borderRadius: 8,
    backgroundColor: "#E4C77B",
    paddingVertical: 12,
  },
  acceptText: { color: "#3E2723", fontWeight: "600" },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: { fontSize: 12, color: "#6B7280" },
  // History card
  historyCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  historyIdRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  historyId: { fontSize: 12, fontWeight: "700", color: "#111827" },
  historyMeta: { fontSize: 11, color: "#6B7280" },
  statusBadge: { fontSize: 12, fontWeight: "700" },
  historyLocRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  locDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 10,
    marginTop: 4,
  },
  locLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  locValue: { fontSize: 13, fontWeight: "600", color: "#111827" },
  locMeta: { fontSize: 13, fontWeight: "700", color: "#111827" },
  historyFooter: {
    flexDirection: "row",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginTop: 4,
  },
  footerVal: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  footerSub: { fontSize: 11, color: "#6B7280" },

  // Empty state (replaces the inline styles)
  rideCard: {
    width: 300,
    backgroundColor: "#FFF",
    marginBottom: 10,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  rideCardHeader: {
    backgroundColor: "#F97316",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  rideCardHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",

  },
  rideCardHeaderText: { color: "#FFF", fontWeight: "700", fontSize: 13 },
  rideCardHeaderSub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 10,
    marginTop: 2,
  },
  rideTimerBadge: {
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 8,
  },
  rideTimerText: { color: "#FFF", fontSize: 12, fontWeight: "800" },

  rideCardBody: { padding: 14 },

  rideMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    marginBottom: 12,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  // rideMetaCol: { flex: 1 },
  rideMetaLabel: {
    fontSize: 9,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  rideMetaValue: { fontSize: 12, fontWeight: "700", color: "#111827" },
  rideTypeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  rideTypeBadgeText: { fontSize: 10, fontWeight: "700" },

  rideLocRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  rideLocDot: {
    width: 17,
    height: 17,
    padding: 2,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginTop: 4,
  },
  rideLocLabel: {
    fontSize: 9,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  rideLocValue: { fontSize: 13, fontWeight: "600", color: "#111827" },

  rideFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    borderRadius: 3,
    marginBottom: 14,
    backgroundColor: "#F6F6F6",
  },
  // rideFooterCol: { flex: 1 },
  rideFooterVal: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  rideFooterSub: { fontSize: 10, color: "#6B7280" },

  rideActionRow: { flexDirection: "row", gap: 10 },
  rideBtnReject: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  rideBtnRejectText: { color: "#EF4444", fontWeight: "600", fontSize: 13 },
  rideBtnAccept: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: "#E4C77B",
  },
  rideBtnAcceptText: { color: "#3E2723", fontWeight: "700", fontSize: 13 },
});
