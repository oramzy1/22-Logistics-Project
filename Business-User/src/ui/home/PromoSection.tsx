import React from "react";
import { Clipboard, Dimensions, Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Copy, Crown, Gift } from "lucide-react-native";
import { Text } from "@/components/AppText";
import { showToast } from "@/app/utils/toast";
import { useSchedule } from "@/context/ScheduleContext";
import type { UserPromo } from "@/hooks/useUserPromos";
import { radius } from "@/src/ui/theme";
import { CardSlider } from "@/src/ui/CardSlider";
import { useHomeTheme } from "./homeTheme";

const CARD_WIDTH = Dimensions.get("window").width - 48; // same sizing PromoCarousel uses

function PromoCard({ promo, width }: { promo: UserPromo; width?: number }) {
  const { c, h } = useHomeTheme();
  const { setPendingPromo } = useSchedule();

  const label =
    promo.discountType === "PERCENTAGE"
      ? `${promo.discountValue}% off`
      : `₦${promo.discountValue.toLocaleString()} off`;

  const body = promo.description ?? `Enjoy ${label} on your next scheduled journey.`;

  const expiry = promo.expiresAt
    ? new Date(promo.expiresAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })
    : null;

  const copy = () => {
    Clipboard.setString(promo.code);
    setPendingPromo(promo.code); // same behaviour as the old "Claim Offer" button
    showToast.success(`Code "${promo.code}" copied - it will be applied at checkout`);
  };

  return (
    <LinearGradient
      colors={h.promoGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[s.promo, { borderColor: h.promoBorder, width }]}
    >
      {/* Swap for a 3D gift asset if you have one */}
      <Gift size={84} color={h.gold} strokeWidth={1.4} style={s.gift} />

      <View style={{ paddingRight: 84 }}>
        <Text style={{ color: h.gold, fontSize: 17, fontWeight: "800" }}>{label}</Text>
        <Text style={{ color: c.text, fontSize: 15, lineHeight: 21, marginTop: 4 }} numberOfLines={2}>
          {body}
        </Text>
        {expiry && (
          <Text style={{ color: c.textSecondary, fontSize: 12, marginTop: 4 }}>Ends {expiry}</Text>
        )}
      </View>

      <Pressable onPress={copy} style={[s.code, { borderColor: h.gold }]}>
        <Text style={{ color: c.textSecondary, fontSize: 14 }}>Use code</Text>
        <Text style={{ color: h.gold, fontSize: 16, fontWeight: "800", letterSpacing: 1 }}>{promo.code}</Text>
        <Copy size={18} color={c.text} />
      </Pressable>
    </LinearGradient>
  );
}

export function PromoSection({ promos }: { promos: UserPromo[] }) {
  const { c, h } = useHomeTheme();

  if (!promos.length) return null;
  if (promos.length === 1) return <PromoCard promo={promos[0]} />;

  return (
    <CardSlider
      data={promos}
      autoPlay
      autoPlayInterval={5000}
      activeDotColor={h.gold}
      inactiveDotColor={c.border}
      containerStyle={{ marginBottom: 4 }}
      renderItem={(promo: UserPromo) => <PromoCard promo={promo} width={CARD_WIDTH} />}
    />
  );
}

export function PremiumStrip() {
  const { c, h } = useHomeTheme();
  return (
    <View style={[s.strip, { backgroundColor: h.inner, borderColor: h.innerBorder }]}>
      <View style={[s.crown, { backgroundColor: h.goldTint }]}>
        <Crown size={22} color={h.gold} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: c.text, fontSize: 14.5, fontWeight: "700" }}>Premium Mobility Experience</Text>
        <Text style={{ color: c.textSecondary, fontSize: 12, marginTop: 3 }}>
          Professional drivers • Punctual service • Peace of mind
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  promo: { borderRadius: radius.xl, borderWidth: 1, padding: 18, overflow: "hidden", gap: 14 },
  gift: { position: "absolute", right: 14, top: 14, transform: [{ rotate: "10deg" }], opacity: 0.9 },
  code: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderWidth: 1.2,
    borderStyle: "dashed",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignSelf: "flex-start",
  },
  strip: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 18, borderWidth: 1, padding: 14 },
  crown: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
});
