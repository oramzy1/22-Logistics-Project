import { router } from 'expo-router';
import { ArrowRight, Bell, ChevronLeft, Clock, MapPin, Phone, Star } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, Switch, TouchableOpacity, View, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/AppText';
import { useBookings } from '@/context/BookingContext'; 

// Simulated Images
const MAP_IMAGE = 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800';
const DRIVER_IMAGE = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80';
const CAR_THUMB = 'https://img.freepik.com/free-photo/black-sedan-parked-outdoors_114579-22736.jpg';

export default function LiveTabScreen() {
  const [showDriverDetails, setShowDriverDetails] = useState(false);
  const [extendTrip, setExtendTrip] = useState(true);
  const [selectedExtension, setSelectedExtension] = useState<string | null>(null);
  const { activeBookings, isLoading } = useBookings();


  // At the top of the return, before the map background:
if (isLoading) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0066FF" />
    </View>
  );
}

// Empty state — no active bookings
if (activeBookings.length === 0) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center", padding: 32 }}>
      <Text style={{ fontSize: 48 }}>🚗</Text>
      <Text style={{ fontSize: 20, fontWeight: "800", color: "#111827", marginTop: 16, marginBottom: 8 }}>No Active Trips</Text>
      <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 32 }}>
        You don't have any ongoing bookings right now.
      </Text>
      <TouchableOpacity
        style={{ backgroundColor: "#0066FF", paddingHorizontal: 32, paddingVertical: 14, borderRadius: 24 }}
        onPress={() => router.push("/schedule")}
      >
        <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 15 }}>Book a Ride</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Multiple active bookings — show a picker list
if (activeBookings.length >= 2) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }} edges={["top"]}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>Active Trips</Text>
      </View>
      <FlatList
        data={activeBookings}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: 20, gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ backgroundColor: "#FFF", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E5E7EB" }}
            onPress={() => router.push({ pathname: "/live", params: { bookingId: item.id } })}
          >
            <Text style={{ fontWeight: "700", fontSize: 15, color: "#111827", marginBottom: 4 }}>
              {item.packageType}
            </Text>
            <Text style={{ color: "#6B7280", fontSize: 13, marginBottom: 8 }}>{item.pickupAddress} → {item.dropoffAddress}</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#0066FF", fontWeight: "600" }}>
                {item.status === "IN_PROGRESS" ? "🟢 In Progress" : "🕐 Awaiting Driver"}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: "700" }}>₦{item.totalAmount.toLocaleString()}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
