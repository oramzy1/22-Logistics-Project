// import React, { useEffect, useRef, useState } from 'react';
// import {
//   Animated, Clipboard, Dimensions, StyleSheet, TouchableOpacity, View,
// } from 'react-native';
// import { Text } from '../../components/AppText';
// import { useRouter } from 'expo-router';
// import { useSchedule } from '@/context/ScheduleContext';
// import { UserPromo } from '@/hooks/useUserPromos';
// import { useAppTheme } from './useAppTheme';
// import { showToast } from '../../app/utils/toast';

// const { width } = Dimensions.get('window');
// const CARD_WIDTH = width - 48; // matches screen horizontal padding
// const INTERVAL = 4000;

// // Palette cycles per slide - rich, non-generic
// const GRADIENTS = [
//   { bg: '#0B1B2B', accent: '#E4C77B', sub: 'rgba(228,199,123,0.15)' },
//   { bg: '#1a1a2e', accent: '#e94560', sub: 'rgba(233,69,96,0.15)'  },
//   { bg: '#0d3b2e', accent: '#4ade80', sub: 'rgba(74,222,128,0.15)' },
//   { bg: '#1e1b4b', accent: '#818cf8', sub: 'rgba(129,140,248,0.15)' },
//   { bg: '#431407', accent: '#fb923c', sub: 'rgba(251,146,60,0.15)'  },
// ];

// interface Props {
//   promos: UserPromo[];
//   onApply: (code: string) => void; // pre-fills schedule tab promo input
// }

// export function PromoCarousel({ promos, onApply }: Props) {
//   const [index, setIndex] = useState(0);
//   const fadeAnim = useRef(new Animated.Value(1)).current;
//   const dotAnims = useRef(promos.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const router = useRouter();
//   const { setSelectedPackage } = useSchedule();

//   const transitionTo = (next: number) => {
//     Animated.timing(fadeAnim, {
//       toValue: 0, duration: 300, useNativeDriver: true,
//     }).start(() => {
//       setIndex(next);
//       // animate dots
//       dotAnims.forEach((a, i) => {
//         Animated.timing(a, {
//           toValue: i === next ? 1 : 0, duration: 250, useNativeDriver: false,
//         }).start();
//       });
//       Animated.timing(fadeAnim, {
//         toValue: 1, duration: 350, useNativeDriver: true,
//       }).start();
//     });
//   };

//   useEffect(() => {
//     if (promos.length <= 1) return;
//     timerRef.current = setInterval(() => {
//       setIndex(prev => {
//         const next = (prev + 1) % promos.length;
//         transitionTo(next);
//         return prev; // state update happens inside transitionTo via setIndex
//       });
//     }, INTERVAL);
//     return () => { if (timerRef.current) clearInterval(timerRef.current); };
//   }, [promos.length]);

//   if (!promos.length) return null;

//   const promo = promos[index];
//   const palette = GRADIENTS[index % GRADIENTS.length];

//   const discountLabel =
//     promo.discountType === 'PERCENTAGE'
//       ? `${promo.discountValue}% OFF`
//       : `₦${promo.discountValue.toLocaleString()} OFF`;

//   const expiry = promo.expiresAt
//     ? `Expires ${new Date(promo.expiresAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}`
//     : 'No expiry';

//   const handleClaim = () => {
//     // Copy code to clipboard
//     Clipboard.setString(promo.code);
//     showToast.success(`Code "${promo.code}" copied! Apply it at checkout.`);
//     // Pre-fill and navigate to schedule
//     onApply(promo.code);
//     router.push('/(tabs)/schedule');
//   };

//   return (
//     <View style={styles.wrapper}>
//       <Animated.View
//         style={[styles.card, { backgroundColor: palette.bg, opacity: fadeAnim }]}
//         pointerEvents="box-none"
//       >
//         {/* Decorative circle */}
//         <View style={[styles.circle, { backgroundColor: palette.sub }]} />
//         <View style={[styles.circleSmall, { backgroundColor: palette.sub }]} />

