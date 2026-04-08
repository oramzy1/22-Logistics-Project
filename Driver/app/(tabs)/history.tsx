import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, X, Check } from "lucide-react-native";
import { DriverService } from "@/api/driver.service";
import { useFocusEffect } from "expo-router";
import { format } from "date-fns";
import { Text } from "../../components/AppText";
import { AppHeader } from "@/src/ui/AppHeader";

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
        {filteredTrips.map((trip) => (
          <View key={trip.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.idRow}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor:
                        trip.status === "COMPLETED" ? "#DCFCE7" : "#FEE2E2",
                    },
                  ]}
                >
                  {trip.status === "COMPLETED" ? (
                    <Check size={14} color="#16A34A" />
                  ) : (
                    <X size={14} color="#EF4444" />
                  )}
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.tripId}>
                    Trip ID {trip.id.slice(0, 6)}
                  </Text>
                  <Text style={styles.tripDate}>
                    {new Date(trip.createdAt).toLocaleString("en-US", {
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
                      trip.status === "COMPLETED" ? "#D1FAE5" : "#FEE2E2",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        trip.status === "COMPLETED" ? "#059669" : "#DC2626",
                    },
                  ]}
                >
                  {trip.status === "COMPLETED" ? "Completed" : "Cancelled"}
                </Text>
              </View>
            </View>

            <View style={styles.timeline}>
              <View style={styles.locationRow}>
                <MapPin size={18} color="#10B981" />
                <Text style={styles.locationText}>{trip.pickupAddress}</Text>
              </View>
              <View style={styles.line} />
              <View style={styles.locationRow}>
                <MapPin size={18} color="#EF4444" />
                <Text style={styles.locationText}>{trip.dropoffAddress}</Text>
              </View>
            </View>
          </View>
        ))}
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
    marginBottom: 20,
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
});
