// Business-User/app/(tabs)/schedule.tsx

import { Calendar, ChevronRight, Clock, MapPinned, Plane } from "lucide-react-native";
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
  STANDARD_SERVICE_LGAS,
  OUT_OF_LGA_FEE,
  RIVERS_LGAS
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
import {
  AirportService,
  MultiDayTripType,
  combinePickupDateTime,
  calculateDropoffTime,
  formatTime,
  isValidPickupDateTime,
  isWithinOperatingHours,
  getMinimumPickupDateTime,
  OPERATING_START_HOUR,
  OPERATING_END_HOUR,
} from "@/src/utils/timeSlots";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/src/ui/useAppTheme";
import { usePrices, formatPrice } from "@/hooks/usePrices";
import apiClient from "@/api/api";
import { showToast } from "../utils/toast";
import { TimeSlotPicker } from "@/src/ui/TimeSlotPicker";

type RidePackage = {
  id: "3h" | "6h" | "10h" | "multi" | "airport";
  title: string;
  price?: string;
};



export default function ScheduleTabScreen() {
  const { selectedPackage, setSelectedPackage } = useSchedule();
  const [extrasEnabled, setExtrasEnabled] = useState(true);
  const { prices } = usePrices();
  const { isBusiness } = useAuth();
  // const [pickupLocation, setPickupLocation] = useState("");
  // const [dropoffLocation, setDropoffLocation] = useState("");
  const [scheduleDateTime, setScheduleDateTime] = useState<Date | null>(null);
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [pickupTime, setPickupTime] = useState<Date | null>(null);
  // const [timeSlot, setTimeSlot] = useState("");
  const [interstateLocation, setInterstateLocation] = useState<{
    label: string;
    price: number;
  } | null>(null);
  const [extras, setExtras] = useState({
    babySeat: false,
    extraLuggage: false,
    wifi: false,
    coldWater: false,
    petFriendly: false,
    wheelchair: false,
    fueling: false,
    customExtra: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickupStreet, setPickupStreet] = useState("");
  const [pickupLGA, setPickupLGA] = useState("");
  const [dropoffStreet, setDropoffStreet] = useState("");
  const [dropoffLGA, setDropoffLGA] = useState("");
  const [outOfLGATarget, setOutOfLGATarget] = useState<
    "pickup" | "dropoff" | null
  >(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<{
    discountAmount: number;
    finalAmount: number;
    description: string;
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [airportService, setAirportService] =
  useState<AirportService>("AIRPORT_DROPOFF");

const [multiDayTripType, setMultiDayTripType] =
  useState<MultiDayTripType>("INTRA_STATE");

const [multiDayCount, setMultiDayCount] = useState(1);

const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const isAirportSchedule = selectedPackage === "airport";
  const isMultiSchedule = selectedPackage === "multi";
  const isInterState = isMultiSchedule && multiDayTripType === "INTER_STATE";
const showFreeTextDropoff = !!interstateLocation || isInterState;

  const validatePromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const res = await apiClient.post("/bookings/promo/validate", {
        code: promoCode.toUpperCase(),
        bookingAmount: total,
      });
      setPromoResult(res.data);
      showToast.success("Promo code applied!");
    } catch (err: any) {
      setPromoResult(null);
      showToast.error("Invalid promo" + err?.response?.data?.message);
      console.error("Promo validation error:", err?.response?.data ?? err);
    } finally {
      setPromoLoading(false);
    }
  };

  useEffect(() => {
    console.log(
      "pickupTime changed:",
      pickupTime?.getHours(),
      pickupTime?.getMinutes(),
    );
  }, [pickupTime]);

  useEffect(() => {
  if (!isMultiSchedule) return;
  setInterstateLocation(null);
  setDropoffStreet("");
  setDropoffLGA("");
}, [multiDayTripType, isMultiSchedule]);

  useEffect(() => {
    setPickupStreet("");
    setPickupLGA("");
    setDropoffStreet("");
    setDropoffLGA("");
    setInterstateLocation(null);
    // setTimeSlot("");
    setPromoCode("");
    setPromoResult(null);
    setPickupDate(null);
    setPickupTime(null);
    setExtras({
      babySeat: false,
      extraLuggage: false,
      wifi: false,
      coldWater: false,
      petFriendly: false,
      wheelchair: false,
      fueling: false,
      customExtra: "",
    });
  }, [selectedPackage]);

  const { createBooking } = useBookings();
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);
  const router = useRouter();
  const PACKAGES = [
    {
      id: "3h" as const,
      title: "3-Hours",
      price: `₦${(prices.price_3_hours ?? 0).toLocaleString()}`,
    },
    {
      id: "6h" as const,
      title: "6-Hours",
      price: `₦${(prices.price_6_hours ?? 0).toLocaleString()}`,
    },
    {
      id: "10h" as const,
      title: "10-Hours",
      price: `₦${(prices.price_10_hours ?? 0).toLocaleString()}`,
    },
    { id: "multi" as const, title: "Multi-day", price: undefined },
    { id: "airport" as const, title: "Airport Schedule", price: undefined },
  ];

  const pkg = selectedPackage;

const fuelPriceForPackage = () => {
  switch (pkg) {
    case "3h": return prices.price_fuel_3_hours ?? 0;
    case "6h": return prices.price_fuel_6_hours ?? 0;
    case "10h": return prices.price_fuel_10_hours ?? 0;
    case "airport": return prices.price_fuel_airport ?? 0;
    default: return 0; // multi-day: no fueling add-on
  }
};


const formatHourLabel = (hour: number) => {
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${period}`;
};

const validatePickupSelection = (
  candidateDate: Date | null,
  candidateTime: Date | null,
) => {
  const combined = combinePickupDateTime(candidateDate, candidateTime);
  if (!combined) return true; // one of the two hasn't been picked yet

  if (!isValidPickupDateTime(combined)) {
    const minAllowed = getMinimumPickupDateTime();
     Alert.alert(
        "Restricted Time Slot",
        `Please pick a time after ${formatTime(minAllowed)} - rides need 2 hours' notice for same day booking.`,
      );
    return false;
  }

  if (!isWithinOperatingHours(combined)) {
     Alert.alert(
        "Restricted Time Slot",
        `Pickup time must be between ${formatHourLabel(OPERATING_START_HOUR)} and ${formatHourLabel(OPERATING_END_HOUR)}.`,
      );
    return false;
  }

  if (pkg !== "multi") {
    const dropoff = calculateDropoffTime(pkg, combined, multiDayCount);
    if (dropoff && !isWithinOperatingHours(dropoff)) {
      Alert.alert(
        "Restricted Time Slot",
        `This trip would end at ${formatTime(dropoff)}, after ${formatHourLabel(OPERATING_END_HOUR)}. Choose an earlier pick-up time or a shorter package.`,
      );
      return false;
    }
  }

  return true;
};

  const getInterstatePrice = (value: string) => {
    if (!value) return 0;

    const match = value.match(/₦([\d,]+)/);
    return match ? parseInt(match[1].replace(/,/g, ""), 10) : 0;
  };

  // Computed - concatenates into the string the backend already expects, no schema change
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

  // Replace the total useMemo base price lookup:
  const total = useMemo(() => {
    const base =
      pkg === "3h"
        ? prices.price_3_hours
        : pkg === "6h"
          ? prices.price_6_hours
          : pkg === "10h"
            ? prices.price_10_hours
            : pkg === "airport"
              ? prices.price_airport
              : /* multi/airport */ prices.price_multiday;

    const add = (k: keyof typeof extras, amount: number) =>
      extrasEnabled && extras[k] ? amount : 0;

const fuelPrice =
  pkg === "multi"
    ? 0
    : isAirportSchedule
      ? fuelPriceForPackage()       
      : add("fueling", fuelPriceForPackage());

    const customExtraPrice =
      extrasEnabled && extras.customExtra.trim().length > 0 ? 2000 : 0;

    const interstatePrice = interstateLocation?.price || 0;
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
      add("petFriendly", 2000) +
      add("wheelchair", 2000) +
      fuelPrice +
      customExtraPrice
    );
  }, [
    extras,
    extrasEnabled,
    pkg,
    interstateLocation,
    pickupLGA,
    dropoffLGA,
    prices,
  ]);

  const selectedTitle = PACKAGES.find((p) => p.id === pkg)?.title ?? "3-Hours";

  const effectiveTotal = promoResult ? promoResult.finalAmount : total;
  const totalLabel = `₦${effectiveTotal.toLocaleString()}`;

  const combinedPickup = useMemo(
  () => combinePickupDateTime(pickupDate, pickupTime),
  [pickupDate, pickupTime],
);


