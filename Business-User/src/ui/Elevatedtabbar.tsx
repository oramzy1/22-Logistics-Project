import React from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Car } from "lucide-react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/AppText";
import { useHomeTheme } from "@/src/ui/home/homeTheme";

const RISE = 34; // how far the bump rises above the flat bar edge
const BAR_H = 60; // flat bar height (excluding safe-area inset)
const BTN = 60; // raised button diameter
const BTN_TOP = 8;
const HALF = 50; // half-width of the bump where it meets the flat edge
const CONTENT_H = 40; // icon (22) + gap (4) + label (14)

type Props = BottomTabBarProps & { centerRoute: string };

export function ElevatedTabBar({ state, descriptors, navigation, centerRoute }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { c, h } = useHomeTheme();

  const height = RISE + BAR_H + insets.bottom;
  const cx = width / 2;

  // Bar surface with a smooth dome around the centre button
  const edge =
    `M0 ${RISE} H${cx - HALF} ` +
    `C${cx - HALF + 26} ${RISE} ${cx - 26} 0 ${cx} 0 ` +
    `C${cx + 26} 0 ${cx + HALF - 26} ${RISE} ${cx + HALF} ${RISE} H${width}`;
  const fill = `${edge} V${height} H0 Z`;

  // expo-router marks hidden routes with href: null
  const routes = state.routes.filter((r) => (descriptors[r.key].options as any).href !== null);
  const activeKey = state.routes[state.index]?.key;

  const press = (route: (typeof routes)[number]) => () => {
    const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
    if (activeKey !== route.key && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };
  const longPress = (route: (typeof routes)[number]) => () =>
    navigation.emit({ type: "tabLongPress", target: route.key });

  const centerRouteObj = routes.find((r) => r.name === centerRoute);

  return (
    <View style={{ height, backgroundColor: c.background }}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Path d={fill} fill={c.background} />
        <Path d={edge} fill="none" stroke={h.cardBorder} strokeWidth={1} />
      </Svg>

      <View style={[s.row, { top: RISE, height: BAR_H + insets.bottom, paddingBottom: insets.bottom }]}>
        {routes.map((route) => {
          const { options } = descriptors[route.key];
          const focused = activeKey === route.key;
          const isCenter = route.name === centerRoute;
          const label =
            typeof options.tabBarLabel === "string" ? options.tabBarLabel : options.title ?? route.name;
          const inactive = isCenter ? c.text : c.muted;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              onPress={press(route)}
              onLongPress={longPress(route)}
              style={[s.item, isCenter && { justifyContent: "flex-end", paddingBottom: (BAR_H - CONTENT_H) / 2 }]}
            >
              {!isCenter &&
                options.tabBarIcon?.({ focused, color: focused ? h.gold : c.muted, size: 22 })}
              <Text
                style={[s.label, { color: focused ? h.gold : inactive }, focused && { fontWeight: "700" }]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {centerRouteObj && (
        <Pressable
          onPress={press(centerRouteObj)}
          accessibilityRole="button"
          accessibilityLabel="Schedule a ride"
          style={[
            s.btnShadow,
            { left: cx - BTN / 2, top: BTN_TOP, backgroundColor: h.goldGradient[0], shadowColor: h.gold },
          ]}
        >
          <LinearGradient colors={h.goldGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.btn}>
            <Car size={28} color={h.onGold} />
          </LinearGradient>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  row: { position: "absolute", left: 0, right: 0, flexDirection: "row" },
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4 },
  label: { fontSize: 12, lineHeight: 14, fontWeight: "500" },
  btnShadow: {
    position: "absolute",
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  btn: { flex: 1, borderRadius: BTN / 2, alignItems: "center", justifyContent: "center" },
});