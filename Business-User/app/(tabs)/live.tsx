// Business-User/app/(tabs)/live.tsx

import { BookingService } from "@/api/booking.service";
import { useBookings } from "@/context/BookingContext";
import { CancelRideFlow } from "@/src/ui/CancelRideFlow";
import { EndTripFlow } from "@/src/ui/EndTripFlow";
import { LiveSkeleton } from "@/src/ui/skeletons/LiveSkeleton";
import { getRideTimeLabel, getRideTimeRemaining } from "@/src/utils/rideTimer";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowRight,
  Bell,
  ChevronLeft,
  Clock,
  MapPin,
  Phone,
  Star,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/AppText";
import { BookingsSkeleton } from "@/src/ui/skeletons/BookingsSkeleton";
import { useBookingSocket } from "@/hooks/useBookingSocket";

// Simulated Images
const MAP_IMAGE =
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800";
const DRIVER_IMAGE =
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80";
const CAR_THUMB =
  "https://img.freepik.com/free-photo/black-sedan-parked-outdoors_114579-22736.jpg";

export default function LiveTabScreen() {
  const [showDriverDetails, setShowDriverDetails] = useState(false);
  const [extendTrip, setExtendTrip] = useState(true);
  const [selectedExtension, setSelectedExtension] = useState<string | null>(
    null,
  );
  const { activeBookings, isLoading, fetchBookings, patchBooking } = useBookings();

  const [isExtending, setIsExtending] = useState(false);
  const [showEndFlow, setShowEndFlow] = useState(false);
  const [showCancelFlow, setShowCancelFlow] = useState(false);
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();

  const activeBooking = bookingId
    ? (activeBookings.find((b) => b.id === bookingId) ?? activeBookings[0])
    : activeBookings[0];

  const [timeResult, setTimeResult] = useState(() =>
    getRideTimeRemaining(
      activeBooking?.packageType ?? "",
      activeBooking?.scheduledAt ?? "",
    ),
  );

useBookingSocket({
  onBookingUpdated: (updatedBooking) => {
    patchBooking(updatedBooking);
    
    // Alert user when driver status changes to IN_PROGRESS (arrived + started)
    const current = activeBookings.find(b => b.id === updatedBooking.id);
    if (current?.status === 'ACCEPTED' && updatedBooking.status === 'IN_PROGRESS') {
      Alert.alert(
        'Driver Arrived!',
        'Your driver has arrived at the pickup location and started the trip.',
        [{ text: 'OK' }]
      );
    }
    
    // Trip completed by driver — clear live tab
    if (updatedBooking.status === 'COMPLETED') {
      Alert.alert('Trip Completed', 'Your trip has been completed!', [
        { text: 'View Receipt', onPress: () => router.push('/(tabs)/bookings') }
      ]);
    }
  },
});

  const handleExtendTrip = async () => {
    if (!selectedExtension) return;
    setIsExtending(true);
    try {
      const res = await BookingService.createExtension(
        activeBooking.id,
        selectedExtension,
      );
      router.push({
        pathname: "/screens/payment",
        params: {
          bookingId: activeBooking.id,
          packageType: `Extension: ${selectedExtension}`,
          scheduledAt: activeBooking.scheduledAt,
          pickupAddress: activeBooking.pickupAddress,
          dropoffAddress: activeBooking.dropoffAddress,
          totalAmount: String(res.extension.amount),
          authorizationUrl: res.payment.authorizationUrl,
          reference: res.payment.reference,
          isExtension: "true", // flag so success screen knows
        },
      });
    } catch (err: any) {
      // Log the full error so you can actually see what's happening
      console.error(
        "Extension error full:",
        JSON.stringify({
          status: err?.response?.status,
          data: err?.response?.data,
          message: err?.message,
          code: err?.code,
        }),
      );

      const message =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Failed to initialize extension";

      Alert.alert("Extension Failed", message);
    } finally {
      setIsExtending(false);
    }
  };

  useEffect(() => {
    if (!activeBooking) return;
    const interval = setInterval(() => {
      setTimeResult(
        getRideTimeRemaining(
          activeBooking.packageType,
          activeBooking.scheduledAt,
        ),
      );
    }, 60000); // update every minute
    return () => clearInterval(interval);
  }, [activeBooking?.id]);

  // At the top of the return, before the map background:
  if (isLoading) {
    return <LiveSkeleton />;
  }

  // Empty state — no active bookings
  if (activeBookings.length === 0 && !showEndFlow) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#F3F4F6",
          justifyContent: "center",
          alignItems: "center",
          padding: 32,
        }}
      >
        <Text style={{ fontSize: 48 }}>🚗</Text>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            color: "#111827",
            marginTop: 16,
            marginBottom: 8,
          }}
        >
          No Active Trips
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#6B7280",
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          You don't have any ongoing bookings right now.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#0066FF",
            paddingHorizontal: 32,
            paddingVertical: 14,
            borderRadius: 24,
          }}
          onPress={() => router.push("/schedule")}
        >
          <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 15 }}>
            Book a Ride
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Multiple active bookings — show a picker list
  if (activeBookings.length >= 2 && !bookingId) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#F3F4F6" }}
        edges={["top"]}
      >
        <View
          style={{ flexDirection: "row", alignItems: "center", padding: 20 }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 12 }}
          >
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>
            Active Trips
          </Text>
        </View>
        <FlatList
          data={activeBookings}
          keyExtractor={(b) => b.id}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                backgroundColor: "#FFF",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
              onPress={() =>
                router.push({
                  pathname: "/live",
                  params: { bookingId: item.id },
                })
              }
            >
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 15,
                  color: "#111827",
                  marginBottom: 4,
                }}
              >
                {item.packageType}
              </Text>
              <Text style={{ color: "#6B7280", fontSize: 13, marginBottom: 8 }}>
                {item.pickupAddress} → {item.dropoffAddress}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{ fontSize: 13, color: "#0066FF", fontWeight: "600" }}
                >
                  {item.status === "IN_PROGRESS"
                    ? "🟢 In Progress"
                    : item.status === "ACCEPTED"
                    ? "🟡 Driver en route"
                    : "🕐 Awaiting Driver"}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: "700" }}>
                  ₦{item.totalAmount.toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }

  // Helper for the two time boxes
  const timeUsedLabel = (() => {
    if (!activeBooking) return "—";
    const start = new Date(activeBooking.scheduledAt);
    const elapsedMs = Date.now() - start.getTime();
    const h = Math.floor(elapsedMs / 3600000);
    const m = Math.floor((elapsedMs % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m used` : `${m}m used`;
  })();

  const bookingStatus = activeBooking?.status;

  if (!activeBooking && !isLoading) {
    return <BookingsSkeleton />;
  }

  return (
    <View style={styles.root}>
      {/* Background Map Simulation */}
      <ImageBackground
        source={{ uri: MAP_IMAGE }}
        style={StyleSheet.absoluteFillObject}
        imageStyle={{ opacity: 0.8 }}
      />
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.1)",
        }}
      />

      <SafeAreaView style={styles.mapOverlay} edges={["top"]}>
        {/* Header over map */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              if (showDriverDetails) {
                setShowDriverDetails(false);
              } else if (bookingId && activeBookings.length >= 2) {
                // Go back to the list — clear the bookingId param
                router.replace("/(tabs)/live");
              } else {
                router.back();
              }
            }}
          >
            <ChevronLeft color="#374151" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {showDriverDetails ? "Driver Details" : "Live"}
          </Text>
          <TouchableOpacity style={styles.backBtn}>
            <Bell color="#374151" size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomCardWrapper}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={styles.bottomCard}>
              <View style={styles.drawerHandle} />

              {!showDriverDetails ? (
                // =============== ACTIVE TRIP VIEW ===============
                <>
                  {/* Route Card */}
                  <View style={styles.routeBox}>
                    <View style={styles.routeRow}>
                      <View
                        style={[styles.dot, { backgroundColor: "#F59E0B" }]}
                      />
                      <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={styles.routeSub}>Current location</Text>
                        <Text style={styles.routeVal}>
                          {activeBooking.pickupAddress}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.routeLine} />
                    <View style={styles.routeRow}>
                      <View
                        style={[styles.dot, { backgroundColor: "#EF4444" }]}
                      />
                      <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={styles.routeSub}>Destination</Text>
                        <Text style={styles.routeVal}>
                          {activeBooking.dropoffAddress}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Quick Driver Card */}
                  <View style={styles.quickDriverCard}>
                    <View style={styles.qdTop}>
                        <Image source={{ uri: activeBooking.driver?.avatarUrl || "https://ui-avatars.com/api/?name=Driver" }} style={styles.qdAvatar} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.qdName}>
                          {activeBooking.driver?.name ?? "Assigning driver..."}
                        </Text>
                         {(activeBooking.driver as any)?.driverProfile && (
                           <>
                             <Text style={styles.qdBio}>{(activeBooking.driver as any).driverProfile.vehicleColor} {(activeBooking.driver as any).driverProfile.brandModel}</Text>
                             <Text style={styles.qdBio}>Plate: {(activeBooking.driver as any).driverProfile.plateNumber}</Text>
                           </>
                        )}
                      </View>   
                      <View style={{ alignItems: "flex-end" }}>
                        <TouchableOpacity
                          style={styles.viewDetailsBtn}
                          onPress={() => setShowDriverDetails(true)}
                        >
                          <Text style={styles.viewDetailsText}>
                            View Driver's Details
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.qdTimes}>
                      <View style={styles.qdTimeBox}>
                        <Text style={styles.qdTimeLabel}>⏱ Time used</Text>
                        <Text style={styles.qdTimeVal}>{timeUsedLabel}</Text>
                      </View>
                      <View style={styles.qdTimeBox}>
                        <Text style={styles.qdTimeLabel}>⏱ Time left</Text>
                        <Text style={styles.qdTimeVal}>
                          {timeResult.type === "countdown"
                            ? `${timeResult.hoursLeft}h ${timeResult.minutesLeft}m left`
                            : timeResult.type === "ended"
                              ? "Trip ended"
                              : getRideTimeLabel(
                                  activeBooking.packageType,
                                  activeBooking.scheduledAt,
                                )}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Status</Text>
                    <Text style={styles.statusVal}>{
                  bookingStatus === "IN_PROGRESS" ?
                  'Trip In Progress'
                  : bookingStatus === "ACCEPTED" ?
                  'Driver en route'
                  : 'Looking for a driver'
                  }</Text>
                  </View>

                  {/* Extend Trip Section */}
                  <View style={styles.extendSection}>
                    <View style={styles.extendHeaderRow}>
                      <Text style={styles.extendTitle}>Extend Trip</Text>
                      <Switch
                        value={extendTrip}
                        onValueChange={setExtendTrip}
                        trackColor={{ true: "#FDE047" }}
                        thumbColor="#FFF"
                      />
                    </View>

                    {extendTrip && (
                      <>
                        <View style={styles.extendPills}>
                          {[
                            { h: "1-Hours", p: "₦10,000" },
                            { h: "2-Hours", p: "₦15,000" },
                            { h: "3-Hours", p: "₦24,000" },
                          ].map((ext, idx) => {
                            const isSelected = selectedExtension === ext.h;
                            return (
                              <TouchableOpacity
                                key={idx}
                                style={[
                                  styles.extPill,
                                  isSelected && styles.extPillSelected,
                                ]}
                                onPress={() => setSelectedExtension(ext.h)}
                              >
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    marginBottom: 6,
                                  }}
                                >
                                  <Clock
                                    size={12}
                                    color={isSelected ? "#FFF" : "#6B7280"}
                                    style={{ marginRight: 4 }}
                                  />
                                  <Text
                                    style={[
                                      styles.extHours,
                                      isSelected && { color: "#FFF" },
                                    ]}
                                  >
                                    {ext.h}
                                  </Text>
                                </View>
                                <Text
                                  style={[
                                    styles.extPrice,
                                    isSelected && { color: "#FFF" },
                                  ]}
                                >
                                  {ext.p}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.proceedBtn,
                            (!selectedExtension || isExtending) &&
                              styles.proceedBtnDisabled,
                          ]}
                          onPress={handleExtendTrip}
                          disabled={!selectedExtension || isExtending}
                        >
                          <Text
                            style={[
                              styles.proceedText,
                              !selectedExtension && { color: "#9CA3AF" },
                            ]}
                          >
                            {isExtending
                              ? "Initializing..."
                              : `Proceed to Payment`}
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => setShowEndFlow(true)}
                    style={styles.endTripBtn}
                  >
                    <Text style={styles.endTripText}>
                      End Trip{" "}
                      <ArrowRight
                        size={12}
                        color="#fff"
                        style={{ marginLeft: 4 }}
                      />
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelTripBtn}
                    onPress={() => setShowCancelFlow(true)}
                  >
                    <Text style={styles.cancelTripText}>Cancel Booking</Text>
                  </TouchableOpacity>
                </>
              ) : (
                // =============== DRIVER DETAILS VIEW ===============
                 <>
                  <Text style={styles.sectionTitle}>Driver's details</Text>
                  {/* Driver Image Avatar */}
                  <View style={styles.driverAvatarContainer}>
                    <Image
                      source={{ uri: activeBooking.driver?.avatarUrl || "https://ui-avatars.com/api/?name=Driver" }}
                      style={styles.driverAvatarProfile}
                    />
                    <Text style={styles.driverName}>{activeBooking.driver?.name ?? "Unknown Driver"}</Text>
                    <View style={styles.driverMetaRow}>
                      <View style={styles.driverMetaPill}>
                        <MapPin size={12} color="#D97706" />
                        <Text style={styles.metaText}>Port Harcourt</Text>
                      </View>
                      <View style={styles.driverMetaPill}>
                        <Text style={styles.langIcon}>A</Text>
                        <Text style={styles.metaText}>English</Text>
                      </View>
                    </View>
                  </View>
                  {/* Ratings Segment */}
                  <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
                    Rating overview
                  </Text>
                  <View style={styles.ratingOverview}>
                    <View style={styles.mainScore}>
                      <Text style={styles.ratingNumber}>4.5</Text>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4].map((i) => (
                          <Star
                            key={i}
                            size={12}
                            color="#FBBF24"
                            fill="#FBBF24"
                            style={{ marginRight: 2 }}
                          />
                        ))}
                        <Star size={12} color="#D1D5DB" />
                      </View>
                      <Text style={styles.ratingCount}>1,215 ratings</Text>
                    </View>
                    <View style={styles.barsContainer}>
                      {[5, 4, 3, 2, 1].map((lvl, idx) => (
                        <View key={lvl} style={styles.barRow}>
                          <Text style={styles.barLevelText}>{lvl}</Text>
                          <Star size={10} color="#111827" fill="#111827" />
                          <View style={styles.progressTrack}>
                            <View
                              style={[
                                styles.progressFill,
                                {
                                  width: `${["80%", "40%", "30%", "10%", "5%"][idx]}`,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={styles.phoneBox}>
                    <View style={styles.phoneIconBox}>
                      <Phone size={14} color="#D97706" />
                    </View>
                    <Text style={styles.phoneNumber}>
                      {activeBooking.driver?.phone || "No phone number"}
                    </Text>
                  </View>
                  {/* Spacer for bottom actions */}
                  <View style={{ height: 80 }} />
                </>
              )}
            </View>
          </ScrollView>

          {/* Fixed Bottom Action Buttons for Driver Details Only */}
          {showDriverDetails && (
            <View style={styles.actionFooter}>
              <TouchableOpacity style={styles.actionBtnWhite}>
                <Phone size={16} color="#4B5563" style={{ marginRight: 6 }} />
                <Text style={styles.actionTextDef}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnBlue}>
                <Text
                  style={[
                    styles.actionTextDef,
                    { color: "#000", fontWeight: "bold" },
                  ]}
                >
                  Message
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnWhite}>
                <Text style={styles.actionTextDef}>Chat</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
      {showEndFlow && (
        <EndTripFlow
          bookingId={activeBooking.id}
          driverName={activeBooking.driver?.name}
          onClose={() => setShowEndFlow(false)}
        />
      )}

      {showCancelFlow && (
        <CancelRideFlow
          booking={activeBooking}
          onClose={() => setShowCancelFlow(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F3F4F6" },
  mapOverlay: { flex: 1, justifyContent: "space-between" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  bottomCardWrapper: {
    flex: 0.8,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  bottomCard: { padding: 24, paddingBottom: 40 },
  drawerHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },

  // --- ACTIVE TRIP STYLES ---
  routeBox: {
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  routeRow: { flexDirection: "row", alignItems: "center" },
  dot: { width: 10, height: 10, borderRadius: 5 },
  routeSub: { fontSize: 11, color: "#6B7280", marginBottom: 4 },
  routeVal: { fontSize: 13, fontWeight: "600", color: "#111827" },
  routeLine: {
    width: 1,
    height: 24,
    backgroundColor: "#E5E7EB",
    marginLeft: 4,
    marginVertical: 4,
  },

  quickDriverCard: {
    backgroundColor: "#0066FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  qdTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  qdAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  qdName: { fontSize: 16, fontWeight: "bold", color: "#FFF", marginBottom: 4 },
  qdBio: { fontSize: 11, color: "#D1D5DB", marginBottom: 2 },
  qdCar: { width: 60, height: 35, borderRadius: 6, marginBottom: 8 },
  viewDetailsBtn: {
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewDetailsText: { fontSize: 10, fontWeight: "700", color: "#111827" },

  qdTimes: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    paddingTop: 16,
  },
  qdTimeBox: { flex: 1 },
  qdTimeLabel: { fontSize: 11, color: "#D1D5DB", marginBottom: 4 },
  qdTimeVal: { fontSize: 13, fontWeight: "bold", color: "#FFF" },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  statusLabel: { fontSize: 13, color: "#6B7280" },
  statusVal: { fontSize: 13, fontWeight: "bold", color: "#111827" },

  extendSection: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  extendHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  extendTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  extendPills: { flexDirection: "row", gap: 10, marginBottom: 16 },
  extPill: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    padding: 12,
  },
  extPillSelected: { backgroundColor: "#3B82F6", borderColor: "#3B82F6" },
  extHours: { fontSize: 11, color: "#3B82F6", fontWeight: "500" },
  extPrice: { fontSize: 14, fontWeight: "800", color: "#111827" },
  proceedBtn: {
    backgroundColor: "#FDE047",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
  },
  proceedBtnDisabled: { backgroundColor: "#F3F4F6" },
  proceedText: { fontSize: 14, fontWeight: "700", color: "#111827" },

  endTripBtn: {
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: "center",
  },
  endTripText: { color: "#FFF", fontWeight: "700", fontSize: 15 },

  // --- DRIVER DETAILS STYLES ---
  driverAvatarContainer: { alignItems: "center", marginBottom: 24 },
  driverAvatarProfile: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 12,
  },
  driverName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },

  driverMetaRow: { flexDirection: "row", gap: 10 },
  driverMetaPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  metaText: { fontSize: 12, color: "#4B5563", marginLeft: 6 },
  langIcon: { fontSize: 10, fontWeight: "bold", color: "#D97706" },

  ratingOverview: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  mainScore: { flex: 0.4, alignItems: "center" },
  ratingNumber: {
    fontSize: 40,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 45,
  },
  starsRow: { flexDirection: "row", marginVertical: 4 },
  ratingCount: { fontSize: 10, color: "#9CA3AF" },

  barsContainer: { flex: 0.6, paddingLeft: 10 },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  barLevelText: { fontSize: 10, color: "#4B5563", width: 8, marginRight: 2 },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginLeft: 6,
  },
  progressFill: { height: 6, backgroundColor: "#FBBF24", borderRadius: 3 },

  phoneBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  phoneIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  phoneNumber: { fontSize: 15, fontWeight: "700", color: "#111827" },

  actionFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 10,
  },
  actionBtnWhite: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  actionBtnBlue: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#93C5FD",
    paddingVertical: 14,
    borderRadius: 24,
  },
  actionTextDef: { fontSize: 13, fontWeight: "600", color: "#4B5563" },
  cancelTripBtn: {
    borderWidth: 1,
    borderColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 10,
  },
  cancelTripText: { color: "#EF4444", fontWeight: "600", fontSize: 14 },
});