const expectedDropoff = useMemo(
  () => calculateDropoffTime(pkg, combinedPickup, multiDayCount),
  [pkg, combinedPickup, multiDayCount],
);


          const addOnsTotal = useMemo(() => {
  if (!extrasEnabled) return 0;
  const add = (k: keyof typeof extras, amount: number) => (extras[k] ? amount : 0);
  const fuelPrice = pkg !== "multi" ? add("fueling", fuelPriceForPackage()) : 0;
  const customExtraPrice = extras.customExtra.trim().length > 0 ? 2000 : 0;
  return (
    add("babySeat", 2000) +
    add("extraLuggage", 2000) +
    add("wifi", 4000) +
    add("coldWater", 2000) +
    add("petFriendly", 2000) +
    add("wheelchair", 2000) +
    fuelPrice +
    customExtraPrice
  );
}, [extras, extrasEnabled, pkg]);

const resolvedTimeSlot = useMemo(() => {
  if (pkg === "multi") return `${multiDayCount} Day${multiDayCount > 1 ? "s" : ""}`;
  if (!combinedPickup || !expectedDropoff) return undefined;
  return `${formatTime(combinedPickup)} – ${formatTime(expectedDropoff)}`;
}, [pkg, combinedPickup, expectedDropoff, multiDayCount]);

