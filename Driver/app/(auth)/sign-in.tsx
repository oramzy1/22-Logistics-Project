import { AuthService } from "@/api/auth.service";
import { useAuth } from "@/context/AuthContext";
import { PrimaryButton } from "@/src/ui/PrimaryButton";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/AppText";
import { showToast } from "../utils/toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SocialButton } from "@/src/ui/SocialButtons";

export default function SignInScreen() {
  const router = useRouter();
  const { setAuthData, refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Animation values for error state
  const emailShake = useSharedValue(0);
  const passwordShake = useSharedValue(0);

  const emailErrorColor = useSharedValue(0);
  const passwordErrorColor = useSharedValue(0);

  const hasLaunched = AsyncStorage.getItem("hasLaunched");


  const triggerError = (field: "email" | "password") => {
    const shake = field === "email" ? emailShake : passwordShake;
    const color = field === "email" ? emailErrorColor : passwordErrorColor;

    shake.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withRepeat(withTiming(10, { duration: 100 }), 3, true),
      withTiming(0, { duration: 50 }),
    );

    color.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(1, { duration: 2000 }),
      withTiming(0, { duration: 500 }),
    );
  };

  const handleSignIn = async () => {
    setError("");
    if (!email || !password) {
      return setError("Please fill all fields");
    }
    try {
      setLoading(true);
      const data = await AuthService.login({ email, password, appType: 'driver-app' });
      await setAuthData(data.token, data.user);
      await refreshUser();
     if (!hasLaunched){
       await AsyncStorage.setItem("hasLaunched", "true");
     };
      showToast.success("Login Successful", "Welcome back!");
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 1000);
    } catch (err: any) {
      const message = err?.response?.data?.message;
      console.error("Login error response:", err?.response);
      if (message === "Please verify your email first.") {
        showToast.error(
          "Login Failed",
          message || "Please verify your email first.",
        );
        router.push({ pathname: "/(auth)/verify", params: { email } });
      } else {
        if (message === "User not found") {
          triggerError("email");
          setEmailError("User not found");
          setTimeout(() => setEmailError(""), 3000);
        } else if (message === "Invalid credentials") {
          triggerError("password");
          setPasswordError("Incorrect password");
          setTimeout(() => setPasswordError(""), 3000);
        } else if (message?.toLowerCase().includes("email")) {
          triggerError("email");
        } else {
          triggerError("password");
        }
        setError(message || "Invalid email or password");
        console.error("Login error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const emailAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: emailShake.value }],
    borderColor: interpolateColor(
      emailErrorColor.value,
      [0, 1],
      ["#E5E7EB", "#EF4444"],
    ),
  }));

  const passwordAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: passwordShake.value }],
    borderColor: interpolateColor(
      passwordErrorColor.value,
      [0, 1],
      ["#E5E7EB", "#EF4444"],
    ),
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}></View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Enter your details to continue your car rental journey.
          </Text>

          <Text style={styles.label}>Email</Text>
          <Animated.View style={[styles.inputContainer, emailAnimatedStyle]}>
            <Mail size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            {emailError && (
              <Text
                style={{
                  fontSize: 12,
                  color: "#EF4444",
                  fontStyle: "italic",
                  textAlign: "right",
                }}
              >
                {emailError}
              </Text>
            )}
          </Animated.View>

          <Text style={styles.label}>Password</Text>
          <Animated.View style={[styles.inputContainer, passwordAnimatedStyle]}>
            <Lock size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry={!showPassword}
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
            />
            {passwordError ? (
              <Text
                style={{
                  fontSize: 12,
                  color: "#EF4444",
                  fontStyle: "italic",
                  textAlign: "right",
                }}
              >
                {passwordError}
              </Text>
            ) : (
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <Eye size={18} color="#9CA3AF" />
                ) : (
                  <EyeOff size={18} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            )}
          </Animated.View>

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => router.push("/(auth)/reset-password")}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <PrimaryButton
            onPress={handleSignIn}
            title="SIGN IN"
            loading={loading}
            disabled={loading}
            marginTop
          />

          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.line} />
          </View>

         <SocialButton type="google" appType="driver-app" />
         <SocialButton type="apple" appType="driver-app" />

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => router.push("/(auth)/register")}
          >
            <Text style={styles.footerText}>
              Don't Have an account{" "}
              <Text style={styles.signUpText}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  headerBar: {
    height: 70,
    backgroundColor: "#0B1B2B",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  content: { flex: 1, padding: 24, paddingTop: 20 },
  title: { fontSize: 24, fontWeight: "700", color: "#111827", marginBottom: 8 },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 40,
  },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: "#FFF",
    marginBottom: 16,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: "#111827" },
  forgotBtn: { alignItems: "flex-end", marginBottom: 24 },
  forgotText: { color: "#5C3A21", fontWeight: "700", fontSize: 13 },
  submitBtn: {
    backgroundColor: "#E4C77B",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitBtnText: { color: "#3E2723", fontWeight: "bold", fontSize: 14 },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  line: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  dividerText: { marginHorizontal: 15, color: "#6B7280", fontSize: 12 },
  socialBtnList: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  socialBtnListText: { fontWeight: "600", color: "#374151", fontSize: 14 },
  footerLink: { alignItems: "center", marginBottom: 20 },
  footerText: { color: "#4B5563", fontSize: 14, fontWeight: "500" },
  signUpText: {
    color: "#5C3A21",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
