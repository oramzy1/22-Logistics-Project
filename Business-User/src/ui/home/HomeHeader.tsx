import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Bell } from "lucide-react-native";
import { Text } from "@/components/AppText";
import { useHomeTheme } from "./homeTheme";
import { useAuth } from "@/context/AuthContext";

type Props = {
  name: string;
  avatarUrl?: string | null;
  unread: number;
  onBellPress: () => void;
  onAvatarPress: () => void;
};

const LOGO_LIGHT = require("../../../assets/images/22logo-light.png");
const LOGO_DARK = require("../../../assets/images/22logo-Dark.png");

export function HomeHeader({ name, unread, onBellPress, onAvatarPress }: Props) {
  const { c, h, isDark } = useHomeTheme();
    const { user, isBusiness } = useAuth();
     const avatarUri = isBusiness
      ? user?.businessProfile?.logoUrl ?? null
      : user?.avatarUrl ?? null;

  return (
    <View style={s.row}>
             <Image
          source={isDark ? LOGO_DARK : LOGO_LIGHT}
          style={{height: 40, width: 160}}
          resizeMode="contain"
        />

      <View style={s.right}>
        <Pressable onPress={onBellPress} hitSlop={12}>
          <Bell size={24} color={c.text} />
          {unread > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>{unread > 9 ? "9+" : unread}</Text>
            </View>
          )}
        </Pressable>

        <Pressable onPress={onAvatarPress} hitSlop={8}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={s.avatar} />
          ) : (
            <View style={[s.avatar, s.avatarFallback, { backgroundColor: h.goldTint }]}>
              <Text style={{ color: h.gold, fontWeight: "800", fontSize: 18 }}>
                {name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  mark: { fontSize: 34, fontWeight: "900", letterSpacing: -1.5, lineHeight: 36 },
  markSub: { fontSize: 8, fontWeight: "600", letterSpacing: 3.2 },
  right: { flexDirection: "row", alignItems: "center", gap: 18 },
  badge: {
    position: "absolute",
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  avatar: { width: 40, height: 40, borderRadius: 24 },
  avatarFallback: { alignItems: "center", justifyContent: "center" },
});
