import { Calendar, Clock, MapPinned } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "../../components/AppText";

import { useAuth } from "@/context/AuthContext";
import { useBookings } from "@/context/BookingContext";
import { useSchedule } from "@/context/ScheduleContext";
import { AppHeader } from "@/src/ui/AppHeader";
import { AppSwitch } from "@/src/ui/AppSwitch";
import { AppCheckboxRow } from "@/src/ui/CheckboxRow";
import { DropdownInput } from "@/src/ui/DropdownInput";
import { FormInput } from "@/src/ui/FormInput";
import { InfoBanner } from "@/src/ui/InfoBanner";
import { PrimaryButton } from "@/src/ui/PrimaryButton";
import { PillSegment } from "@/src/ui/SegmentPill";
import { colors, radius, spacing, text } from "@/src/ui/theme";
import { generateTimeSlots } from "@/src/ui/timeSlots";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

type RidePackage = {
  id: "3h" | "6h" | "10h" | "multi" | "airport";
  title: string;
  price?: string;
};

const PACKAGES: RidePackage[] = [
  { id: "3h", title: "3-Hours", price: "₦24,000" },
  { id: "6h", title: "6-Hours", price: "₦34,000" },
  { id: "10h", title: "10-Hours", price: "₦54,000" },
  { id: "multi", title: "Multi-day" },
  { id: "airport", title: "Airport Schedule" },
];

