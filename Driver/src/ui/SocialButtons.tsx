import React from "react";
import { TouchableOpacity, Text, StyleSheet, View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useOAuth } from "@/hooks/useAuth";

type Props = {
  type: "google" | "apple";
  title?: string;
  appType?: 'user-app' | 'driver-app',
  role?: 'INDIVIDUAL' | 'DRIVER' | 'BUSINESS',
  onPress?: () => void;
};

export const SocialButton = ({ type, title, onPress, appType = 'user-app', role }: Props) => {
   const { signInWithGoogle, signInWithApple } = useOAuth({ appType, role });
  const isGoogle = type === 'google';

  const handlePress = onPress ?? (isGoogle ? signInWithGoogle : signInWithApple);

  if (type === 'apple' && Platform.OS !== 'ios') return null;

  return (
    <TouchableOpacity
      style={[styles.button, isGoogle ? styles.googleBtn : styles.appleBtn]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {/* ICON */}
        {isGoogle ? (
          //   <Text style={styles.googleIcon}>G</Text>
          <Image style={{ width: 25, height: 25, borderRadius: 8 }}  source={require("../../assets/images/google logo.png")} />
        ) : (
          <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
        )}

        {/* TEXT */}
        <Text
          style={[styles.text, isGoogle ? styles.googleText : styles.appleText]}
        >
          {title || (isGoogle ? "Sign in with Google" : "Sign in with Apple")}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
  },

  // GOOGLE
  googleBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DADCE0",
  },
  googleText: {
    color: "#3C4043",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 10,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#EA4335", // Google red
  },

  // APPLE
  appleBtn: {
    backgroundColor: "#000000",
  },
  appleText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 10,
  },

  text: {
    letterSpacing: 0.2,
  },
});
