import { router } from "expo-router";
import React from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
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

const packages = [
  { title: "3 Hours", price: "₦24,000" },
  { title: "6 Hours", price: "₦34,000" },
  { title: "10 Hours", price: "₦54,000" },
  { title: "Multi-day", price: "Schedule" },
  { title: "Airport", price: "Schedule" },
];

export default function HomeTabScreen() {
  const { isBusiness, user, isLoading } = useAuth();
  const { setSelectedPackage } = useSchedule();
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);

  const titleToId: Record<string, PackageId> = {
    "3 Hours": "3h",
    "6 Hours": "6h",
    "10 Hours": "10h",
    "Multi-day": "multi",
    Airport: "airport",
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
                  style={{
                    color: themeColors.textPrimary,
                    fontWeight: "800",
                    fontSize: 16,
                  }}
                >
                  Hello {user?.name}
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
          >
            <Text style={styles.h1}>Your Ride, On Schedule</Text>

            <Text style={styles.section}>Special Offers</Text>
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
                Save big on rentals with limited time promotions.
              </Text>
              <Pressable style={styles.offerBtn}>
                <Text style={{ fontWeight: "600" }}>Claim Offer</Text>
              </Pressable>
            </ImageBackground>

            <View style={styles.dots}>
              <View style={[styles.dot, styles.dotInactive]} />
              <View style={styles.dot} />
              <View style={[styles.dot, styles.dotInactive]} />
            </View>

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
                      color: themeColors.textPrimary
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
                        color: themeColors.textSecondary
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