export default function ScheduleTabScreen() {
  const { selectedPackage, setSelectedPackage } = useSchedule();
  const [extrasEnabled, setExtrasEnabled] = useState(true);
  const { isBusiness } = useAuth();
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [interstateLocation, setInterstateLocation] = useState("");
  const [extras, setExtras] = useState({
    babySeat: false,
    extraLuggage: false,
    wifi: true,
    coldWater: true,
    airportRide: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createBooking } = useBookings();
  const router = useRouter();

  const pkg = selectedPackage;
  const setPkg = setSelectedPackage;

  const total = useMemo(() => {
    // Demo calculation only.
    const base =
      pkg === "3h"
        ? 24000
        : pkg === "6h"
          ? 34000
          : pkg === "10h"
            ? 54000
            : 80000;
    const add = (k: keyof typeof extras, amount: number) =>
      extrasEnabled && extras[k] ? amount : 0;
    return (
      base +
      add("babySeat", 2000) +
      add("extraLuggage", 2000) +
      add("wifi", 4000) +
      add("coldWater", 2000) +
      add("airportRide", 2000)
    );
  }, [extras, extrasEnabled, pkg]);

  const totalLabel = `₦${total.toLocaleString()}`;
  const selectedTitle = PACKAGES.find((p) => p.id === pkg)?.title ?? "3-Hours";

  const handleSchedule = async () => {
    // Validate required fields first so you see a clear error instead of "Try again"
    if (!pickupLocation.trim()) {
      return Alert.alert(
        "Missing field",
        "Please enter your pick-up location.",
      );
    }
    if (!dropoffLocation.trim()) {
      return Alert.alert(
        "Missing field",
        "Please enter your drop-off location.",
      );
    }
    if (!scheduleDate.trim()) {
      return Alert.alert("Missing field", "Please select a schedule date.");
    }

    const parsedDate = new Date(scheduleDate);
    if (isNaN(parsedDate.getTime())) {
      return Alert.alert(
        "Invalid date",
        "Please enter a valid date (e.g. 2025-06-01).",
      );
    }

    setIsSubmitting(true);
    try {
      const packageTypeMap: Record<string, string> = {
        "3h": "3 Hours",
        "6h": "6 Hours",
        "10h": "10 Hours",
        multi: "Multi-day",
        airport: "Airport Schedule",
      };

      const payload = {
        pickupAddress: pickupLocation.trim(),
        dropoffAddress: dropoffLocation.trim(),
        pickupLat: 0,
        pickupLng: 0,
        dropoffLat: 0,
        dropoffLng: 0,
        scheduledAt: parsedDate.toISOString(),
        packageType: packageTypeMap[pkg],
        notes:
          isBusiness && interstateLocation
            ? `Interstate: ${interstateLocation}`
            : undefined,
      };

      const { payment, booking } = await createBooking(payload);

      const addOnsList = Object.entries(extras)
        .filter(([, v]) => extrasEnabled && v)
        .map(
          ([k]) =>
            ({
              babySeat: "Baby Car Seat",
              extraLuggage: "Extra Luggage",
              wifi: "WiFi",
              coldWater: "Cold Water",
              airportRide: "Airport Ride",
            })[k],
        )
        .filter(Boolean)
        .join(", ");

      router.push({
        pathname: "/screens/confirmation",
        params: {
          bookingId: booking.id,
          packageType: booking.packageType,
          scheduledAt: booking.scheduledAt,
          pickupAddress: booking.pickupAddress,
          dropoffAddress: booking.dropoffAddress,
          totalAmount: String(booking.totalAmount),
          authorizationUrl: payment.authorizationUrl,
          reference: payment.reference,
          addOns: addOnsList,
        },
      });
    } catch (err: any) {
      // Log the full error so you can actually debug it
      console.error(
        "Booking error:",
        JSON.stringify(err?.response?.data ?? err?.message ?? err),
      );

      const message =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Something went wrong. Please try again.";

      Alert.alert("Booking failed", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAirportSchedule = selectedPackage === "airport";

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <AppHeader title="Schedule ride" />

      <View style={styles.sheet}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.h1}>
            {isAirportSchedule ? "Airport Schedule" : "Schedule Your Ride"}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.packRow}
          >
            {PACKAGES.map((p) => (
              <PillSegment
                key={p.id}
                active={p.id === pkg}
                title={p.title}
                subtitle={p.price}
                onPress={() => setSelectedPackage(p.id)}
              />
            ))}
          </ScrollView>

          {!isAirportSchedule &&
            (isBusiness ? (
              <Text style={styles.h2}>
                Plan Your Interstate Trip ({selectedTitle})
              </Text>
            ) : (
              <Text style={styles.h2}>Trip Details Form ({selectedTitle})</Text>
            ))}

          {isBusiness && (
            <DropdownInput
              label="Select Interstate Location (outside Rivers State)"
              placeholder="Choose your destination"
              value={interstateLocation}
              onSelect={setInterstateLocation}
              options={[
                "Owerri (₦27,000)",
                "Aba (₦27,000)",
                "Umuahia (₦27,000)",
                "Ughelli (₦32,000)",
                "Warri (₦32,000)",
                "Enugu (₦42,000)",
                "Abuja (₦52,000)",
              ]}
            />
          )}

          <FormInput
            label="Select Schedule Date & Time"
            placeholder="Select Date"
            value={scheduleDate}
            onChangeText={setScheduleDate}
            rightIcon={<Calendar size={18} color="#9CA3AF" />}
          />

          <DropdownInput
            label={
              pkg === "multi" ? "Select Day" : `Time slot (8:00 AM – 10:00 PM)`
            }
            placeholder="Select Your Ride Time"
            value={timeSlot}
            onSelect={setTimeSlot}
            options={generateTimeSlots(pkg)}
          />

          <FormInput
            label={`${isAirportSchedule ? "Airport" : ""} Pick-up Date`}
            placeholder="Select Date"
            rightIcon={<Calendar size={18} color="#9CA3AF" />}
          />

          <FormInput
            label={`${isAirportSchedule ? "Airport" : ""} Pick-up Time`}
            placeholder="Select Date"
            rightIcon={<Clock size={18} color="#9CA3AF" />}
          />

          <FormInput
            label={`${isAirportSchedule ? "Airport" : ""} Pick-up Location`}
            placeholder="Input your pick up location"
            value={pickupLocation}
            onChangeText={setPickupLocation}
            leftIcon={<MapPinned size={18} color="#9CA3AF" />}
          />

          <FormInput
            label={`${isAirportSchedule ? "Airport" : ""} Drop-off Location`}
            placeholder="Input your drop off location"
            value={dropoffLocation}
            onChangeText={setDropoffLocation}
            leftIcon={<MapPinned size={18} color="#9CA3AF" />}
          />
          <InfoBanner
            variant="warning"
            text="Note: you are responsible for fueling the vehicle during your trip."
          />

          <View style={styles.rowBetween}>
            <Text style={styles.h2}>Add Extras to Your Ride</Text>
            <AppSwitch value={extrasEnabled} onValueChange={setExtrasEnabled} />
          </View>

          <View style={styles.extrasWrap}>
            <AppCheckboxRow
              label="Baby Car Seat"
              price="(₦2,000)"
              value={extras.babySeat}
              onValueChange={(v) => setExtras((s) => ({ ...s, babySeat: v }))}
              disabled={!extrasEnabled}
            />
            <AppCheckboxRow
              label="Extra Luggage"
              price="(₦2,000)"
              value={extras.extraLuggage}
              onValueChange={(v) =>
                setExtras((s) => ({ ...s, extraLuggage: v }))
              }
              disabled={!extrasEnabled}
            />
            <AppCheckboxRow
              label="WiFi"
              price="(₦4,000)"
              value={extras.wifi}
              onValueChange={(v) => setExtras((s) => ({ ...s, wifi: v }))}
              disabled={!extrasEnabled}
            />
            <AppCheckboxRow
              label="Cold Water"
              price="(₦2,000)"
              value={extras.coldWater}
              onValueChange={(v) => setExtras((s) => ({ ...s, coldWater: v }))}
              disabled={!extrasEnabled}
            />
            <AppCheckboxRow
              label="Airport Ride"
              price="(₦2,000)"
              value={extras.airportRide}
              onValueChange={(v) =>
                setExtras((s) => ({ ...s, airportRide: v }))
              }
              disabled={!extrasEnabled}
            />
          </View>

          <Text style={styles.h2}>Total Amount accumulated</Text>
          <View style={styles.totalBox}>
            <Text style={styles.totalText}>{totalLabel}</Text>
          </View>

          <InfoBanner
            variant="warning"
            text="Note: Rides arrive 2 hours after your scheduled time. For example, if you book 8 AM, your ride will arrive at 10 AM."
          />

          <PrimaryButton
            title={isSubmitting ? "Scheduling..." : "Schedule Ride"}
            onPress={handleSchedule}
            disabled={isSubmitting}
          />

          <TouchableOpacity style={{ height: 12 }} activeOpacity={1} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 32,
  },
  h1: {
    ...text.h1,
  },
  h2: {
    ...text.h2,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  packRow: {
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  label: {
    ...text.label,
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    fontSize: 14,
    color: colors.text,
    backgroundColor: "#fff",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },
  extrasWrap: {
    borderWidth: 1,
    borderColor: colors.softBorder,
    borderRadius: radius.lg,
    padding: 10,
    marginTop: spacing.sm,
  },
  totalBox: {
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
});
