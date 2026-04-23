// src/ui/PasswordStrengthIndicator.tsx

import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  View,
} from "react-native";
import { Check, X } from "lucide-react-native";
import { Text } from "../../components/AppText";
import { useAppTheme } from "./useAppTheme";

export type PasswordCriteria = {
  label: string;
  met: boolean;
};

export function getPasswordCriteria(password: string): PasswordCriteria[] {
  return [
    {
      label: "Minimum 8 characters",
      met: password.length >= 8,
    },
    {
      label: "1 Uppercase character (A,B,C...)",
      met: /[A-Z]/.test(password),
    },
    {
      label: "1 Lowercase character (a,b,c...)",
      met: /[a-z]/.test(password),
    },
    {
      label: "1 Special character (@,&,$...)",
      met: /[@&$!#%^*?~`\-_+=<>]/.test(password),
    },
  ];
}

export function isPasswordValid(password: string): boolean {
  return getPasswordCriteria(password).every((c) => c.met);
}

type Props = {
  password: string;
  visible: boolean;
  backgroundColor?: string;
};

const CriteriaPill = ({ label, met }: PasswordCriteria) => {
  const { isDark } = useAppTheme();
  const animatedBorder = useRef(new Animated.Value(0)).current;
  const animatedBg = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedBorder, {
        toValue: met ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(animatedBg, {
        toValue: met ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  }, [met]);

  const borderColor = animatedBorder.interpolate({
    inputRange: [0, 1],
    outputRange: [isDark ? "#374151" : "#E5E7EB", "#16A34A"],
  });

  const backgroundColor = animatedBg.interpolate({
    inputRange: [0, 1],
    outputRange: [isDark ? "#1F2937" : "#F9FAFB", "#F0FDF4"],
  });

  return (
    <Animated.View
      style={[
        styles.pill,
        { borderColor, backgroundColor },
      ]}
    >
      {met ? (
        <Check size={11} color="#16A34A" style={{ marginRight: 4 }} />
      ) : (
        <X size={11} color={isDark ? "#6B7280" : "#9CA3AF"} style={{ marginRight: 4 }} />
      )}
      <Text
        style={[
          styles.pillText,
          { color: met ? "#16A34A" : isDark ? "#6B7280" : "#9CA3AF" },
        ]}
      >
        {label}
      </Text>
    </Animated.View>
  );
};

export function PasswordStrengthIndicator({ password, visible, backgroundColor='#FFF'}: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: visible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: visible ? 0 : -8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  const criteria = getPasswordCriteria(password);

  // Split into two columns
  const left = criteria.filter((_, i) => i % 2 === 0);
  const right = criteria.filter((_, i) => i % 2 !== 0);

  return (
    <Animated.View
      pointerEvents={visible ? "none" : "none"}
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
          backgroundColor,
        },
      ]}
    >
      <View style={styles.grid}>
        <View style={styles.column}>
          {left.map((c) => (
            <CriteriaPill key={c.label} {...c} />
          ))}
        </View>
        <View style={styles.column}>
          {right.map((c) => (
            <CriteriaPill key={c.label} {...c} />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Overlay — positioned absolutely by the parent wrapper
    position: "absolute",
    left: 0,
    right: 0,
    top: "100%",  
    zIndex: 100,
    paddingTop: 8,
  },
  grid: {
    flexDirection: "row",
    gap: 6,
  },
  column: {
    flex: 1,
    gap: 6,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "500",
    flexShrink: 1,
  },
});