const handlePickupTimeChange = (time: Date) => {
  if (!validatePickupSelection(pickupDate, time)) return;
  setPickupTime(time);
};

const handlePickupDateChange = (date: Date) => {
  if (!validatePickupSelection(date, pickupTime)) return;
  setPickupDate(date);
};

  const handleSchedule = async () => {
    const errors: Record<string, boolean> = {};

    if (!pickupStreet.trim()) errors.pickupStreet = true;
if (!pickupLGA && !isAirportSchedule) errors.pickupLGA = true;
if (!dropoffStreet.trim()) errors.dropoffStreet = true;
if (!interstateLocation && !dropoffLGA && !isAirportSchedule) errors.dropoffLGA = true;
if (!pickupDate) errors.pickupDate = true;
if (!pickupTime) errors.pickupTime = true;

setFieldErrors(errors);



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
    if ( selectedPackage !== "multi") {
      return Alert.alert("Missing Field", "Please select a time slot");
    }

    if (!pickupDate) {
      return Alert.alert("Missing field", "Please select a pick-up date.");
    }
    if (!pickupTime) {
      return Alert.alert("Missing field", "Please select a pick-up time.");
    }

   const combinedPickup = new Date(
      pickupDate.getFullYear(),
      pickupDate.getMonth(),
      pickupDate.getDate(),
      pickupTime.getHours(),
      pickupTime.getMinutes(),
    );



if (Object.keys(errors).length > 0) {
  return Alert.alert("Missing field", "Please complete the highlighted fields.");
}

if (!combinedPickup) {
  return Alert.alert("Missing field", "Please select a pickup date and pickup time.");
}

if (!isValidPickupDateTime(combinedPickup)) {
  return Alert.alert(
    "Pickup time unavailable",
    "Please choose a pickup time at least 2 hours from now.",
  );
}

if (!isWithinOperatingHours(combinedPickup)) {
  return Alert.alert(
    "Outside operating hours",
    "Pickup time must be between 7:00 AM and 10:00 PM.",
  );
}

if (expectedDropoff && pkg !== "multi" && !isWithinOperatingHours(expectedDropoff)) {
  return Alert.alert(
    "Drop-off outside operating hours",
    "Please choose an earlier pickup time or a shorter ride duration.",
  );
}


    // ✅ No more scheduleDate string check - scheduleDateTime covers it
 

    setIsSubmitting(true);
    try {
      const packageTypeMap: Record<string, string> = {
        "3h": "3 Hours",
        "6h": "6 Hours",
        "10h": "10 Hours",
        multi: "Multi-day",
        airport: "Airport Schedule",
      };

      const addOnsList = [
        extras.babySeat && "Baby Car Seat",
        extras.extraLuggage && "Extra Luggage",
        extras.wifi && "WiFi",
        extras.coldWater && "Cold Water",
        extras.petFriendly && "Pet Friendly",
        extras.wheelchair && "Wheelchair Access",
        (isAirportSchedule || extras.fueling) &&
  (isAirportSchedule ? "Fueling (Included)" : "Fueling (Pre-paid)"),
        extrasEnabled && extras.customExtra.trim()
          ? extras.customExtra.trim()
          : null,
      ]
        .filter((v): v is string => !!v && extrasEnabled)
        .filter(Boolean) as string[];

      const payload = {
        pickupAddress: pickupLocation.trim(),
        dropoffAddress: dropoffLocation.trim(),
        pickupLat: 0,
        pickupLng: 0,
        dropoffLat: 0,
        dropoffLng: 0,
        duration:
  selectedPackage === "multi"
    ? `${multiDayCount} Day${multiDayCount > 1 ? "s" : ""}`
    : expectedDropoff
      ? `${formatTime(combinedPickup)} - ${formatTime(expectedDropoff)}`
      : undefined,
        pickupDate: pickupDate ? pickupDate.toISOString() : undefined,
        pickupTime: pickupTime ? pickupTime.toISOString() : undefined,
        airportService: isAirportSchedule ? airportService : undefined,
multiDayTripType: isMultiSchedule ? multiDayTripType : undefined,
expectedDropoffAt: expectedDropoff?.toISOString(),
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
        totalAmount: effectiveTotal,
        promoCode: promoResult ? promoCode.toUpperCase() : undefined,
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

      const outOfLGAFeeValue =
  (pickupLGA && !PH_LGAS.includes(pickupLGA) ? OUT_OF_LGA_FEE : 0) +
  (!interstateLocation && dropoffLGA && !PH_LGAS.includes(dropoffLGA)
    ? OUT_OF_LGA_FEE
    : 0);

      const fuelAmountValue =
  pkg === "multi"
    ? 0
    : isAirportSchedule
      ? fuelPriceForPackage()
      : extrasEnabled && extras.fueling
        ? fuelPriceForPackage()
        : 0;


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
                  airportService: isAirportSchedule ? airportService : undefined,
multiDayTripType: isMultiSchedule ? multiDayTripType : undefined,
          addOnsTotal: addOnsTotal > 0 ? String(addOnsTotal) : undefined,
          timeSlot: resolvedTimeSlot,
          fuelIncluded: isAirportSchedule ? "true" : undefined,
          promoCode: promoResult ? promoCode.toUpperCase() : undefined,
          promoDiscount: promoResult ? String(promoResult.discountAmount) : undefined,
         outOfLGAFee: outOfLGAFeeValue > 0
      ? String(outOfLGAFeeValue)
      : undefined,
          fuelAmount: fuelAmountValue > 0 ? String(fuelAmountValue) : undefined,
          pickupDate: pickupDate
            ? pickupDate.toISOString().split("T")[0]
            : undefined,

          pickupTime: pickupTime
            ? pickupTime.toTimeString().split(" ")[0]
            : undefined,
          duration:
            selectedPackage === "multi" ? "Multi-Day" : undefined,
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
          {/* <ScrollView
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
          </ScrollView> */}
<View style={styles.packageGrid}>
  {PACKAGES.map((p) => {
    const Icon =
      p.id === "airport" ? Plane : p.id === "multi" ? Calendar : Clock;
    const active = p.id === pkg;
    return (
      <TouchableOpacity
        key={p.id}
        style={[styles.packageCard, active && styles.packageCardActive]}
        activeOpacity={0.85}
        onPress={() => setSelectedPackage(p.id)}
      >
        <View
          style={[
            styles.packageIconWrap,
            active && styles.packageIconWrapActive,
          ]}
        >
          <Icon
            size={16}
            color={active ? "#3E2723" : themeColors.textSecondary}
          />
        </View>
        <Text
          style={[
            styles.packageCardTitle,
            active && styles.packageCardTitleActive,
          ]}
        >
          {p.title}
        </Text>
        <Text
          style={[
            styles.packageCardPrice,
            !p.price && styles.packageCardPriceMuted,
          ]}
        >
          {p.price ?? "Custom quote"}
        </Text>
      </TouchableOpacity>
    );
  })}
</View>
          {!isAirportSchedule &&
            (isBusiness ? (
              <Text style={styles.h2}>
                Plan Your Interstate Trip ({selectedTitle})
              </Text>
            ) : (
              <Text style={styles.h2}>Trip Details Form ({selectedTitle})</Text>
            ))}
            {isAirportSchedule && (
  <>
    <Text style={styles.h2}>Airport Service</Text>
    <DropdownInput
      label="Airport Service"
      placeholder="Select airport service"
      value={airportService}
      onSelect={setAirportService}
      options={[
        { label: "AIRPORT PICKUP", value: "AIRPORT_PICKUP" },
        { label: "AIRPORT DROPOFF", value: "AIRPORT_DROPOFF" },
        { label: "AIRPORT ROUND TRIP", value: "AIRPORT_ROUND_TRIP" },
      ]}
    />

    {/* <InfoBanner
      variant="info"
      text="Fueling is automatically included for airport schedules."
    /> */}
  </>
)}
{isMultiSchedule && (
  <>
    <Text style={styles.h2}>Multi-Day Trip Type</Text>
    <DropdownInput
      label="Trip Type"
      placeholder="Select trip type"
      value={multiDayTripType}
      onSelect={setMultiDayTripType}
      options={[
        { label: "INTRA-STATE", value: "INTRA_STATE" },
        { label: "INTER-STATE", value: "INTER_STATE" },
      ]}
    />

    <DropdownInput
      label="Duration"
      placeholder="Select number of days"
      value={`${multiDayCount} Day${multiDayCount > 1 ? "s" : ""}`}
      onSelect={(value: string) => setMultiDayCount(parseInt(value, 10))}
      options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"]}
    />
  </>
)}
          {isInterState && (
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
          {/* <DropdownInput
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
          /> */}
          <DateTimePickerInput
            label={`${isAirportSchedule ? "Airport " : ""}Pick-up Date`}
            value={pickupDate}
            onChange={handlePickupDateChange}
            mode="date"
            placeholder="Select Date"
            minimumDate={new Date()}
            icon={<Calendar size={18} color="#9CA3AF" />}
          />
          <DateTimePickerInput
            label={`${isAirportSchedule ? "Airport " : ""}Pick-up Time`}
            value={pickupTime}
            onChange={handlePickupTimeChange}
            mode="time"
            placeholder="Select Time"
            icon={<Clock size={18} color="#9CA3AF" />}
          />
                  {combinedPickup && expectedDropoff && pkg !== "multi" && (
            <InfoBanner
              variant="info"
              text={`Time Slot: ${formatTime(combinedPickup)} – ${formatTime(expectedDropoff)}`}
            />
          )}
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

          {/* Pickup - always Rivers State LGA */}
          {/* <LocationInput
            label={`${isAirportSchedule ? "Airport " : ""}Pick-up Location`}
            placeholder="Enter street / area name"
            leftIcon={<MapPinned size={18} color="#9CA3AF" />}
            street={pickupStreet}
            lga={pickupLGA}
            onStreetChange={setPickupStreet}
            onLGASelect={(lga) => handleLGASelect("pickup", lga)}
          /> */}

          <LocationInput
  label="Pick-up Location"
  placeholder="Enter street / area name"
  leftIcon={<MapPinned size={18} color="#9CA3AF" />}
  street={pickupStreet}
  lga={pickupLGA}
  options={isMultiSchedule ? RIVERS_LGAS : STANDARD_SERVICE_LGAS}
  onStreetChange={setPickupStreet}
  onLGASelect={(lga) => handleLGASelect("pickup", lga)}
/>

          {/* Dropoff - LGA picker only when staying within Rivers State */}
          {showFreeTextDropoff ? (
            <FormInput
              label={`${isAirportSchedule ? "Airport " : ""}Drop-off Location`}
               placeholder={
      interstateLocation
        ? `Enter address in ${interstateLocation.label}`
        : "Select an interstate location above first"
    }
              value={dropoffStreet}
              onChangeText={setDropoffStreet}
              leftIcon={<MapPinned size={18} color="#9CA3AF" />} 
              editable={!isInterState || !!interstateLocation}
            />
          ) : (
           <LocationInput
  label="Drop-off Location"
  placeholder="Enter street / area name"
  leftIcon={<MapPinned size={18} color="#9CA3AF" />}
  street={dropoffStreet}
  lga={dropoffLGA}
  options={isMultiSchedule ? RIVERS_LGAS : STANDARD_SERVICE_LGAS}
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
         {extrasEnabled && (
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
              label="Pet Friendly"
              price="(₦2,000)"
              value={extras.petFriendly}
              onValueChange={(v) =>
                setExtras((s) => ({ ...s, petFriendly: v }))
              }
              disabled={!extrasEnabled}
            />
            <AppCheckboxRow
              label="Wheelchair Access"
              price="(₦2,000)"
              value={extras.wheelchair}
              onValueChange={(v) => setExtras((s) => ({ ...s, wheelchair: v }))}
              disabled={!extrasEnabled}
            />
{pkg !== "multi" && !isAirportSchedule && (
  <>
    <AppCheckboxRow
      label="Fueling (Pre-paid)"
      price={`(₦${fuelPriceForPackage().toLocaleString()})`}
      value={extras.fueling}
      onValueChange={(v) => setExtras((s) => ({ ...s, fueling: v }))}
      disabled={!extrasEnabled}
    />
    {extrasEnabled && extras.fueling && (
      <InfoBanner variant="warning" text="If you later upgrade this ride to an Airport Schedule, this fuel add-on won't carry over — you may need to fuel again." />
    )}
  </>
)}
{isAirportSchedule && (
  <View style={styles.includedFuelRow}>
    <Text style={styles.includedFuelText}>Fueling</Text>
    <Text style={styles.includedFuelValue}>
      Included (₦{fuelPriceForPackage().toLocaleString()})
    </Text>
  </View>
)}
            {/* Custom extra */}
            <View style={styles.customExtraRow}>
              <Text
                style={[
                  styles.customExtraLabel,
                  !extrasEnabled && styles.customExtraDisabled,
                ]}
              >
                Other (₦2,000)
              </Text>
              <FormInput
                placeholder="Describe your extra…"
                value={extras.customExtra}
                onChangeText={(t) =>
                  setExtras((s) => ({ ...s, customExtra: t.slice(0, 15) }))
                }
                editable={extrasEnabled}
                style={[
                  styles.customExtraInput,
                  !extrasEnabled && { opacity: 0.4 },
                ]}
              />
              {extras.customExtra.length > 0 && (
                <Text style={styles.customExtraCount}>
                  {extras.customExtra.length}/15
                </Text>
              )}
            </View>
          </View>
         )}
          <Text style={styles.h2}>Promo Code</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <FormInput
              style={{ flex: 1 }}
              placeholder="Enter promo code"
              value={promoCode}
              autoCapitalize="characters"
              onChangeText={(t) => {
                setPromoCode(t.toUpperCase());
                setPromoResult(null);
              }}
            />
            <PrimaryButton
              title={promoLoading ? "..." : "Apply"}
              onPress={validatePromo}
              style={{ width: 80 }}
              disabled={promoLoading}
            />
          </View>
          {promoResult && (
            <Text style={{ color: "#16a34a", fontSize: 12, marginTop: 4 }}>
              ✓ {promoResult.description} - saving ₦
              {promoResult.discountAmount.toLocaleString()}
            </Text>
          )}
          <Text style={styles.h2}>Total Amount accumulated</Text>
          <View style={styles.totalBox}>
            <Text style={styles.totalText}>{totalLabel}</Text>
          </View>
          {/* <InfoBanner
            variant="warning"
            text="Note: Rides arrive 2 hours after your scheduled time. For example, if you book 8 AM, your ride will arrive at 10 AM."
          /> */}
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

const createStyles = (themeColors: any) =>
  StyleSheet.create({
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
      color: themeColors.text,
    },
    h2: {
      ...text.h2,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
      color: themeColors.text,
    },
    packRow: {
      paddingVertical: spacing.md,
      gap: spacing.md,
    },
    label: {
      ...text.label,
      marginBottom: 8,
      color: themeColors.textSecondary,
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
    verticalPackages: {
  gap: 10,
  marginVertical: spacing.md,
},
packageRow: {
  minHeight: 72,
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: themeColors.border,
  backgroundColor: themeColors.card,
  padding: spacing.md,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},
packageRowActive: {
  borderColor: themeColors.gold,
  backgroundColor: themeColors.cardPrimary,
},
packageTitle: {
  fontSize: 15,
  fontWeight: "700",
  color: themeColors.text,
},
packagePrice: {
  marginTop: 4,
  color: themeColors.textSecondary,
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
    customExtraRow: {
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
    },
    customExtraLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: themeColors.text,
      marginBottom: 6,
    },
    customExtraDisabled: {
      opacity: 0.4,
    },
    customExtraInput: {
      marginBottom: 0,
    },
    customExtraCount: {
      fontSize: 11,
      color: themeColors.textSecondary,
      textAlign: "right",
      marginTop: 2,
    },
    includedFuelRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingVertical: 10,
  paddingHorizontal: 4,
},
includedFuelText: { fontSize: 13, color: themeColors.text, fontWeight: "600" },
includedFuelValue: { fontSize: 13, color: themeColors.textSecondary },
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
    packageGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 10,
  marginVertical: spacing.md,
},
packageCard: {
  width: "48%",
  minHeight: 88,
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: themeColors.border,
  backgroundColor: themeColors.card,
  padding: spacing.sm,
  justifyContent: "space-between",
},
packageCardActive: {
  borderColor: themeColors.gold,
  backgroundColor: themeColors.cardPrimary,
},
packageIconWrap: {
  width: 28,
  height: 28,
  borderRadius: 8,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: themeColors.cardSecondary,
  marginBottom: 8,
},
packageIconWrapActive: {
  backgroundColor: themeColors.gold,
},
packageCardTitle: {
  fontSize: 14,
  fontWeight: "700",
  color: themeColors.text,
},
packageCardTitleActive: {
  color: themeColors.text,
},
packageCardPrice: {
  marginTop: 2,
  fontSize: 12,
  color: themeColors.textSecondary,
},
packageCardPriceMuted: {
  fontStyle: "italic",
},
  });
