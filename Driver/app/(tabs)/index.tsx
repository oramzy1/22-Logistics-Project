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
} from "lucide-react-native";
import { DriverService } from "@/api/driver.service";
import { useAuth } from "@/context/AuthContext";
import { useFocusEffect } from "expo-router";
import { AppHeader } from "@/src/ui/AppHeader";
import { router } from "expo-router";
import { Text } from "../../components/AppText";
import { HomeSkeleton } from "@/src/ui/skeletons/HomeSkeleton";
import { colors, radius, spacing, text } from "@/src/ui/theme";

const packages = [
  { title: "3 Hours", price: "₦24,000" },
  { title: "6 Hours", price: "₦34,000" },
  { title: "10 Hours", price: "₦54,000" },
  { title: "Multi-day", price: "Schedule" },
  { title: "Airport", price: "Schedule" },
];

export default function HomeTabScreen() {
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    hours: "0h",
    rating: 5.0,
    acceptance: 0,
  });
  const { user, isLoading, updateUser,  } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const profile = await DriverService.getProfile();
      setIsOnline(profile.isOnline);
      setStats({
        totalTrips: profile.totalTrips || 0,
        hours: "0h", // Populate dynamically if stored
        rating: profile.rating || 5.0,
        acceptance: 100, // Populate dynamically
      });
      const pendingReqs = await DriverService.getRideRequests();
      setRequests(pendingReqs);
      const trips = await DriverService.getTripHistory();
      setHistory(trips.slice(0, 3)); // Show only recent 3
    } catch (err: any) {
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
    try {
      await DriverService.respondToRequest(id, action);
      if (action === "ACCEPTED") {
        router.push("/(tabs)/active-trip");
      } else {
        fetchData();
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Action failed");
    }
  };

  if (!user || isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <SafeAreaView edges={["top"]} style={[{ flex: 1 }, styles.origin]}>
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
          contentContainerStyle={styles.content}
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
              />
            </View>
            <Text style={styles.statusSubtitle}>
              {isOnline ? "Waiting for Ride Assignment" : "Waiting for Rides"}
            </Text>
            <Text style={styles.statusDesc}>
              {isOnline
                ? "You're online and ready to accept ride"
                : "Stay online to receive ride requests"}
            </Text>
          </View>
          {/* Pending Requests */}
          {requests.length > 0 && isOnline && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ride Request</Text>
              {requests.map((req) => (
                <View key={req.id} style={styles.requestCard}>
                  <View style={styles.reqHeader}>
                    <Bell color="#FFF" size={16} style={{ marginRight: 8 }} />
                    <Text style={styles.reqHeaderText}>New Ride Request</Text>
                    <View style={styles.timerBadge}>
                      <Text style={styles.timerText}>00:30</Text>
                    </View>
                  </View>
                  <View style={styles.reqBody}>
                    <Text style={styles.rideId}>
                      Ride ID: {req.booking.id.slice(0, 8)}
                    </Text>

                    <View style={styles.locationRow}>
                      <MapPin size={18} color="#10B981" />
                      <Text style={styles.locationText}>
                        {req.booking.pickupAddress}
                      </Text>
                    </View>
                    <View style={styles.locationRow}>
                      <MapPin size={18} color="#EF4444" />
                      <Text style={styles.locationText}>
                        {req.booking.dropoffAddress}
                      </Text>
                    </View>
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.btnReject}
                        onPress={() => respondToRide(req.id, "DECLINED")}
                      >
                        <X
                          size={18}
                          color="#EF4444"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.rejectText}>Reject Ride</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.btnAccept}
                        onPress={() => respondToRide(req.id, "ACCEPTED")}
                      >
                        <Check
                          size={18}
                          color="#3E2723"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.acceptText}>Accept Ride</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
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
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  origin: { backgroundColor: colors.navy },
  root: { backgroundColor: colors.background, height: "100%" },
  top: { backgroundColor: colors.navy, paddingBottom: spacing.md },
  content: { padding: spacing.lg, paddingBottom: 40 },

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
});