const activeBooking = activeBookings[0];

  return (
    <View style={styles.root}>
      {/* Background Map Simulation */}
      <ImageBackground source={{ uri: MAP_IMAGE }} style={StyleSheet.absoluteFillObject} imageStyle={{ opacity: 0.8 }} />
      <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)' }} />

      <SafeAreaView style={styles.mapOverlay} edges={['top']}>
        {/* Header over map */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => showDriverDetails ? setShowDriverDetails(false) : router.back()}
          >
            <ChevronLeft color="#374151" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{showDriverDetails ? "Driver Details" : "Live"}</Text>
          <TouchableOpacity style={styles.backBtn}>
            <Bell color="#374151" size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomCardWrapper}>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.bottomCard}>
              <View style={styles.drawerHandle} />
              
              {!showDriverDetails ? (
                // =============== ACTIVE TRIP VIEW ===============
                <>
                  {/* Route Card */}
                   <View style={styles.routeBox}>
                      <View style={styles.routeRow}>
                         <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
                         <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={styles.routeSub}>Current location</Text>
                            <Text style={styles.routeVal}>{activeBooking.pickupAddress}</Text>
                         </View>
                      </View>
                      <View style={styles.routeLine} />
                      <View style={styles.routeRow}>
                         <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
                         <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={styles.routeSub}>Destination</Text>
                            <Text style={styles.routeVal}>{activeBooking.dropoffAddress}</Text>
                         </View>
                      </View>
                   </View>

                   {/* Quick Driver Card */}
                   <View style={styles.quickDriverCard}>
                       <View style={styles.qdTop}>
                          <Image source={{ uri: DRIVER_IMAGE }} style={styles.qdAvatar} />
                          <View style={{ flex: 1, marginLeft: 12 }}>
                             <Text style={styles.qdName}>{activeBooking.driver?.name ?? "Assigning driver..."}</Text>
                             <Text style={styles.qdBio}>Black Toyota Corolla</Text>
                             <Text style={styles.qdBio}>2008 Model</Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                              <Image source={{ uri: CAR_THUMB }} style={styles.qdCar} />
                              <TouchableOpacity style={styles.viewDetailsBtn} onPress={() => setShowDriverDetails(true)}>
                                  <Text style={styles.viewDetailsText}>View Driver's Details</Text>
                              </TouchableOpacity>
                          </View>
                       </View>
                       
                       <View style={styles.qdTimes}>
                           <View style={styles.qdTimeBox}>
                               <Text style={styles.qdTimeLabel}>⏱ Time used</Text>
                               <Text style={styles.qdTimeVal}>2h 15m used</Text>
                           </View>
                           <View style={styles.qdTimeBox}>
                               <Text style={styles.qdTimeLabel}>⏱ Time left</Text>
                               <Text style={styles.qdTimeVal}>45m left</Text>
                           </View>
                       </View>
                   </View>

                   <View style={styles.statusRow}>
                       <Text style={styles.statusLabel}>Status</Text>
                       <Text style={styles.statusVal}>🧾 Trip in progress</Text>
                   </View>

                   {/* Extend Trip Section */}
                   <View style={styles.extendSection}>
                       <View style={styles.extendHeaderRow}>
                           <Text style={styles.extendTitle}>Extend Trip</Text>
                           <Switch value={extendTrip} onValueChange={setExtendTrip} trackColor={{ true: '#FDE047' }} thumbColor="#FFF" />
                       </View>
                       
                       {extendTrip && (
                           <>
                             <View style={styles.extendPills}>
                               {[
                                 {h: '1-Hours', p: '₦10,000'},
                                 {h: '2-Hours', p: '₦15,000'},
                                 {h: '3-Hours', p: '₦24,000'}
                               ].map((ext, idx) => {
                                 const isSelected = selectedExtension === ext.h;
                                 return (
                                  <TouchableOpacity 
                                    key={idx} 
                                    style={[styles.extPill, isSelected && styles.extPillSelected]}
                                    onPress={() => setSelectedExtension(ext.h)}
                                  >
                                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                         <Clock size={12} color={isSelected ? "#FFF" : "#6B7280"} style={{marginRight: 4}} />
                                         <Text style={[styles.extHours, isSelected && { color: "#FFF" }]}>{ext.h}</Text>
                                      </View>
                                      <Text style={[styles.extPrice, isSelected && { color: "#FFF" }]}>{ext.p}</Text>
                                  </TouchableOpacity>
                                 );
                               })}
                             </View>
                             
                             <TouchableOpacity 
                               style={[styles.proceedBtn, !selectedExtension && styles.proceedBtnDisabled]} 
                               onPress={() => router.push('/screens/payment')}
                               disabled={!selectedExtension}
                             >
                                 <Text style={[styles.proceedText, !selectedExtension && { color: '#9CA3AF' }]}>
                                   Proceed to Payment <ArrowRight size={12} color={selectedExtension ? "#111827" : "#9CA3AF"} style={{marginLeft: 4}} />
                                 </Text>
                             </TouchableOpacity>
                           </>
                       )}
                   </View>
                   
                   <TouchableOpacity style={styles.endTripBtn}>
                       <Text style={styles.endTripText}>End Trip <ArrowRight size={12} color="#fff" style={{marginLeft: 4}} /></Text>
                   </TouchableOpacity>

                </>
              ) : (
                // =============== DRIVER DETAILS VIEW ===============
                <>
                  <Text style={styles.sectionTitle}>Driver's details</Text>

                  {/* Driver Image Avatar */}
                  <View style={styles.driverAvatarContainer}>
                    <Image source={{ uri: DRIVER_IMAGE }} style={styles.driverAvatarProfile} />
                    <Text style={styles.driverName}>Jack Soon</Text>
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
                  <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Rating overview</Text>
                  <View style={styles.ratingOverview}>
                     <View style={styles.mainScore}>
                        <Text style={styles.ratingNumber}>4.5</Text>
                        <View style={styles.starsRow}>
                          {[1, 2, 3, 4].map(i => <Star key={i} size={12} color="#FBBF24" fill="#FBBF24" style={{marginRight: 2}}/>)}
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
                                <View style={[styles.progressFill, { width: `${['80%', '40%', '30%', '10%', '5%'][idx]}` }]} />
                             </View>
                          </View>
                       ))}
                     </View>
                  </View>

                  <View style={styles.phoneBox}>
                     <View style={styles.phoneIconBox}>
                        <Phone size={14} color="#D97706" />
                     </View>
                     <Text style={styles.phoneNumber}>08021626619</Text>
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
                       <Text style={[styles.actionTextDef, { color: '#000', fontWeight: 'bold' }]}>Message</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtnWhite}>
                       <Text style={styles.actionTextDef}>Chat</Text>
                  </TouchableOpacity>
              </View>
           )}

        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },
  mapOverlay: { flex: 1, justifyContent: 'space-between' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 4 },
  
  bottomCardWrapper: { flex: 0.8, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  bottomCard: { padding: 24, paddingBottom: 40 },
  drawerHandle: { width: 40, height: 5, backgroundColor: '#E5E7EB', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },

  // --- ACTIVE TRIP STYLES ---
  routeBox: { borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 16, padding: 16, marginBottom: 20 },
  routeRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  routeSub: { fontSize: 11, color: '#6B7280', marginBottom: 4 },
  routeVal: { fontSize: 13, fontWeight: '600', color: '#111827' },
  routeLine: { width: 1, height: 24, backgroundColor: '#E5E7EB', marginLeft: 4, marginVertical: 4 },

  quickDriverCard: { backgroundColor: '#0066FF', borderRadius: 16, padding: 16, marginBottom: 20 },
  qdTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  qdAvatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#FFF' },
  qdName: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  qdBio: { fontSize: 11, color: '#D1D5DB', marginBottom: 2 },
  qdCar: { width: 60, height: 35, borderRadius: 6, marginBottom: 8 },
  viewDetailsBtn: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  viewDetailsText: { fontSize: 10, fontWeight: '700', color: '#111827' },
  
  qdTimes: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 16 },
  qdTimeBox: { flex: 1 },
  qdTimeLabel: { fontSize: 11, color: '#D1D5DB', marginBottom: 4 },
  qdTimeVal: { fontSize: 13, fontWeight: 'bold', color: '#FFF' },

  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  statusLabel: { fontSize: 13, color: '#6B7280' },
  statusVal: { fontSize: 13, fontWeight: 'bold', color: '#111827' },

  extendSection: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, marginBottom: 20 },
  extendHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  extendTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  extendPills: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  extPill: { flex: 1, borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 12, padding: 12 },
  extPillSelected: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  extHours: { fontSize: 11, color: '#3B82F6', fontWeight: '500' },
  extPrice: { fontSize: 14, fontWeight: '800', color: '#111827' },
  proceedBtn: { backgroundColor: '#FDE047', paddingVertical: 14, borderRadius: 24, alignItems: 'center' },
  proceedBtnDisabled: { backgroundColor: '#F3F4F6' },
  proceedText: { fontSize: 14, fontWeight: '700', color: '#111827' },

  endTripBtn: { backgroundColor: '#EF4444', paddingVertical: 16, borderRadius: 24, alignItems: 'center' },
  endTripText: { color: '#FFF', fontWeight: '700', fontSize: 15 },

  // --- DRIVER DETAILS STYLES ---
  driverAvatarContainer: { alignItems: 'center', marginBottom: 24 },
  driverAvatarProfile: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4, marginBottom: 12 },
  driverName: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 10 },
  
  driverMetaRow: { flexDirection: 'row', gap: 10 },
  driverMetaPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#F3F4F6' },
  metaText: { fontSize: 12, color: '#4B5563', marginLeft: 6 },
  langIcon: { fontSize: 10, fontWeight: 'bold', color: '#D97706' },

  ratingOverview: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  mainScore: { flex: 0.4, alignItems: 'center' },
  ratingNumber: { fontSize: 40, fontWeight: '800', color: '#111827', lineHeight: 45 },
  starsRow: { flexDirection: 'row', marginVertical: 4 },
  ratingCount: { fontSize: 10, color: '#9CA3AF' },
  
  barsContainer: { flex: 0.6, paddingLeft: 10 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  barLevelText: { fontSize: 10, color: '#4B5563', width: 8, marginRight: 2 },
  progressTrack: { flex: 1, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, marginLeft: 6 },
  progressFill: { height: 6, backgroundColor: '#FBBF24', borderRadius: 3 },

  phoneBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 12, padding: 16, marginTop: 10 },
  phoneIconBox: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  phoneNumber: { fontSize: 15, fontWeight: '700', color: '#111827' },

  actionFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#F3F4F6', gap: 10 },
  actionBtnWhite: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB', paddingVertical: 14, borderRadius: 24, borderWidth: 1, borderColor: '#F3F4F6' },
  actionBtnBlue: { flex: 1.2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#93C5FD', paddingVertical: 14, borderRadius: 24 },
  actionTextDef: { fontSize: 13, fontWeight: '600', color: '#4B5563' }
});

