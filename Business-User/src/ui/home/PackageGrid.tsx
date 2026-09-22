import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { CalendarDays, ChevronRight, Clock, Plane } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { Text } from "@/components/AppText";
import { radius } from "@/src/ui/theme";
import { formatPrice, usePrices } from "@/hooks/usePrices";
import type { PackageId } from "@/src/utils/timeSlots";
import { useHomeTheme } from "./homeTheme";

type Item = { id: PackageId; title: string; blurb: string; price?: string; Icon: LucideIcon };

type Props = {
  prices: ReturnType<typeof usePrices>["prices"];
  onSelect: (id: PackageId) => void;
  /** Shown only when provided (the active-ride mockup has it, the empty one doesn't) */
  onSeeAll?: () => void;
};

export function PackageGrid({ prices, onSelect, onSeeAll }: Props) {
  const { c, h } = useHomeTheme();

  const items: Item[] = [
    { id: "3h", title: "3 Hours", blurb: "Perfect for errands & meetings", price: formatPrice(prices.price_3_hours), Icon: Clock },
    { id: "6h", title: "6 Hours", blurb: "Ideal for business appointments", price: formatPrice(prices.price_6_hours), Icon: Clock },
    { id: "10h", title: "10 Hours", blurb: "Full-day convenience", price: formatPrice(prices.price_10_hours), Icon: Clock },
    { id: "airport", title: "Airport Schedule", blurb: "Pickup • Drop-off • Round Trip", Icon: Plane },
  ];

  const cardStyle = [
    s.card,
    { backgroundColor: c.card, borderColor: h.cardBorder, shadowOpacity: h.shadowOpacity },
  ];

  return (
    <View>
      <View style={s.head}>
        <View style={{ flex: 1 }}>
          <Text style={[s.title, { color: c.text }]}>Choose a Schedule</Text>
          <Text style={{ color: c.textSecondary, fontSize: 14, marginTop: 2 }}>
            Flexible options for every need.
          </Text>
        </View>
        {onSeeAll && (
          <Pressable onPress={onSeeAll} hitSlop={10}>
            <Text style={{ color: h.gold, fontWeight: "700", fontSize: 15 }}>See All</Text>
          </Pressable>
        )}
      </View>

      <View style={s.grid}>
        {items.map(({ id, title, blurb, price, Icon }) => (
          <Pressable
            key={id}
            onPress={() => onSelect(id)}
            android_ripple={{ color: "#0000000C" }}
            style={[cardStyle, s.half]}
          >
            <View style={[s.iconCircle, { backgroundColor: h.goldTint }]}>
              <Icon size={20} color={c.textSecondary} />
            </View>
            <Text style={[s.cardTitle, { color: c.text }]}>{title}</Text>
            <Text style={[s.blurb, { color: c.textSecondary }]}>{blurb}</Text>
            <View style={s.bottom}>
              <Text style={[s.price, { color: c.text }]}>{price ?? ""}</Text>
              <ChevronRight size={20} color={c.textSecondary} />
            </View>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => onSelect("multi")}
        android_ripple={{ color: "#0000000C" }}
        style={[cardStyle, s.multi]}
      >
        <View style={[s.iconCircle, { backgroundColor: h.goldTint }]}>
          <CalendarDays size={20} color={c.textSecondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.cardTitle, { color: c.text, marginTop: 0 }]}>Multi-Day Schedule</Text>
          <Text style={{ color: c.textSecondary, fontSize: 13.5, marginTop: 2 }}>
            Extended travel outside the city
          </Text>
        </View>
        <ChevronRight size={20} color={c.textSecondary} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  title: { fontSize: 20, fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  half: { flexBasis: "47.5%", flexGrow: 1, minHeight: 168 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  cardTitle: { marginTop: 12, fontSize: 17, fontWeight: "700" },
  blurb: { marginTop: 4, fontSize: 13.5, lineHeight: 19 },
  bottom: {
    marginTop: "auto",
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: { fontSize: 17, fontWeight: "800" },
  multi: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 14 },
});
