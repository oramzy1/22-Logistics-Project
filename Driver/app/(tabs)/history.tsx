import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, X, Check, CarFront } from "lucide-react-native";
import { DriverService } from "@/api/driver.service";
import { useFocusEffect } from "expo-router";
import { Text } from "../../components/AppText";
import { AppHeader } from "@/src/ui/AppHeader";
import EmptyState from "@/src/ui/EmptyState";

export default function TripHistoryScreen() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All"); // All, Completed, Cancelled

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await DriverService.getTripHistory();
      setTrips(data);
    } catch (error) {
      console.log("Error fetching history");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, []),
  );

  const filteredTrips = trips.filter((trip) => {
    if (filter === "Completed") return trip.status === "COMPLETED";
    if (filter === "Cancelled") return trip.status === "CANCELLED";
    return true;
  });

  const emptyStateConfig: Record<string, any>= {
    All: {
      title: "No Trip History",
      subtitle:
        "Your completed trips will appear here once you've scheduled and finished a trip.",
      Icon: CarFront,
    },
    Completed: {
      title: "No Completed Trips",
      subtitle: "You haven’t completed any trips yet.",
      Icon: Check,
    },
    Cancelled: {
      title: "No Cancelled Trips",
      subtitle: "You have no cancelled trips.",
      Icon: X,
    },
  };

  const { title, subtitle, Icon } = emptyStateConfig[filter];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <AppHeader title="Trip History" showBack rightIcons />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trip History</Text>
        <Text style={styles.headerSubtitle}>Your past trips and rides</Text>
      </View>

      {/* Pill Filters */}
      <View style={styles.filterRow}>
        {["All", "Completed", "Cancelled"].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterPill, filter === f && styles.filterPillActive]}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchHistory} />
        }
      >
        {filteredTrips.length === 0 ? (
          <EmptyState Icon={Icon} title={title} subtitle={subtitle} />
        ) : (
          filteredTrips.map((req) => {
            const isBusinessType = req.packageType === "BUSINESS";
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

            return (
              <View key={req.id} style={styles.rideCard}>
                <View style={styles.cardTop}>
                  <View style={styles.idRow}>
                    <View
                      style={[
                        styles.iconBox,
                        {
                          backgroundColor:
                            req.status === "COMPLETED" ? "#DCFCE7" : "#FEE2E2",
                        },
                      ]}
                    >
                      {req.status === "COMPLETED" ? (
                        <Check size={14} color="#16A34A" />
                      ) : (
                        <X size={14} color="#EF4444" />
                      )}
                    </View>
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.tripId}>
                        Trip ID {req.id.slice(0, 6)}
                      </Text>
                      <Text style={styles.tripDate}>
                        {new Date(req.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          req.status === "COMPLETED" ? "#D1FAE5" : "#FEE2E2",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            req.status === "COMPLETED" ? "#059669" : "#DC2626",
                        },
                      ]}
                    >
                      {req.status === "COMPLETED" ? "Completed" : "Cancelled"}
                    </Text>
                  </View>
                </View>

                <View style={styles.rideCardBody}>
                  {/* Meta row: Ride ID | Ride Type */}
                  <View style={styles.rideMetaRow}>
                    <View>
                      <Text style={styles.rideMetaLabel}>Ride ID</Text>
                      <Text style={styles.rideMetaValue}>
                        Log-{req.id?.slice(0, 5)}
                      </Text>
                    </View>
                    <View>
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
                            { color: isBusinessType ? "#1D4ED8" : "#92400E" },
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
                      <Text style={styles.rideLocLabel}>PICKUP LOCATION</Text>
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
                      <Text style={styles.rideLocLabel}>DROP-OFF LOCATION</Text>
                      <Text style={styles.rideLocValue}>
                        {req.dropoffAddress}
                      </Text>
                    </View>
                  </View>

                  {/* Scheduled date + duration */}
                  <View style={styles.rideFooterRow}>
                    <View>
                      <Text style={styles.rideMetaLabel}>SCHEDULED DATE</Text>
                      <Text style={styles.rideFooterVal}>{scheduledDate}</Text>
                      <Text style={styles.rideFooterSub}>{scheduledTime}</Text>
                    </View>
                    <View>
                      <Text style={styles.rideMetaLabel}>
                        ESTIMATED DURATION
                      </Text>
                      <Text style={styles.rideFooterVal}>
                        {req.packageType ?? "—"}
                      </Text>
                      <Text style={styles.rideFooterSub}>Round Trip</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: { padding: 20, paddingBottom: 30 },
  headerTitle: {
    fontSize: 21,
    fontWeight: "medium",
    marginBottom: 5,
  },
  headerSubtitle: { color: "#9CA3AF", fontSize: 12 },

  filterRow: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    margin: 20,
    borderRadius: 30,
    padding: 4,
    marginTop: -15,
    zIndex: 10,
  },
  filterPill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 25,
  },
  filterPillActive: {
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  filterText: { color: "#6B7280", fontWeight: "600", fontSize: 13 },
  filterTextActive: { color: "#111827" },

  content: { padding: 20 },
  card: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 14,
  },
  idRow: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  tripId: { fontSize: 12, color: "#6B7280" },
  tripDate: { fontSize: 14, fontWeight: "600", color: "#111827", marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "700" },

  timeline: { paddingLeft: 5 },
  locationRow: { flexDirection: "row", alignItems: "center" },
  locationText: {
    marginLeft: 15,
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  line: {
    width: 2,
    height: 20,
    backgroundColor: "#E5E7EB",
    marginLeft: 8,
    marginVertical: 4,
  },
  rideCard: {
    backgroundColor: "#FFF",
    marginBottom: 10,
    borderRadius: 14,
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
    alignItems: "flex-start",
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
