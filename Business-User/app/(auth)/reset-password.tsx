// app/(auth)/reset-password.tsx — full replacement

import { AuthService } from "@/api/auth.service";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Lock, Eye, EyeOff, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView, Platform, StyleSheet,
  TextInput, TouchableOpacity, View, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/AppText";
import { PrimaryButton } from "@/src/ui/PrimaryButton";
import { showToast } from "../utils/toast";
import {
  PasswordStrengthIndicator,
  isPasswordValid,
} from "@/src/ui/PasswordStrengthIndicator";

type Step = "email" | "code" | "newPassword" | "done";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email: prefillEmail } = useLocalSearchParams<{ email?: string }>();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(prefillEmail ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 — request reset code
  const handleRequestCode = async () => {
    setError("");
    if (!email.trim()) return setError("Please enter your email address.");
    setIsLoading(true);
    try {
      await AuthService.forgotPassword(email.trim().toLowerCase());
      setStep("code");
      showToast.success("Code sent", "Check your email for the reset code.");
    } catch (err: any) {
      // Always show success to avoid email enumeration
      setStep("code");
      showToast.success("Code sent", "If that email exists, a code was sent.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 — just advance to password entry (code verified on submit)
  const handleCodeContinue = () => {
    setError("");
    if (code.trim().length !== 6) return setError("Please enter the 6-digit code.");
    setStep("newPassword");
  };

  // Step 3 — submit new password
  const handleResetPassword = async () => {
    setError("");
    if (!isPasswordValid(password)) {
      return setError("Password does not meet all requirements.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    setIsLoading(true);
    try {
      await AuthService.resetPassword(email.trim().toLowerCase(), code.trim(), password);
      setStep("done");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Reset failed. The code may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* STEP 1 — Email */}
          {step === "email" && (
            <>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Enter the email address associated with your account and we'll send you a reset code.
              </Text>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Mail size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus
                />
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <PrimaryButton
                title="Send Reset Code"
                onPress={handleRequestCode}
                loading={isLoading}
                disabled={isLoading}
                marginTop
              />
              <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Text style={styles.backText}>Back to Sign In</Text>
              </TouchableOpacity>
            </>
          )}

          {/* STEP 2 — Enter code */}
          {step === "code" && (
            <>
              <Text style={styles.title}>Enter Reset Code</Text>
              <Text style={styles.subtitle}>
                We sent a 6-digit code to{" "}
                <Text style={{ fontWeight: "700", color: "#111827" }}>{email}</Text>.
                {"\n"}Check your inbox (and spam folder).
              </Text>
              <Text style={styles.label}>6-Digit Code</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { letterSpacing: 6, fontSize: 18, fontWeight: "700" }]}
                  value={code}
                  onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 6))}
                  placeholder="------"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <PrimaryButton
                title="Continue"
                onPress={handleCodeContinue}
                marginTop
              />
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => { setStep("email"); setCode(""); setError(""); }}
              >
                <Text style={styles.backText}>Wrong email? Go back</Text>
              </TouchableOpacity>
            </>
          )}

          {/* STEP 3 — New password */}
          {step === "newPassword" && (
            <>
              <Text style={styles.title}>Set New Password</Text>
              <Text style={styles.subtitle}>
                Create a strong password for your account.
              </Text>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputContainer}>
                <Lock size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="New password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  onFocus={() => setPwFocused(true)}
                  onBlur={() => setPwFocused(false)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <Eye size={18} color="#9CA3AF" /> : <EyeOff size={18} color="#9CA3AF" />}
                </TouchableOpacity>
              </View>

              {/* Strength indicator — in-flow, shifts content down gracefully */}
              <PasswordStrengthIndicator
                password={password}
                visible={pwFocused && password.length > 0}
              />

              <Text style={[styles.label, { marginTop: 16 }]}>Confirm New Password</Text>
              <View style={[
                styles.inputContainer,
                confirmPassword.length > 0 && password !== confirmPassword && styles.inputError
              ]}>
                <Lock size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <Eye size={18} color="#9CA3AF" /> : <EyeOff size={18} color="#9CA3AF" />}
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <Text style={styles.errorText}>Passwords do not match</Text>
              )}

              {error ? <Text style={[styles.errorText, { marginTop: 8 }]}>{error}</Text> : null}

              <PrimaryButton
                title="Reset Password"
                onPress={handleResetPassword}
                loading={isLoading}
                disabled={isLoading}
                marginTop
              />
            </>
          )}

          {/* STEP 4 — Success */}
          {step === "done" && (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Text style={{ fontSize: 40 }}>✓</Text>
              </View>
              <Text style={styles.title}>Password Reset!</Text>
              <Text style={styles.subtitle}>
                Your password has been updated successfully. You can now sign in with your new password.
              </Text>
              <PrimaryButton
                title="Sign In"
                onPress={() => router.replace("/(auth)/sign-in")}
                marginTop
              />
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  headerBar: { height: 70, backgroundColor: "#0B1B2B", borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  content: { padding: 24, paddingTop: 40, paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: "700", color: "#111827", marginBottom: 12 },
  subtitle: { fontSize: 14, color: "#6B7280", lineHeight: 22, marginBottom: 32 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 },
  inputContainer: {
    flexDirection: "row", alignItems: "center", borderWidth: 1,
    borderColor: "#E5E7EB", borderRadius: 8, paddingHorizontal: 12,
    height: 48, backgroundColor: "#FFF",
  },
  inputError: { borderColor: "#EF4444" },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: "#111827" },
  errorText: { color: "#EF4444", fontSize: 12, marginTop: 6 },
  backBtn: { alignItems: "center", marginTop: 20 },
  backText: { color: "#6B7280", fontSize: 13, textDecorationLine: "underline" },
  successContainer: { flex: 1, alignItems: "center", paddingTop: 40 },
  successIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#F0FDF4", alignItems: "center",
    justifyContent: "center", marginBottom: 24,
  },
});