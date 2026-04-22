import { useAuth } from "@/context/AuthContext";
import { PrimaryButton } from "@/src/ui/PrimaryButton";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  Building,
  CheckCircle2,
  Circle,
  FileText,
  Mail,
  Map,
  Phone,
  UploadCloud,
  User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/AppText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "@/api/api";
import { showToast } from "@/app/utils/toast";
import { PhoneInput } from "@/src/ui/PhoneInput";

const STEPS = ["Company Info", "Admin Details", "Business Setup"];

export default function CompleteBusinessProfileScreen() {
  const router = useRouter();
  const { refreshUser, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [countryCode, setCountryCode] = useState("+234");
  const [countryCode1, setCountryCode1] = useState("+234");
  const [scheduleType, setScheduleType] = useState<"self" | "others">("others");
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [cacNumber, setCacNumber] = useState("");

  const progressPercent = useSharedValue(0);
  useEffect(() => {
    progressPercent.value = withTiming(currentStep / (STEPS.length - 1), {
      duration: 400,
      easing: Easing.inOut(Easing.ease),
    });
  }, [currentStep]);
  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressPercent.value * 100}%`,
  }));

  const handlePickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setLogoUri(result.assets[0].uri);
  };

  const handleNext = async () => {
    setError("");
    if (currentStep === 0) {
      if (!companyName || !companyEmail || !companyAddress || !companyPhone) {
        return setError("Please fill all company fields.");
      }
      return setCurrentStep(1);
    }
    if (currentStep === 1) {
      if (!department || !adminPhone) {
        return setError("Please fill all admin fields.");
      }
      return setCurrentStep(2);
    }
    const fullPhone = `${countryCode}${adminPhone.replace(/^0+/, "")}`;
    // Final step — submit
    if (!cacNumber) return setError("Please enter your CAC number.");
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      formData.append("companyName", companyName);
      formData.append("companyEmail", companyEmail);
      formData.append("companyAddress", companyAddress);
      formData.append("companyPhone", companyPhone);
      formData.append("department", department);
      formData.append("adminPhone", fullPhone);
      formData.append("scheduleType", scheduleType);
      formData.append("cacNumber", cacNumber);

      if (logoUri) {
        const safeUri =
          Platform.OS === "ios" ? logoUri.replace("file://", "") : logoUri;
        formData.append("logo", {
          uri: safeUri,
          type: "image/jpeg",
          name: "logo.jpg",
        } as any);
      }

      await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/complete-business-profile`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      await refreshUser();
      showToast.success("Business profile complete! Welcome.");
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.headerBar} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={s.scrollContent}>
          <Text style={s.title}>
            {currentStep === 0 && "Tell us about your Business"}
            {currentStep === 1 && "Set Up your Admin account"}
            {currentStep === 2 && "Finalize your Business Account"}
          </Text>
          <Text style={s.subtitle}>
            Complete your business profile to access all features.
          </Text>

          {/* Progress bar */}
          <View style={s.progressContainer}>
            <View style={s.progressTrackContainer}>
              <View style={s.progressDottedLine} />
              <Animated.View
                style={[s.progressSolidLine, animatedProgressStyle]}
              />
            </View>
            <View style={s.progressNodesRow}>
              {STEPS.map((title, i) => (
                <View key={i} style={s.nodeWrapper}>
                  <View
                    style={[
                      s.nodeCircle,
                      i <= currentStep ? s.nodeActive : s.nodeInactive,
                    ]}
                  >
                    <CheckCircle2
                      size={16}
                      color={i <= currentStep ? "#10B981" : "#9CA3AF"}
                    />
                  </View>
                  <Text style={s.nodeText}>{title}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Step 0 — Company Info */}
          {currentStep === 0 && (
            <View>
              {[
                {
                  label: "Company Name",
                  value: companyName,
                  set: setCompanyName,
                  icon: Building,
                  placeholder: "Name",
                },
                {
                  label: "Company Email",
                  value: companyEmail,
                  set: setCompanyEmail,
                  icon: Mail,
                  placeholder: "Email",
                  kb: "email-address",
                },
                {
                  label: "Company Address",
                  value: companyAddress,
                  set: setCompanyAddress,
                  icon: Map,
                  placeholder: "Address",
                },
              ].map(
                ({ label, value, set, icon: Icon, placeholder, kb }: any) => (
                  <View key={label}>
                    <Text style={s.label}>{label}</Text>
                    <View style={s.inputContainer}>
                      <Icon size={18} color="#9CA3AF" style={s.inputIcon} />
                      <TextInput
                        style={s.input}
                        value={value}
                        onChangeText={set}
                        placeholder={placeholder}
                        placeholderTextColor="#9CA3AF"
                        keyboardType={kb ?? "default"}
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                ),
              )}
              <Text style={s.label}>Company Phone</Text>
              <PhoneInput
                value={companyPhone}
                onChangeText={setCompanyPhone}
                onCountryChange={setCountryCode1}
                placeholder="Phone number"
              />
              <Text style={s.phoneHint}>
                Full number:{" "}
                {companyPhone
                  ? `${countryCode1}${companyPhone.replace(/^0+/, "")}`
                  : "—"}
              </Text>
              {!!error && <Text style={s.errorText}>{error}</Text>}
              <TouchableOpacity style={s.btn} onPress={handleNext}>
                <Text style={s.btnText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 1 — Admin Details */}
          {currentStep === 1 && (
            <View>
              <Text style={s.label}>Admin Name</Text>
              <View style={[s.inputContainer, s.readonlyContainer]}>
                <User size={18} color="#9CA3AF" style={s.inputIcon} />
                <Text style={s.readonlyText}>{user?.name ?? "—"}</Text>
                <View style={s.prefillBadge}>
                  <Text style={s.prefillBadgeText}>From account</Text>
                </View>
              </View>
              <Text style={s.label}>Admin Email</Text>
              <View style={[s.inputContainer, s.readonlyContainer]}>
                <Mail size={18} color="#9CA3AF" style={s.inputIcon} />
                <Text style={s.readonlyText}>{user?.email ?? "—"}</Text>
                <View style={s.prefillBadge}>
                  <Text style={s.prefillBadgeText}>From account</Text>
                </View>
              </View>
              <Text style={s.label}>Department</Text>
              <View style={s.inputContainer}>
                <Building size={18} color="#9CA3AF" style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  value={department}
                  onChangeText={setDepartment}
                  placeholder="Department"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <Text style={s.label}>Admin Phone Number</Text>
              <PhoneInput
                value={adminPhone}
                onChangeText={setAdminPhone}
                onCountryChange={setCountryCode}
                placeholder="Phone number"
              />
              <Text style={s.phoneHint}>
                Full number:{" "}
                {adminPhone
                  ? `${countryCode}${adminPhone.replace(/^0+/, "")}`
                  : "—"}
              </Text>
              {[
                { label: "Schedule for self only", value: "self" },
                { label: "Schedule for others", value: "others" },
              ].map(({ label, value }) => (
                <TouchableOpacity
                  key={value}
                  style={s.radioRow}
                  onPress={() => setScheduleType(value as any)}
                >
                  <Text style={s.radioText}>{label}</Text>
                  {scheduleType === value ? (
                    <CheckCircle2 size={20} color="#111827" />
                  ) : (
                    <Circle size={20} color="#D1D5DB" />
                  )}
                </TouchableOpacity>
              ))}
              {!!error && <Text style={s.errorText}>{error}</Text>}
              <View style={s.rowButtons}>
                <TouchableOpacity
                  style={s.outlineBtn}
                  onPress={() => setCurrentStep(0)}
                >
                  <Text style={s.outlineBtnText}>Previous</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.btn} onPress={handleNext}>
                  <Text style={s.btnText}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 2 — Business Setup */}
          {currentStep === 2 && (
            <View>
              <Text style={s.labelLg}>Upload Company Logo</Text>
              <Text style={s.sublabel}>
                Optional — personalizes your account
              </Text>
              <TouchableOpacity style={s.uploadArea} onPress={handlePickLogo}>
                {logoUri ? (
                  <Image
                    source={{ uri: logoUri }}
                    style={{ width: 100, height: 100, borderRadius: 8 }}
                  />
                ) : (
                  <>
                    <UploadCloud
                      size={30}
                      color="#6B7280"
                      style={{ marginBottom: 8 }}
                    />
                    <Text style={s.uploadText}>Click to upload</Text>
                  </>
                )}
              </TouchableOpacity>
              <Text style={s.labelLg}>CAC Registration Number</Text>
              <View style={s.inputContainer}>
                <FileText size={18} color="#9CA3AF" style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  value={cacNumber}
                  onChangeText={setCacNumber}
                  placeholder="CAC Number"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              {!!error && <Text style={s.errorText}>{error}</Text>}
              <View style={s.rowButtons}>
                <TouchableOpacity
                  style={s.outlineBtn}
                  onPress={() => setCurrentStep(1)}
                >
                  <Text style={s.outlineBtnText}>Previous</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.btn, isLoading && { opacity: 0.7 }]}
                  onPress={handleNext}
                  disabled={isLoading}
                >
                  <Text style={s.btnText}>
                    {isLoading ? "Saving..." : "Complete"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  headerBar: {
    height: 70,
    backgroundColor: "#0B1B2B",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  scrollContent: { padding: 24, paddingBottom: 48 },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3E2723",
    marginBottom: 6,
    marginTop: 16,
    lineHeight: 28,
  },
  subtitle: { fontSize: 13, color: "#6B7280", marginBottom: 24 },
  progressContainer: { marginVertical: 20, position: "relative", height: 60 },
  progressTrackContainer: {
    position: "absolute",
    top: 12,
    left: "12%",
    right: "12%",
    height: 2,
  },
  progressDottedLine: {
    borderStyle: "dotted",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    width: "100%",
    position: "absolute",
    top: 0,
  },
  progressSolidLine: {
    height: 2,
    backgroundColor: "#10B981",
    position: "absolute",
    top: 0,
    left: 0,
  },
  progressNodesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  nodeWrapper: { alignItems: "center", width: "33%" },
  nodeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  nodeActive: { backgroundColor: "#ECFDF5" },
  nodeInactive: { backgroundColor: "#F3F4F6" },
  nodeText: {
    fontSize: 9,
    color: "#374151",
    textAlign: "center",
    fontWeight: "500",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
  },
  labelLg: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    marginTop: 16,
  },
  sublabel: { fontSize: 12, color: "#6B7280", marginBottom: 12 },
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
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#FFF",
    marginTop: 12,
  },
  radioText: { fontSize: 14, color: "#111827", fontWeight: "500" },
  uploadArea: {
    width: "100%",
    height: 140,
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#93C5FD",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  uploadText: { color: "#374151", fontSize: 14, fontWeight: "500" },
  btn: {
    flex: 1,
    backgroundColor: "#E4C77B",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#3E2723", fontWeight: "700", fontSize: 15 },
  rowButtons: { flexDirection: "row", gap: 12, marginTop: 32 },
  outlineBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4C77B",
    alignItems: "center",
  },
  outlineBtnText: { color: "#3E2723", fontWeight: "700", fontSize: 15 },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  readonlyContainer: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  readonlyText: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
  },
  prefillBadge: {
    backgroundColor: "#EFF6FF",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  prefillBadgeText: {
    fontSize: 10,
    color: "#3B82F6",
    fontWeight: "600",
  },
  phoneHint: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 5,
    marginLeft: 2,
  },
});
