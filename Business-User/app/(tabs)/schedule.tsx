// Business-User/app/(tabs)/schedule.tsx

import { Calendar, Clock, MapPinned } from "lucide-react-native";
import React, { useMemo, useState, useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "../../components/AppText";
import { LocationInput } from "@/src/ui/LocationInput";
import { OutOfLGAModal } from "@/src/ui/OutOfLGAModal";
import {
  INTERSTATE_STATES,
  PH_LGAS,
  OUT_OF_LGA_FEE,
} from "@/src/utils/nigeriaLocations";

import { useAuth } from "@/context/AuthContext";
import { useBookings } from "@/context/BookingContext";
import { useSchedule } from "@/context/ScheduleContext";
import { AppHeader } from "@/src/ui/AppHeader";
import { AppSwitch } from "@/src/ui/AppSwitch";
import { AppCheckboxRow } from "@/src/ui/CheckboxRow";
import { DateTimePickerInput } from "@/src/ui/DateTimePicker";
import { DropdownInput } from "@/src/ui/DropdownInput";
import { FormInput } from "@/src/ui/FormInput";
import { InfoBanner } from "@/src/ui/InfoBanner";
import { PrimaryButton } from "@/src/ui/PrimaryButton";
import { PillSegment } from "@/src/ui/SegmentPill";
import { ScheduleSkeleton } from "@/src/ui/skeletons/ScheduleSkeleton";
import { colors, radius, spacing, text } from "@/src/ui/theme";
import { generateTimeSlots } from "@/src/utils/timeSlots";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/src/ui/useAppTheme";


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
  // const [pickupLocation, setPickupLocation] = useState("");
  // const [dropoffLocation, setDropoffLocation] = useState("");
  const [scheduleDateTime, setScheduleDateTime] = useState<Date | null>(null);
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [pickupTime, setPickupTime] = useState<Date | null>(null);
  const [timeSlot, setTimeSlot] = useState("");
  const [interstateLocation, setInterstateLocation] = useState<{
    label: string;
    price: number;
  } | null>(null);
  const [extras, setExtras] = useState({
    babySeat: false,
    extraLuggage: false,
    wifi: true,
    coldWater: true,
    airportRide: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickupStreet, setPickupStreet] = useState("");
  const [pickupLGA, setPickupLGA] = useState("");
  const [dropoffStreet, setDropoffStreet] = useState("");
  const [dropoffLGA, setDropoffLGA] = useState("");
  const [outOfLGATarget, setOutOfLGATarget] = useState<
    "pickup" | "dropoff" | null
  >(null);
  useEffect(() => {
  console.log("pickupTime changed:", pickupTime?.getHours(), pickupTime?.getMinutes());
}, [pickupTime]);

  const { createBooking } = useBookings();
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);
  const router = useRouter();

  const pkg = selectedPackage;
  

  const getInterstatePrice = (value: string) => {
    if (!value) return 0;

    const match = value.match(/₦([\d,]+)/);
    return match ? parseInt(match[1].replace(/,/g, ""), 10) : 0;
  };

  // Computed — concatenates into the string the backend already expects, no schema change
  const pickupLocation = [
    pickupStreet.trim(),
    pickupLGA && `${pickupLGA} LGA`,
    "Rivers State",
  ]
    .filter(Boolean)
    .join(", ");

  const dropoffLocation = interstateLocation
    ? [dropoffStreet.trim(), `${interstateLocation.label} State`]
        .filter(Boolean)
        .join(", ")
    : [dropoffStreet.trim(), dropoffLGA && `${dropoffLGA} LGA`, "Rivers State"]
        .filter(Boolean)
        .join(", ");

  const handleLGASelect = (which: "pickup" | "dropoff", lga: string) => {
    if (which === "pickup") setPickupLGA(lga);
    else setDropoffLGA(lga);
    if (!PH_LGAS.includes(lga)) setOutOfLGATarget(which); // trigger modal
  };

  const total = useMemo(() => {
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
    const interstatePrice = interstateLocation?.price || 0;
    // ₦3k if pickup is outside PH; ₦3k if dropoff is outside PH (only for within-Rivers trips)
    const outOfLGAFee =
      (pickupLGA && !PH_LGAS.includes(pickupLGA) ? OUT_OF_LGA_FEE : 0) +
      (!interstateLocation && dropoffLGA && !PH_LGAS.includes(dropoffLGA)
        ? OUT_OF_LGA_FEE
        : 0);

    return (
      base +
      interstatePrice +
      outOfLGAFee +
      add("babySeat", 2000) +
      add("extraLuggage", 2000) +
      add("wifi", 4000) +
      add("coldWater", 2000) +
      add("airportRide", 2000)
    );
  }, [extras, extrasEnabled, pkg, interstateLocation, pickupLGA, dropoffLGA]);

  const totalLabel = `₦${total.toLocaleString()}`;
  const selectedTitle = PACKAGES.find((p) => p.id === pkg)?.title ?? "3-Hours";

  const handleSchedule = async () => {
    // if (!pickupLocation.trim()) {
    //   return Alert.alert(
    //     "Missing field",
    //     "Please enter your pick-up location.",
    //   );
    // }
    // if (!dropoffLocation.trim()) {
    //   return Alert.alert(
    //     "Missing field",
    //     "Please enter your drop-off location.",
    //   );
    // }

    if (!pickupStreet.trim())
      return Alert.alert(
        "Missing field",
        "Please enter your pick-up street address.",
      );
    if (!pickupLGA)
      return Alert.alert("Missing field", "Please select your pick-up LGA.");
    if (!dropoffStreet.trim())
      return Alert.alert(
        "Missing field",
        "Please enter your drop-off street address.",
      );
    if (!interstateLocation && !dropoffLGA)
      return Alert.alert("Missing field", "Please select your drop-off LGA.");

    // if (!scheduleDateTime) {
    //   return Alert.alert("Missing field", "Please select a schedule date.");
    // }
    if (!timeSlot && selectedPackage !== "multi") {
      return Alert.alert("Missing Field", "Please select a time slot");
    }

    if (!pickupDate) {
      return Alert.alert("Missing field", "Please select a pick-up date.");
    }
    if (!pickupTime) {
      return Alert.alert("Missing field", "Please select a pick-up time.");
    }

    // ✅ No more scheduleDate string check — scheduleDateTime covers it
    const combinedPickup = new Date(
      pickupDate.getFullYear(),
      pickupDate.getMonth(),
      pickupDate.getDate(),
      pickupTime.getHours(),
      pickupTime.getMinutes(),
    );

    setIsSubmitting(true);
    try {
      const packageTypeMap: Record<string, string> = {
        "3h": "3 Hours",
        "6h": "6 Hours",
        "10h": "10 Hours",
        multi: "Multi-day",
        airport: "Airport Schedule",
      };

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
        .filter(Boolean) as string[];

      const payload = {
        pickupAddress: pickupLocation.trim(),
        dropoffAddress: dropoffLocation.trim(),
        pickupLat: 0,
        pickupLng: 0,
        dropoffLat: 0,
        dropoffLng: 0,
        duration:
          selectedPackage === "multi" ? "Multi-Day" : timeSlot || undefined,
        pickupDate: pickupDate ? pickupDate.toISOString() : undefined,
        pickupTime: pickupTime ? pickupTime.toISOString() : undefined,
        outsidePH:
          !!interstateLocation ||
          (!!pickupLGA && !PH_LGAS.includes(pickupLGA)) ||
          (!interstateLocation &&
            !!dropoffLGA &&
            !PH_LGAS.includes(dropoffLGA)),
        addOns: addOnsList,
        scheduledAt: combinedPickup.toISOString(),
        pickupAt: combinedPickup.toISOString(),
        packageType: packageTypeMap[pkg],
        totalAmount: total,
        notes:
          [
            interstateLocation
              ? `Interstate: ${interstateLocation.label}`
              : null,
            pickupLGA && !PH_LGAS.includes(pickupLGA)
              ? `Pickup outside PH (${pickupLGA} LGA)`
              : null,
            !interstateLocation && dropoffLGA && !PH_LGAS.includes(dropoffLGA)
              ? `Dropoff outside PH (${dropoffLGA} LGA)`
              : null,
          ]
            .filter(Boolean)
            .join(" | ") || undefined,
      };

      const { payment, booking } = await createBooking(payload);

      console.log("Your Payload", payload);

      router.push({
        pathname: "/screens/confirmation",
        params: {
          bookingId: booking.id,
          packageType: booking.packageType,
          scheduledAt: combinedPickup.toISOString(),
          pickupAddress: booking.pickupAddress,
          dropoffAddress: booking.dropoffAddress,
          totalAmount: String(booking.totalAmount),
          authorizationUrl: payment.authorizationUrl,
          reference: payment.reference,
          addOns: addOnsList,
          outOfLGAFee: String(
            (pickupLGA && !PH_LGAS.includes(pickupLGA) ? OUT_OF_LGA_FEE : 0) +
              (!interstateLocation &&
              dropoffLGA &&
              !PH_LGAS.includes(dropoffLGA)
                ? OUT_OF_LGA_FEE
                : 0),
          ),
          pickupDate: pickupDate
            ? pickupDate.toISOString().split("T")[0]
            : undefined,

          pickupTime: pickupTime
            ? pickupTime.toTimeString().split(" ")[0]
            : undefined,
          duration:
            selectedPackage === "multi" ? "Multi-Day" : timeSlot || undefined,
        },
      });
    } catch (err: any) {
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
  const isMultiSchedule = selectedPackage === "multi";

  // if (isSubmitting) return <ScheduleSkeleton />;

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
          {(isBusiness || isAirportSchedule || isMultiSchedule) && (
            <DropdownInput
              label="Select Interstate Location (outside Rivers State)"
              placeholder="Choose your destination"
              value={interstateLocation}
              onSelect={setInterstateLocation}
              options={INTERSTATE_STATES}
            />
          )}
          {/* <DateTimePickerInput
            label="Select Schedule Date & Time"
            value={scheduleDateTime}
            onChange={setScheduleDateTime}
            mode="date"
            placeholder="Select Date"
            minimumDate={new Date()}
            icon={<Calendar size={18} color="#9CA3AF" />}
          /> */}
          <DropdownInput
            label={
              pkg === "multi"
                ? "Time slot (10+ hours)"
                : `Time slot (8:00 AM – 10:00 PM)`
            }
            placeholder="Select Your Ride Time"
            value={timeSlot}
            onSelect={(val: any) => {
              console.log("SELECTED SLOT:", val);
              setTimeSlot(val);
            }}
            options={generateTimeSlots(pkg)}
          />
          <DateTimePickerInput
            label={`${isAirportSchedule ? "Airport " : ""}Pick-up Date`}
            value={pickupDate}
            onChange={setPickupDate}
            mode="date"
            placeholder="Select Date"
            minimumDate={new Date()}
            icon={<Calendar size={18} color="#9CA3AF" />}
          />
          <DateTimePickerInput
            label={`${isAirportSchedule ? "Airport " : ""}Pick-up Time`}
            value={pickupTime}
            onChange={setPickupTime}
            mode="time"
            placeholder="Select Time"
            icon={<Clock size={18} color="#9CA3AF" />}
          />
          {/* <FormInput
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
          /> */}

          {/* Pickup — always Rivers State LGA */}
          <LocationInput
            label={`${isAirportSchedule ? "Airport " : ""}Pick-up Location`}
            placeholder="Enter street / area name"
            leftIcon={<MapPinned size={18} color="#9CA3AF" />}
            street={pickupStreet}
            lga={pickupLGA}
            onStreetChange={setPickupStreet}
            onLGASelect={(lga) => handleLGASelect("pickup", lga)}
          />

          {/* Dropoff — LGA picker only when staying within Rivers State */}
          {interstateLocation ? (
            <FormInput
              label={`${isAirportSchedule ? "Airport " : ""}Drop-off Location`}
              placeholder={`Enter address in ${interstateLocation.label}`}
              value={dropoffStreet}
              onChangeText={setDropoffStreet}
              leftIcon={<MapPinned size={18} color="#9CA3AF" />}
            />
          ) : (
            <LocationInput
              label={`${isAirportSchedule ? "Airport " : ""}Drop-off Location`}
              placeholder="Enter street / area name"
              leftIcon={<MapPinned size={18} color="#9CA3AF" />}
              street={dropoffStreet}
              lga={dropoffLGA}
              onStreetChange={setDropoffStreet}
              onLGASelect={(lga) => handleLGASelect("dropoff", lga)}
            />
          )}
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
            marginTop
            disabled={isSubmitting}
          />
          <TouchableOpacity style={{ height: 12 }} activeOpacity={1} />
        </ScrollView>
      </View>
      <OutOfLGAModal
        visible={!!outOfLGATarget}
        lgaName={outOfLGATarget === "pickup" ? pickupLGA : dropoffLGA}
        onContinue={() => setOutOfLGATarget(null)}
        onChangeDestination={() => {
          if (outOfLGATarget === "pickup") setPickupLGA("");
          else setDropoffLGA("");
          setOutOfLGATarget(null);
        }}
      />
    </SafeAreaView>
  );
}

const createStyles = (themeColors: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: themeColors.navy,
  },
  sheet: {
    flex: 1,
    backgroundColor: themeColors.background,
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
    color: themeColors.text
  },
  h2: {
    ...text.h2,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: themeColors.text
  },
  packRow: {
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  label: {
    ...text.label,
    marginBottom: 8,
    color: themeColors.textSecondary
  },
  input: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    fontSize: 14,
    color: colors.text,
    backgroundColor: themeColors.background,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },
  extrasWrap: {
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: radius.lg,
    padding: 10,
    marginTop: spacing.sm,

  },
  totalBox: {
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: themeColors.border,
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: themeColors.background,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "700",
    color: themeColors.text,
  },
});