//         <View style={styles.body}>
//           {/* Discount badge */}
//           <View style={[styles.badge, { backgroundColor: palette.accent + '22', borderColor: palette.accent + '55' }]}>
//             <Text style={[styles.badgeText, { color: palette.accent }]}>{discountLabel}</Text>
//           </View>

//           <Text style={styles.title} numberOfLines={2}>
//             {promo.description ?? 'Special offer just for you'}
//           </Text>

//           <Text style={[styles.expiry, { color: palette.accent + 'aa' }]}>{expiry}</Text>

//           <View style={styles.footer}>
//             <View style={styles.codeBox}>
//               <Text style={[styles.codeLabel, { color: palette.accent + '88' }]}>CODE</Text>
//               <Text style={[styles.code, { color: palette.accent }]}>{promo.code}</Text>
//             </View>
//             <TouchableOpacity
//               style={[styles.claimBtn, { backgroundColor: palette.accent }]}
//               onPress={handleClaim}
//               activeOpacity={0.82}
//             >
//               <Text style={styles.claimText}>Claim Offer</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Animated.View>

//       {/* Dots - only show when multiple promos */}
//       {promos.length > 1 && (
//         <View style={styles.dots}>
//           {promos.map((_, i) => {
//             const dotW = dotAnims[i].interpolate({
//               inputRange: [0, 1], outputRange: [6, 18],
//             });
//             const dotOpacity = dotAnims[i].interpolate({
//               inputRange: [0, 1], outputRange: [0.35, 1],
//             });
//             return (
//               <Animated.View
//                 key={i}
//                 style={[styles.dot, { width: dotW, opacity: dotOpacity, backgroundColor: GRADIENTS[i % GRADIENTS.length].accent }]}
//               />
//             );
//           })}
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: { marginTop: 8 },
//   card: {
//     width: CARD_WIDTH,
//     borderRadius: 20,
//     padding: 22,
//     overflow: 'hidden',
//     minHeight: 170,
//   },
//   // Decorative background shapes
//   circle: {
//     position: 'absolute', width: 180, height: 180,
//     borderRadius: 90, top: -60, right: -50,
//   },
//   circleSmall: {
//     position: 'absolute', width: 80, height: 80,
//     borderRadius: 40, bottom: -20, left: 30,
//   },
//   body: { zIndex: 1 },
//   badge: {
//     alignSelf: 'flex-start',
//     borderWidth: 1,
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     marginBottom: 10,
//   },
//   badgeText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
//   title: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '700',
//     lineHeight: 22,
//     marginBottom: 6,
//     maxWidth: '85%',
//   },
//   expiry: { fontSize: 11, marginBottom: 16 },
//   footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
//   codeBox: { gap: 2 },
//   codeLabel: { fontSize: 9, fontWeight: '600', letterSpacing: 1 },
//   code: { fontSize: 16, fontWeight: '800', letterSpacing: 3 },
//   claimBtn: {
//     paddingHorizontal: 18, paddingVertical: 10,
//     borderRadius: 12,
//   },
//   claimText: { color: '#000', fontWeight: '800', fontSize: 12 },
//   dots: {
//     flexDirection: 'row', justifyContent: 'center',
//     alignItems: 'center', marginTop: 12, gap: 5,
//   },
//   dot: { height: 5, borderRadius: 3 },
// });

