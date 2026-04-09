import React, { useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Phone, MapPin } from "lucide-react-native";
import { DriverService } from "@/api/driver.service";
import { useFocusEffect } from "expo-router";
import { Text } from "../../components/AppText";
import { useBookingSocket } from "@/hooks/useBookingSocket";
import { useRouter } from "expo-router";


export default function ActiveTripScreen() {
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const router = useRouter();


  useBookingSocket({
  onBookingUpdated: (updated) => {
    if (activeTrip && updated.id === activeTrip.id) {
      setActiveTrip(updated); // reflect status changes instantly
    }
  },
});

  const fetchActiveTrip = async () => {
    try {
      const trip = await DriverService.getActiveTrip();
      setActiveTrip(trip);
    } catch (error) {
      console.log("No active trip");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchActiveTrip();
    }, [])
  );

  const handleStartTrip = async () => {
    if (!activeTrip) return;
    try {
      await DriverService.startTrip(activeTrip.id);
      fetchActiveTrip();
    } catch (error) {
      console.log("Failed to start trip");
    }
  };
  const handleEndTrip = async () => {
    if (!activeTrip) return;
    try {
      await DriverService.endTrip(activeTrip.id);
      router.push("/(tabs)/history");
      fetchActiveTrip();
    } catch (error) {
      console.log("Failed to end trip");
    }
  };

  if (!activeTrip) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>You currently have no active trips.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Placeholder */}
      <View style={styles.mapBase}>
         <Image source={{ uri: "https://maps.googleapis.com/maps/api/staticmap?center=Port+Harcourt&zoom=14&size=600x600&key=YOUR_API_KEY_HERE" }} style={{flex: 1, backgroundColor: '#E5E7EB'}} />
      </View>

      {/* Bottom Sheet Card */}
      <SafeAreaView style={styles.bottomCard} edges={["bottom"]}>
         <View style={styles.cardHeader}>
             <Text style={styles.enRouteText}>
               {activeTrip.status === "IN_PROGRESS" ? "Trip in Progress" : "En Route to Pickup"}
             </Text>
             <View style={styles.passengerRow}>
                <View style={styles.passInfo}>
                   <View style={styles.passAvatar}>
                     <Text style={{color: "#FFF"}}>{activeTrip.customer?.name?.[0]}</Text>
                   </View>
                   <View>
                     <Text style={styles.passName}>{activeTrip.customer?.name}</Text>
                     <Text style={styles.passRole}>Passenger</Text>
                   </View>
                </View>
                <TouchableOpacity style={styles.callBtn}>
                  <Phone size={18} color="#FFF" />
                </TouchableOpacity>
             </View>
         </View>

         <View style={styles.cardBody}>
            <Text style={styles.rideId}>Ride ID: {activeTrip.id.slice(0,8)}</Text>
            
            <View style={styles.timeline}>
               <View style={styles.locationRow}>
                 <MapPin size={18} color="#10B981" />
                 <Text style={styles.locationText}>{activeTrip.pickupAddress}</Text>
               </View>
               <View style={styles.line}/>
               <View style={styles.locationRow}>
                 <MapPin size={18} color="#EF4444" />
                 <Text style={styles.locationText}>{activeTrip.dropoffAddress}</Text>
               </View>
            </View>

            {activeTrip.status === "ACCEPTED" ? (
              <TouchableOpacity style={styles.primaryBtn} onPress={handleStartTrip}>
                <Text style={styles.primaryBtnText}>Arrived at Pickup</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleEndTrip} style={[styles.primaryBtn, {backgroundColor: "#F97316"}]}>
                 <Text style={[styles.primaryBtnText, {color: "#FFF"}]}>End Trip</Text>
              </TouchableOpacity>
            )}
         </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: { flex: 1, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#6B7280", fontSize: 16 },
  container: { flex: 1, backgroundColor: "#F3F4F6", position: "relative" },
  mapBase: { flex: 1 },
  bottomCard: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: "#000", shadowOffset: {height: -4, width: 0}, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  cardHeader: { backgroundColor: "#F97316", padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  enRouteText: { color: "#FFF", fontWeight: "700", marginBottom: 15 },
  passengerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  passInfo: { flexDirection: "row", alignItems: "center" },
  passAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center", marginRight: 12 },
  passName: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  passRole: { color: "#FFF", opacity: 0.8, fontSize: 12 },
  callBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: "#FFF", alignItems: "center", justifyContent: "center" },
  
  cardBody: { padding: 20 },
  rideId: { fontSize: 12, color: "#6B7280", marginBottom: 15 },
  timeline: { marginBottom: 25 },
  locationRow: { flexDirection: "row", alignItems: "center", zIndex: 2 },
  locationText: { marginLeft: 15, fontSize: 15, color: "#111827", fontWeight: "500" },
  line: { width: 2, height: 20, backgroundColor: "#E5E7EB", marginLeft: 9, marginVertical: 4, zIndex: 1 },
  
  primaryBtn: { backgroundColor: "#E4C77B", paddingVertical: 16, borderRadius: 8, alignItems: "center" },
  primaryBtnText: { color: "#3E2723", fontWeight: "bold", fontSize: 16 }
});
