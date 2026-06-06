// Driver/app/(tabs)/active-trip.tsx

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Phone,
  MapPin,
  CarFront,
  MessageSquare,
  Plane,
} from "lucide-react-native";
import { DriverService } from "@/api/driver.service";
import { useFocusEffect } from "expo-router";
import { Text } from "../../components/AppText";
import { useBookingSocket } from "@/hooks/useBookingSocket";
import { useRouter } from "expo-router";
import EmptyState from "@/src/ui/EmptyState";
import { PrimaryButton } from "@/src/ui/PrimaryButton";
import { useAppTheme } from "@/src/ui/useAppTheme";
import { useAuth } from "@/context/AuthContext";
import { Chat } from "@/components/Chat";
import { useCall } from "@/context/CallContext";
import { useUnreadTripMessages } from "@/hooks/useUnreadTripMessages";
import apiClient from "@/api/api";

export default function ActiveTripScreen() {
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const router = useRouter();
  const activeTripRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { colors: themeColors } = useAppTheme();
  const { user } = useAuth();
  const webrtc = useCall();
  const { callState, incomingCall } = webrtc;
  const [showCall, setShowCall] = useState(false);
  const [isOutgoingCall, setIsOutgoingCall] = useState(false);
  const [stops, setStops] = useState<any[]>([]);
  const [showAddStop, setShowAddStop] = useState(false);
  const [stopAddress, setStopAddress] = useState("");
  const [isAddingStop, setIsAddingStop] = useState(false);
  const { unreadCount, clearUnread } = useUnreadTripMessages(
    activeTrip?.id ?? null,
    user?.id ?? "",
  );
  const [stopsPage, setStopsPage] = useState(1);
const STOPS_PER_PAGE = 5;

const fetchStops = async (bookingId: string) => {
  try {
    const res = await apiClient.get(`/driver/trips/${bookingId}/stops`);
    setStops(res.data);
  } catch {}
};

  const handleAddStop = async () => {
    if (!stopAddress.trim()) return;
    setIsAddingStop(true);
    try {
      const res = await apiClient.post("/driver/trips/stops", {
        bookingId: activeTrip.id,
        address: stopAddress.trim(),
      });
      setStops((prev) => [...prev, res.data.stop]);
      setStopAddress("");
      setShowAddStop(false);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message ?? "Failed to add stop",
      );
    } finally {
      setIsAddingStop(false);
    }
  };

  // Show incoming call screen automatically:
  useEffect(() => {
    if (callState === "incoming" && !showCall) {
      setIsOutgoingCall(false);
      setShowCall(true);
    }
  }, [callState]);

  const styles = createStyles(themeColors);

  const updateActiveTrip = (trip: any) => {
    activeTripRef.current = trip;
    setActiveTrip(trip);
  };

  const fetchActiveTrip = async () => {
    try {
      const trip = await DriverService.getActiveTrip();
      updateActiveTrip(trip);
      if (trip?.id) { fetchStops(trip.id); }
    } catch (error) {
      console.log("No active trip");
    }
  };

  useBookingSocket({
    onBookingUpdated: (updated) => {
      const current = activeTripRef.current;
      if (!current || updated.id !== current.id) return;

      if (updated.status === "CANCELLED") {
        updateActiveTrip(null); // ✅ customer cancelled - clear active trip
        return;
      }
      if (updated.status === "COMPLETED") {
        updateActiveTrip(null);
        router.push("/(tabs)/history"); // ✅ trip ended - go to history
        return;
      }
      updateActiveTrip(updated); // ✅ status update (ACCEPTED → IN_PROGRESS etc)
    },
  });

  useFocusEffect(
    useCallback(() => {
      fetchActiveTrip();
    }, []),
  );

  const handleArriveAtPickup = async () => {
    setIsLoading(true);
    if (!activeTrip) return;
    try {
      await DriverService.arrivedAtPickup(activeTrip.id);
      fetchActiveTrip();
    } catch (error) {
      console.log("Failed to arrive at pickup");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTrip = async () => {
    setIsLoading(true);
    if (!activeTrip) return;
    try {
      await DriverService.startTrip(activeTrip.id);
      fetchActiveTrip();
    } catch (error) {
      console.log("Failed to start trip");
    } finally {
      setIsLoading(false);
    }
  };
  const handleEndTrip = async () => {
    setIsLoading(true);
    if (!activeTrip) return;
    try {
      await DriverService.endTrip(activeTrip.id);
      router.push("/(tabs)/history");
      fetchActiveTrip();
    } catch (error) {
      console.log("Failed to end trip", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeTrip) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          Icon={CarFront}
          title="No Active Trips"
          subtitle="Your active Trips would display here as soon as you accept a trip."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Bottom Sheet Card */}
      <SafeAreaView style={styles.bottomCard} edges={["bottom"]}>
        <View style={styles.cardHeader}>
          <Text style={styles.enRouteText}>
            {activeTrip.status === "IN_PROGRESS"
              ? "Trip in Progress"
              : activeTrip.status === "ARRIVED"
                ? "Waiting for Passenger"
                : "En Route to Pickup"}
          </Text>
          <View style={styles.passengerRow}>
            <View style={styles.passInfo}>
              <View style={styles.passAvatar}>
                <Text style={{ color: "#FFF" }}>
                  {activeTrip.customer?.name?.[0]}
                </Text>
              </View>
              <View>
                <Text style={styles.passName}>{activeTrip.customer?.name}</Text>
                <Text style={styles.passRole}>Passenger</Text>
              </View>
            </View>
           <View style={styles.buttonRow}>
             <TouchableOpacity
              style={styles.callBtn}
              // onPress={() => {
              //   setIsOutgoingCall(true); // ← mark as outgoing BEFORE showing screen
              //   setShowCall(true);
              // }}
              onPress={() => {
                webrtc.startCall({
                  targetUserId: activeTrip?.customerId,
                  callerId: user?.id,
                  callerName: user?.name ?? "Driver",
                  callType: "audio",
                  bookingId: activeTrip?.id ?? "",
                  remoteName: activeTrip?.customer?.name ?? "Passenger",
                });
              }}
            >
              <Phone size={18} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => {
                setShowChat(true);
                clearUnread();
              }}
            >
              <MessageSquare size={18} color="#FFF" />
              {unreadCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    backgroundColor: "#EF4444",
                    borderRadius: 8,
                    minWidth: 16,
                    height: 16,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{ color: "#FFF", fontSize: 9, fontWeight: "800" }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

          {activeTrip &&
            ["3 Hours", "6 Hours", "10 Hours"].includes(
              activeTrip.packageType,
            ) &&
            !activeTrip.upgrade &&
            (activeTrip.status === "ARRIVED" ||
              activeTrip.status === "IN_PROGRESS") && (
               <TouchableOpacity
              style={styles.callBtn}
              onPress={async () => {
                try {
                  await apiClient.post("/upgrade/driver-request", {
                    bookingId: activeTrip.id,
                  });
                  Alert.alert(
                    "Sent",
                    "Customer has been notified to upgrade to Airport ride.",
                  );
                } catch (err: any) {
                  Alert.alert(
                    "Error",
                    err?.response?.data?.message ??
                      "Failed to send upgrade request",
                  );
                }
              }}
            >
              <Plane size={18} color="#FFF" />
            </TouchableOpacity>
            )}
           </View>

          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.rideId}>
            Ride ID: {activeTrip.id.slice(0, 8)}
          </Text>

          <View style={styles.timeline}>
            <View style={styles.locationRow}>
              <MapPin size={18} color="#10B981" />
              <Text style={styles.locationText}>
                {activeTrip.pickupAddress}
              </Text>
            </View>
            <View style={styles.line} />
            <View style={styles.locationRow}>
              <MapPin size={18} color="#EF4444" />
              <Text style={styles.locationText}>
                {activeTrip.dropoffAddress}
              </Text>
            </View>
          </View>

          {activeTrip.status === "ACCEPTED" ? (
            <PrimaryButton
              marginTop
              loading={isLoading}
              disabled={isLoading}
              onPress={handleArriveAtPickup}
              title="Arrive at Pickup"
            />
          ) : activeTrip.status === "ARRIVED" ? (
            <PrimaryButton
              marginTop
              loading={isLoading}
              disabled={isLoading}
              onPress={handleStartTrip}
              title="Start Trip"
            />
          ) : (
            <PrimaryButton
              marginTop
              loading={isLoading}
              disabled={isLoading}
              onPress={handleEndTrip}
              title="End Trip"
            />
          )}
         {activeTrip.status === 'IN_PROGRESS' && (
  <View style={{ marginTop: 16 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <Text style={{ color: themeColors.text, fontWeight: '700' }}>
        Stops ({stops.length})
      </Text>
      {stops.length > STOPS_PER_PAGE && (
        <Text style={{ color: '#6B7280', fontSize: 12 }}>
          {Math.min(stopsPage * STOPS_PER_PAGE, stops.length)} of {stops.length}
        </Text>
      )}
    </View>

    {stops.slice(0, stopsPage * STOPS_PER_PAGE).map((s, i) => (
      <View key={s.id} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
        <View style={{
          width: 22, height: 22, borderRadius: 11,
          backgroundColor: '#E4C77B', alignItems: 'center', justifyContent: 'center', marginRight: 8, marginTop: 1,
        }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#3E2723' }}>{i + 1}</Text>
        </View>
        <Text style={{ flex: 1, color: themeColors.text, fontSize: 13, lineHeight: 20 }}>
          {s.address}
        </Text>
      </View>
    ))}

    {stops.length > stopsPage * STOPS_PER_PAGE && (
      <TouchableOpacity
        onPress={() => setStopsPage(p => p + 1)}
        style={{ alignItems: 'center', paddingVertical: 8 }}
      >
        <Text style={{ color: '#E4C77B', fontSize: 13, fontWeight: '600' }}>
          Show more ({stops.length - stopsPage * STOPS_PER_PAGE} remaining)
        </Text>
      </TouchableOpacity>
    )}

    {showAddStop ? (
      <View style={{ marginTop: 8 }}>
        <TextInput
          value={stopAddress}
          onChangeText={setStopAddress}
          placeholder="Enter stop address"
          placeholderTextColor="#9CA3AF"
          style={{
            borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
            padding: 12, color: themeColors.text, marginBottom: 8,
          }}
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: '#E4C77B', padding: 12, borderRadius: 20, alignItems: 'center' }}
            onPress={handleAddStop}
            disabled={isAddingStop}
          >
            <Text style={{ fontWeight: '700', color: '#3E2723' }}>
              {isAddingStop ? 'Saving...' : 'Save Stop'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, borderWidth: 1, borderColor: '#E5E7EB', padding: 12, borderRadius: 20, alignItems: 'center' }}
            onPress={() => setShowAddStop(false)}
          >
            <Text style={{ color: themeColors.text }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    ) : (
      <TouchableOpacity
        style={{ borderWidth: 1, borderColor: '#E4C77B', borderRadius: 20, padding: 10, alignItems: 'center', marginTop: 4 }}
        onPress={() => setShowAddStop(true)}
      >
        <Text style={{ color: '#E4C77B', fontWeight: '600', fontSize: 13 }}>+ Add Stop</Text>
      </TouchableOpacity>
    )}
  </View>
)}
        </View>

        {showChat && activeTrip?.customerId && (
          <Modal visible={showChat} animationType="slide">
            <Chat
              bookingId={activeTrip.id}
              currentUserId={user!.id}
              currentUserName={user?.name ?? "Driver"}
              targetUserId={activeTrip.customerId}
              targetUserName={activeTrip.customer?.name ?? "Passenger"}
              onClose={() => setShowChat(false)}
            />
          </Modal>
        )}
      </SafeAreaView>
    </View>
  );
}

const createStyles = (themeColors: any) =>
  StyleSheet.create({
    emptyContainer: {
      flex: 1,
      backgroundColor: themeColors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: { color: "#6B7280", fontSize: 16 },
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
      position: "relative",
    },
    mapBase: { flex: 1 },
    bottomCard: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: themeColors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      shadowColor: "#000",
      shadowOffset: { height: -4, width: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    },
    cardHeader: {
      backgroundColor: themeColors.card2,
      padding: 20,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    enRouteText: {
      color: themeColors.textPrimary,
      fontWeight: "700",
      marginBottom: 15,
    },
    passengerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 4,
    },
    passInfo: { flexDirection: "row", alignItems: "center" },
    passAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.3)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    passName: {
      color: themeColors.textPrimary,
      fontSize: 18,
      fontWeight: "bold",
    },
    passRole: { color: themeColors.textPrimary, opacity: 0.8, fontSize: 12 },
    callBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "#FFF",
      alignItems: "center",
      justifyContent: "center",
    },

    cardBody: { padding: 20 },
    rideId: { fontSize: 12, color: "#6B7280", marginBottom: 15 },
    timeline: { marginBottom: 25 },
    locationRow: { flexDirection: "row", alignItems: "center", zIndex: 2 },
    locationText: {
      marginLeft: 15,
      fontSize: 15,
      color: themeColors.text,
      fontWeight: "500",
    },
    line: {
      width: 2,
      height: 20,
      backgroundColor: "#E5E7EB",
      marginLeft: 9,
      marginVertical: 4,
      zIndex: 1,
    },

    primaryBtn: {
      backgroundColor: "#E4C77B",
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: "center",
    },
    upgradeNudgeBtn: {
      borderWidth: 1,
      borderColor: "#E4C77B",
      paddingVertical: 12,
      borderRadius: 20,
      alignItems: "center",
      marginTop: 8,
    },
    upgradeNudgeText: { color: "#E4C77B", fontWeight: "600", fontSize: 13 },
    primaryBtnText: { color: "#3E2723", fontWeight: "bold", fontSize: 16 },
    unreadBadge: {
      position: "absolute",
      top: -8,
      right: -12,
      backgroundColor: "#EF4444",
      borderRadius: 10,
      minWidth: 18,
      height: 18,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
    },
    unreadBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "800" },
  });
