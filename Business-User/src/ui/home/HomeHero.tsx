import React from "react";
import { Image, StyleSheet, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Crown, ShieldCheck, Star } from "lucide-react-native";
import { Text } from "@/components/AppText";
import { spacing } from "@/src/ui/theme";
import { useHomeTheme } from "./homeTheme";

const HERO_LIGHT = require("../../../assets/images/home-hero-light.png");
const HERO_DARK = require("../../../assets/images/home-hero-dark.png");
const ASPECT = 100 / 100; // source image width / height

const TRUST = [
  { label: "Safe", Icon: ShieldCheck },
  { label: "Reliable", Icon: Star },
  { label: "Premium", Icon: Crown },
];

type Props = { firstName: string; header: React.ReactNode }; 

export function HomeHero({ firstName, header }: Props) {
  const { width } = useWindowDimensions();
  const { isDark, c, h } = useHomeTheme();

  const imgH = width / ASPECT;
  const fade = c.background;
  const clear = `${c.background}00`; // same colour, fully transparent (avoids grey banding)
  const headingSize = Math.min(42, Math.round(width * 0.095));

  return (
    <View style={{ minHeight: width * 0.10, paddingHorizontal: spacing.lg }}>
      {/* Car image, bottom-right, faded into the page background on 3 sides */}
      <View pointerEvents="none" style={{ position: "absolute", right: 0, bottom: 0, width, top: 25, height: '110%' }}>
        <Image
          source={isDark ? HERO_DARK : HERO_LIGHT}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <LinearGradient
          colors={[fade, clear]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0.55, y: 0.5 }}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={[fade, clear]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0.75, y: 0.1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={[fade, clear]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.3 }}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={[clear, fade]}
          start={{ x: 0.5, y: 0.72 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={[clear, fade]}
          start={{ x: 0.5, y: 0.72 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <View style={{ paddingBottom: 56 }}>
        {header}

        <Text style={[s.hello, { color: c.text }]}>Hello, {firstName} 👋</Text>
        <Text style={[s.sub, { color: c.textSecondary }]}>Plan Your Next Journey</Text>

        <Text style={[s.h1, { color: c.text, fontSize: headingSize, lineHeight: headingSize * 1.1 }]}>
          What are you{"\n"}
          <Text style={{ color: isDark ? c.text : h.gold }}>planning </Text>
          <Text style={{ color: h.gold }}>today?</Text>
        </Text>

        <Text style={[s.lead, { color: c.text }]}>Schedule your movement. Travel with ease.</Text>

        <View style={s.trust}>
          {TRUST.map(({ label, Icon }) => (
            <View key={label} style={s.trustRow}>
              <Icon size={20} color={h.gold} />
              <Text style={{ color: c.text, fontSize: 14, fontWeight: "500" }}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  hello: { marginTop: 22, fontSize: 18, fontWeight: "700" },
  sub: { marginTop: 2, fontSize: 15 },
  h1: { marginTop: 22, fontWeight: "800", letterSpacing: -0.8 },
  lead: { marginTop: 12, fontSize: 15, maxWidth: 300 },
  trust: { marginTop: 26, gap: 14 },
  trustRow: { flexDirection: "row", alignItems: "center", gap: 10 },
});
