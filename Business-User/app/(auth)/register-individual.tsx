import { AuthService } from "@/api/auth.service";
import { useRouter } from "expo-router";
import { Building, Eye, EyeOff, Lock, Mail, User } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from '../../components/AppText';
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "@/src/ui/PrimaryButton";
import { SocialButton } from "@/src/ui/SocialButtons";

export default function RegisterIndividualScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    setError("");
    if (!firstName || !lastName || !email || !password) {
      return setError("Please fill in all required fields.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (!agreeTerms) {
      return setError("Please agree to the Terms & Conditions.");
    }
    try {
      setIsLoading(true);
      const data = await AuthService.register({
        name: `${firstName} ${lastName}`,
        email,
        phone,
        password,
        role: "INDIVIDUAL",
      });
      router.push({
        pathname: "/(auth)/verify",
        params: { email: data.email },
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}></View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Who's creating the account?</Text>

            <View style={styles.tabContainer}>
              <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                <User size={16} color="#974C16" style={styles.tabIcon} />
                <Text style={styles.activeTabText}>Individual</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => router.replace("/(auth)/register-business")}
              >
                <Building size={16} color="#6B7280" style={styles.tabIcon} />
                <Text style={styles.inactiveTabText}>Business</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.form}>
            {/* First Name */}
            <Text style={styles.label}>First Name</Text>
            <View style={styles.inputContainer}>
              <User size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First Name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Last Name */}
            <Text style={styles.label}>Last Name</Text>
            <View style={styles.inputContainer}>
              <User size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last Name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Mail size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Phone */}
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneContainer}>
              <View style={styles.countryCode}>
                {/* Flag placeholder */}
                <View style={styles.flagPlaceholder} />
                <Text style={styles.countryCodeText}>+123</Text>
              </View>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                style={styles.phoneInput}
                keyboardType="phone-pad"
              />
            </View>

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry={!showPassword}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <Eye size={18} color="#9CA3AF" />
                ) : (
                  <EyeOff size={18} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Password"
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <Eye size={18} color="#9CA3AF" />
                ) : (
                  <EyeOff size={18} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={[styles.checkbox, agreeTerms && styles.checkboxActive]}
                onPress={() => setAgreeTerms(!agreeTerms)}
              />
              <Text style={styles.termsText}>
                Agree with{" "}
                <Text style={styles.linkText}>Terms & Condition</Text> and{" "}
                <Text style={styles.linkText}>Privacy policy</Text>
              </Text>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <PrimaryButton onPress={handleSignUp} title='SIGN UP' loading={isLoading} disabled={isLoading} />

            <View style={styles.dividerContainer}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.socialContainer}>
              <SocialButton type="google" />
              { Platform.OS === "ios" && <SocialButton type="apple" appType="user-app" role="INDIVIDUAL" /> }
            </View>

            <TouchableOpacity
              style={styles.footerLink}
              onPress={() => router.push("/(auth)/sign-in")}
            >
              <Text style={styles.footerText}>
                Already Have an account{" "}
                <Text style={styles.signInText}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollContent: { padding: 24, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3E2723",
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F9F6F0",
    borderRadius: 30,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 25,
  },
  activeTab: {
    backgroundColor: "#E4C77B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabIcon: { marginRight: 6 },
  activeTabText: { fontWeight: "600", color: "#3E2723" },
  inactiveTabText: { fontWeight: "500", color: "#6B7280" },
  form: { marginTop: 10 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: "#FFF",
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: "#111827" },
  phoneContainer: { flexDirection: "row", height: 48 },
  countryCode: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
    backgroundColor: "#FFF",
  },
  flagPlaceholder: {
    width: 20,
    height: 14,
    backgroundColor: "#22C55E",
    marginRight: 8,
  },
  countryCodeText: { fontSize: 14, color: "#374151" },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFF",
    fontSize: 14,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 24,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    marginRight: 10,
  },
  termsText: { fontSize: 12, color: "#6B7280", flex: 1 },
  linkText: { color: "#974C16", textDecorationLine: "underline" },
  submitBtn: {
    backgroundColor: "#E4C77B",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitBtnText: { color: "#3E2723", fontWeight: "bold", fontSize: 16 },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  line: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  dividerText: { marginHorizontal: 15, color: "#6B7280", fontSize: 12 },
  socialContainer: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 10,
    marginBottom: 30,
  },
  socialBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  footerLink: { alignItems: "center" },
  footerText: { color: "#4B5563", fontSize: 14, fontWeight: "500" },
  signInText: { color: "#D97706", fontWeight: "bold" },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginBottom: 10,
    textAlign: "center",
  },
  checkboxActive: { backgroundColor: "#E4C77B", borderColor: "#E4C77B" },
});