import React from "react";
import {
  Clipboard,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "../../components/AppText";
import { useRouter } from "expo-router";
import { useSchedule } from "@/context/ScheduleContext";
import { UserPromo } from "@/hooks/useUserPromos";
import { showToast } from "../../app/utils/toast";
import { CardSlider } from "./CardSlider";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 48;

// Curated vehicle images - each gives a distinct mood
const VEHICLE_IMAGES = [
  {
    uri: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
  }, // luxury sedan interior
  {
    uri: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
  }, // BMW on road
  {
    uri: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80",
  }, // dark SUV
  {
    uri: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
  }, // clean car side
  {
    uri: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
  }, // dashboard glow
];

// Overlay tints - semi-transparent so image texture shows through
const OVERLAYS = [
  "rgba(11,27,43,0.72)", // navy
  "rgba(30,27,75,0.72)", // indigo
  "rgba(13,59,46,0.72)", // forest
  "rgba(67,20,7,0.72)", // burnt orange
  "rgba(20,20,30,0.75)", // near-black
];

const ACCENT_COLORS = ["#E4C77B", "#818cf8", "#4ade80", "#fb923c", "#e94560"];

interface Props {
  promos: UserPromo[];
}

function PromoCard({
  promo,
  index,
  onClaim,
}: {
  promo: UserPromo;
  index: number;
  onClaim: (code: string) => void;
}) {
  const imageSource = VEHICLE_IMAGES[index % VEHICLE_IMAGES.length];
  const overlayColor = OVERLAYS[index % OVERLAYS.length];
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];

  const discountLabel =
    promo.discountType === "PERCENTAGE"
      ? `${promo.discountValue}% OFF`
      : `₦${promo.discountValue.toLocaleString()} OFF`;

  const expiry = promo.expiresAt
    ? new Date(promo.expiresAt).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <ImageBackground
      source={imageSource}
      style={[styles.card, { width: CARD_WIDTH }]}
      imageStyle={styles.cardImage}
      resizeMode="cover"
    >
      {/* Gradient-style overlay */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          styles.overlay,
          { backgroundColor: overlayColor },
        ]}
      />

      {/* Decorative circle */}
      {/* <View style={[styles.decorCircle, { borderColor: accent + '30' }]} /> */}

      <View style={styles.cardBody}>
        {/* Top row: badge + expiry */}
        <View style={styles.topRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: accent + "25", borderColor: accent + "60" },
            ]}
          >
            <Text style={[styles.badgeText, { color: accent }]}>
              {discountLabel}
            </Text>
          </View>
          {expiry && (
            <Text style={[styles.expiryText, { color: accent + "bb" }]}>
              Ends {expiry}
            </Text>
          )}
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {promo.description ?? "Exclusive offer just for you"}
        </Text>

        {/* Bottom row: code + CTA */}
        <View style={styles.bottomRow}>
          <View style={styles.codeBlock}>
            <Text style={[styles.codeLabel, { color: accent + "99" }]}>
              PROMO CODE
            </Text>
            <Text style={[styles.codeValue, { color: accent }]}>
              {promo.code}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.claimBtn, { backgroundColor: accent }]}
            onPress={() => onClaim(promo.code)}
            activeOpacity={0.8}
          >
            <Text style={styles.claimText}>Claim Offer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

export function PromoCarousel({ promos }: Props) {
  const router = useRouter();
  const { setPendingPromo, setSelectedPackage } = useSchedule();

  const handleClaim = (code: string) => {
    Clipboard.setString(code);
    showToast.success(`Code "${code}" copied - apply it at checkout!`);
    setPendingPromo(code);
    setSelectedPackage("3h");
    router.push("/(tabs)/schedule");
  };

  if (!promos.length) return null;

  // Single promo - no slider chrome needed, just the card
  if (promos.length === 1) {
    return (
      <View style={styles.singleWrapper}>
        <PromoCard promo={promos[0]} index={0} onClaim={handleClaim} />
      </View>
    );
  }

  return (
    <CardSlider
      data={promos}
      autoPlay
      autoPlayInterval={4000}
      activeDotColor="#E4C77B"
      inactiveDotColor="rgba(255,255,255,0.3)"
      containerStyle={styles.sliderWrapper}
      renderItem={(promo, index) => (
        <PromoCard promo={promo} index={index} onClaim={handleClaim} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  singleWrapper: { paddingHorizontal: 0 },
  sliderWrapper: { marginBottom: 4 },
  card: {
    height: 178,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  cardImage: { borderRadius: 20 },
  overlay: { borderRadius: 20, opacity: 0.75 },
  decorCircle: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 40,
    top: -50,
    right: -40,
  },
  cardBody: {
    padding: 18,
    gap: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.4 },
  expiryText: { fontSize: 10, fontWeight: "500" },
  description: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  codeBlock: { gap: 1 },
  codeLabel: { fontSize: 8, fontWeight: "700", letterSpacing: 1.2 },
  codeValue: { fontSize: 15, fontWeight: "800", letterSpacing: 2.5 },
  claimBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  claimText: { color: "#000", fontWeight: "800", fontSize: 11 },
});
