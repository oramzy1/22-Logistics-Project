import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  CalendarPlus,
  ChevronRight,
  Clock,
  Plane,
} from "lucide-react-native";
import { Text } from "@/components/AppText";
import { radius } from "@/src/ui/theme";
import type { HomeRide } from "@/hooks/useTodaySchedule";
import { useHomeTheme } from "./homeTheme";

const ICONS = { "3h": Clock, "6h": Clock, "10h": Clock, multi: CalendarDays, airport: Plane } as const;

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

function whenLabel(d: Date) {
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);

  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const day = sameDay(d, now)
    ? "Today"
    : sameDay(d, tomorrow)
    ? "Tomorrow"
    : d.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" });
  return `${time} • ${day}`;
}

function Chip({ label, tone }: { label: string; tone: { bg: string; fg: string } }) {
  return (
    <View style={[s.chip, { backgroundColor: tone.bg }]}>
      <Text style={[s.chipText, { color: tone.fg }]}>{label}</Text>
    </View>
  );
}

type Props = {
  ride: HomeRide | null;
  isToday: boolean;
  loading: boolean;
  onViewAll: () => void;
  onSchedule: () => void;
  onOpenRide: (id: string) => void;
};

export function TodayScheduleCard({ ride, isToday, loading, onViewAll, onSchedule, onOpenRide }: Props) {
  const { c, h } = useHomeTheme();
  const RideIcon = ride ? ICONS[ride.packageId] ?? Clock : Clock;

  return (
    <View
      style={[
        s.card,
        { backgroundColor: c.card, borderColor: h.cardBorder, shadowOpacity: h.shadowOpacity },
      ]}
    >
      <View style={s.head}>
        <Text style={[s.title, { color: c.text }]}>
          {ride && !isToday ? "Upcoming Schedule" : "Today's Schedule"}
        </Text>
        <Pressable onPress={onViewAll} hitSlop={10}>
          <Text style={{ color: h.gold, fontWeight: "700", fontSize: 15 }}>View All</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={[s.inner, s.loading, { backgroundColor: h.inner, borderColor: h.innerBorder }]}>
          <ActivityIndicator color={h.gold} />
        </View>
      ) : ride ? (
        <Pressable
          onPress={() => onOpenRide(ride.id)}
          style={[s.inner, { backgroundColor: h.inner, borderColor: h.innerBorder }]}
        >
          <View style={s.rideTop}>
            <View style={[s.iconCircle, { backgroundColor: h.goldTint }]}>
              <RideIcon size={22} color={h.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.rideTitle, { color: c.text }]} numberOfLines={1}>
                {ride.title}
              </Text>
              <Text style={{ color: c.textSecondary, fontSize: 14, marginTop: 2 }}>
                {whenLabel(ride.startsAt)}
              </Text>
            </View>
            <ChevronRight size={20} color={h.gold} />
          </View>

          <View style={s.chips}>
            <Chip label={ride.confirmed ? "Confirmed" : "Pending"} tone={ride.confirmed ? h.chipSuccess : h.chipWarn} />
            {ride.driverAssigned && <Chip label="Driver Assigned" tone={h.chipInfo} />}
            {ride.vehicleAssigned && <Chip label="Vehicle Assigned" tone={h.chipInfo} />}
          </View>

          {!!ride.purpose && (
            <View style={s.purpose}>
              <Briefcase size={16} color={h.gold} />
              <Text style={{ color: c.textSecondary, fontSize: 14 }} numberOfLines={1}>
                Purpose: {ride.purpose}
              </Text>
            </View>
          )}
        </Pressable>
      ) : (
        <>
          <View style={[s.inner, s.emptyRow, { backgroundColor: h.inner, borderColor: h.innerBorder }]}>
            <View style={[s.iconCircle, { backgroundColor: h.goldTint }]}>
              <CalendarPlus size={24} color={c.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.rideTitle, { color: c.text }]}>No journeys scheduled today.</Text>
              <Text style={{ color: c.textSecondary, fontSize: 14, marginTop: 2 }}>
                Schedule your next journey.
              </Text>
            </View>
          </View>

          <Pressable onPress={onSchedule} style={{ marginTop: 12 }}>
            <LinearGradient
              colors={h.goldGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.cta}
            >
              <Text style={{ color: h.onGold, fontWeight: "800", fontSize: 16 }}>Schedule a Journey</Text>
              <ArrowRight size={18} color={h.onGold} />
            </LinearGradient>
          </Pressable>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  title: { fontSize: 18, fontWeight: "800" },
  inner: { borderRadius: 16, borderWidth: 1, padding: 14 },
  loading: { height: 96, alignItems: "center", justifyContent: "center" },
  iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  rideTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  rideTitle: { fontSize: 16, fontWeight: "700" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  chipText: { fontSize: 12.5, fontWeight: "600" },
  purpose: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 },
  emptyRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  cta: {
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
});
