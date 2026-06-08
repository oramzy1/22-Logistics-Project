import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState} from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
  Alert,
} from "react-native";
import { Text } from "../../components/AppText";

import { useAuth } from "@/context/AuthContext";
import { useSchedule } from "@/context/ScheduleContext";
import { AppHeader } from "@/src/ui/AppHeader";
import { BusinessHome } from "@/src/ui/BusinessHome";
import { HomeSkeleton } from "@/src/ui/skeletons/HomeSkeleton";
import { colors, radius, spacing } from "@/src/ui/theme";
import { useAppTheme } from "@/src/ui/useAppTheme";
import { PackageId } from "@/src/utils/timeSlots";
import { Clock } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePrices, formatPrice } from "@/hooks/usePrices";
import { PromoCarousel } from "@/src/ui/PromoCarousel";
import { useUserPromos } from "@/hooks/useUserPromos";

export default function HomeTabScreen() {
  const { promos } = useUserPromos();
  const { prices } = usePrices();
  const { isBusiness, user, isLoading, signOut } = useAuth();
  const { setSelectedPackage, setPendingPromo } = useSchedule();
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);
const [refreshing, setRefreshing] = useState(false);

  const packages = [
    { title: "3 Hours", price: formatPrice(prices.price_3_hours) },
    { title: "6 Hours", price: formatPrice(prices.price_6_hours) },
    { title: "10 Hours", price: formatPrice(prices.price_10_hours) },
    { title: "Multi-day", price: "Schedule" },
    { title: "Airport", price: "Schedule" },
  ];

  const titleToId: Record<string, PackageId> = {
    "3 Hours": "3h",
    "6 Hours": "6h",
    "10 Hours": "10h",
    "Multi-day": "multi",
    Airport: "airport",
  };

  const fetchHomeData = useCallback(async () => {
  try {
    setRefreshing(true);
    // Trigger any data refetches your hooks expose, e.g.:
    // await refetchPrices();
    // await refetchPromos();
  } catch (err: any) {
    if (err?.response?.status === 401) {
      Alert.alert("Session Expired", "Please log in again.");
      signOut();
      router.push("/(auth)/sign-in");
    }
  } finally {
    setRefreshing(false);
  }
}, []);


useFocusEffect(
  useCallback(() => {
    fetchHomeData();
  }, [fetchHomeData])
);
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
                  style={{
                    color: "#fff",
                    fontWeight: "800",
                    fontSize: 16,
                    width: 150,
                    flexShrink: 1,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Hello, {user?.name}
                </Text>
                <Text
                  style={{
                    color: themeColors.textSecondary,
                    marginTop: 2,
                    fontSize: 12,
                  }}
                >
                  Plan Your Next Ride
                </Text>
              </View>
            }
            rightIcons
            leftAvatar
          />
        </View>

        {isBusiness ? (
          <BusinessHome />
        ) : (
        <ScrollView
  contentContainerStyle={styles.content}
  showsVerticalScrollIndicator={false}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={fetchHomeData} />
  }
          >
            <Text style={styles.h1}>Your Ride, On Schedule</Text>
            {promos.length > 0 && (
              <>
                <Text style={styles.section}>Special Offers</Text>
                <PromoCarousel
                  promos={promos}
                  // onApply={(code) => {
                  //   setPendingPromo(code);
                  //   setSelectedPackage('3h'); // default, user can change on schedule tab
                  // }}
                />
              </>
            )}

            <Text style={styles.section}>Schedule Your Ride</Text>
            <View style={styles.grid}>
              {packages.map((p) => (
                <Pressable
                  key={p.title}
                  style={styles.pkg}
                  onPress={() => {
                    setSelectedPackage(titleToId[p.title] ?? "3h");
                    router.push("/(tabs)/schedule");
                  }}
                  android_ripple={{ color: "#0000000C" }}
                >
                  <Clock color={"#3B82F6"} size={10} />
                  <Text
                    style={{
                      fontWeight: "600",
                      fontSize: 18,
                      marginTop: 6,
                      margin: "auto",
                      color: themeColors.textPrimary,
                    }}
                  >
                    {p.title}
                  </Text>
                  {!!p.price && (
                    <Text
                      style={{
                        fontWeight: "600",
                        fontSize: 18,
                        marginTop: 6,
                        margin: "auto",
                        color: themeColors.textSecondary,
                      }}
                    >
                      {p.price}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (themeColors: any) =>
  StyleSheet.create({
    origin: { backgroundColor: themeColors.navy },
    root: { backgroundColor: themeColors.background, height: "100%" },
    top: { paddingBottom: spacing.md },
    content: { padding: spacing.lg, paddingBottom: 40 }, 
    h1: {
      fontSize: 20,
      fontWeight: "600",
      color: themeColors.text,
      marginBottom: spacing.lg,
    },
    section: {
      fontSize: 16,
      fontWeight: "500",
      color: themeColors.text,
      marginTop: spacing.lg,
      marginBottom: spacing.md,
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
    offerDiscount: { color: "#fff", fontWeight: "600", fontSize: 18 },
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
    },
    dot: { width: 18, height: 4, borderRadius: 3, backgroundColor: "#F59E0B" },
    dotInactive: { width: 6, backgroundColor: "#D1D5DB" },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
    },
    pkg: {
      width: "47%",
      minHeight: 120,
      borderRadius: radius.xl,
      backgroundColor: themeColors.card,
      borderWidth: 1,
      borderColor: themeColors.border,
      padding: spacing.lg,
      justifyContent: "center",
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
  });
