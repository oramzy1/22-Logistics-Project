import { AuthService } from "@/api/auth.service";
import { PrimaryButton } from "@/src/ui/PrimaryButton";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  Building,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Mail,
  Map,
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
import { SocialButton } from "@/src/ui/SocialButtons";

const STEPS = [
  "Personal Info",
  "License Upload",
  "Password Set Up",
];

export default function RegisterDriverScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [scheduleType, setScheduleType] = useState<"self" | "others">("others");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [licenseUri, setLicenseUri] = useState<string | null>(null);

  // Step 1
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  // Step 2
  const [driverLicenseNumber, setDriverLicenseNumber] = useState("");
  // Step 3
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const hasLaunched = AsyncStorage.getItem("hasLaunched");


  // Progress Line Animation
  // Assuming 3 gaps, currentStep goes 0, 1, 2, 3
  const progressPercent = useSharedValue(0);

  useEffect(() => {
    progressPercent.value = withTiming(currentStep / (STEPS.length - 1), {
      duration: 400,
      easing: Easing.inOut(Easing.ease),
    });
  }, [currentStep]);

  const animatedProgressStyle = useAnimatedStyle(() => {
    return { width: `${progressPercent.value * 100}%` };
  });

  const handlePickLicense = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setLicenseUri(result.assets[0].uri);
    }
  };

  const handleNext = async () => {
    setError("");

    if (currentStep === 0) {
      if (!firstName || !lastName || !email || !phone) {
        setError("Please fill all personal information fields.");
        return;
      }
    }

    if (currentStep === 1) {
      if (!licenseUri || !driverLicenseNumber) {
        setError("Please fill all fields and submit license for full verification");
        return;
      }
    }


    // Move to next step if not final step
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
      return;
    }

    if (password !== confirmPassword)
      return setError("Passwords do not match.");
    if (!agreeTerms) return setError("Please agree to the Terms & Conditions.");

    try {
      setIsLoading(true);
      const name = `${firstName} ${lastName}`;

      const formData = new FormData();
      formData.append("role", "DRIVER");
      formData.append("password", password);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("licenseNumber", driverLicenseNumber);

     if (licenseUri) {
        const safeUri = Platform.OS === 'ios' ? licenseUri.replace('file://', '') : licenseUri;
        formData.append("logo", {
          uri: safeUri,
          type: "image/jpeg",
          name: "logo.jpg",
        } as any);
      }

      const data = await AuthService.registerDriver(formData);
       if (!hasLaunched){
       await AsyncStorage.setItem("hasLaunched", "true");
     };
      router.push({
        pathname: "/(auth)/verify",
        params: { email: data.email },
      });
    } catch (err: any) {
       console.error('Reg error:', JSON.stringify({
      status: err?.response?.status,
      data: err?.response?.data,
      message: err?.message,
    }));
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {/* The Track Line */}
      <View style={styles.progressTrackContainer}>
        <View style={styles.progressDottedLine} />
        {/* The Animated fill */}
        <Animated.View
          style={[styles.progressSolidLine, animatedProgressStyle]}
        />
      </View>

      {/* The Nodes */}
      <View style={styles.progressNodesRow}>
        {STEPS.map((title, index) => {
          const isCompleted = index <= currentStep;
          return (
            <View key={index} style={styles.nodeWrapper}>
              <View
                style={[
                  styles.nodeCircle,
                  isCompleted ? styles.nodeActive : styles.nodeInactive,
                ]}
              >
                <CheckCircle2
                  size={16}
                  color={isCompleted ? "#10B981" : "#9CA3AF"}
                />
              </View>
              <Text style={styles.nodeText}>{title}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}></View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {currentStep === 0 && "Tell us about yourself"}
              {currentStep === 1 && "Set Up your account"}
              {currentStep === 2 && "Set a secure password"}
            </Text>
          </View>

          {renderProgressBar()}

          <View style={styles.formContainer}>
            {/* --- STEP 1: USER DETAILS --- */}
            {currentStep === 0 && (
              <View>
                <Text style={styles.label}>First Name</Text>
                <View style={styles.inputContainer}>
                  <User size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    style={styles.input}
                    placeholder="First Name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <Text style={styles.label}>Last Name</Text>
                <View style={styles.inputContainer}>
                  <User size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    style={styles.input}
                    placeholder="Last Name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <Mail size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                  />
                </View>

                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.phoneContainer}>
                  <View style={styles.countryCode}>
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

                <Text style={styles.errorText}>{error}</Text>

                <TouchableOpacity
                  style={styles.submitBtnFull}
                  onPress={handleNext}
                >
                  <Text style={styles.submitBtnText}>Next</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* --- STEP 2: LICENSE UPLOAD --- */}
            {currentStep === 1 && (
              <View>
                <Text style={styles.labelLg}>Upload your Driver's License</Text>
                <Text style={styles.sublabel}>
                  22Logistics provides the vehicle - we just need your valid driver's license to get you on the road.
                </Text>

                <TouchableOpacity
                  style={styles.uploadArea}
                  onPress={handlePickLicense}
                >
                  {licenseUri ? (
                    <Image
                      source={{ uri: licenseUri }}
                      style={{ width: 100, height: 100, borderRadius: 8 }}
                    />
                  ) : (
                    <>
                      <UploadCloud
                        size={30}
                        color="#6B7280"
                        style={{ marginBottom: 10 }}
                      />
                      <Text style={styles.uploadText}>Upload from Gallery</Text>
                    </>
                  )}
                </TouchableOpacity>
                <Text style={styles.uploadInfo}>
                  Supported formats: JPG, PNG{"\n"}Max Size: 100KB
                </Text>

                <Text style={styles.labelLg}>Driver's License Number</Text>
                <View style={styles.inputContainer}>
                  <FileText
                    size={18}
                    color="#9CA3AF"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={driverLicenseNumber}
                    onChangeText={setDriverLicenseNumber}
                    style={styles.input}
                    placeholder="Driver's License Number"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <Text style={styles.errorText}>{error}</Text>

                <View style={styles.rowButtons}>
                  <TouchableOpacity
                    style={styles.outlineBtn}
                    onPress={handlePrev}
                  >
                    <Text style={styles.outlineBtnText}>Previous</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.filledBtn}
                    onPress={handleNext}
                  >
                    <Text style={styles.submitBtnText}>Next</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {/* --- STEP 3: SIGN UP SET UP --- */}
            {currentStep === 2 && (
              <View>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Lock size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Eye size={18} color="#9CA3AF" />
                    ) : (
                      <EyeOff size={18} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <Lock size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry={!showConfirmPassword}
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
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
                    style={[
                      styles.checkbox,
                      agreeTerms && styles.checkboxActive,
                    ]}
                    onPress={() => setAgreeTerms(!agreeTerms)}
                  >
                    {agreeTerms && <CheckCircle2 size={14} color="#FFF" />}
                  </TouchableOpacity>
                  <Text style={styles.termsText}>
                    Agree with{" "}
                    <Text style={styles.linkText}>Terms & Condition</Text>
                  </Text>
                </View>
                <View style={styles.dividerContainer}>
                  <View style={styles.line} />
                  <Text style={styles.dividerText}>Or continue with</Text>
                  <View style={styles.line} />
                </View>
                {/* <TouchableOpacity style={styles.socialBtnOutlined}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 16,
                      marginRight: 10,
                      color: "#EA4335",
                    }}
                  >
                    G
                  </Text>
                  <Text style={styles.socialBtnText}>SIGN IN with Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtnOutlined}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 18,
                      marginRight: 10,
                    }}
                  >
                    
                  </Text>
                  <Text style={styles.socialBtnText}>SIGN IN with Apple</Text>
                </TouchableOpacity> */}
                <SocialButton type="google" />
                <SocialButton type="apple" /> 
                  {currentStep === 2 && error ? (
                    <Text style={styles.errorText}>{error}</Text>
                  ) : null}
                <View style={[styles.rowButtons, { marginTop: 20 }]}>
                 {
                  !isLoading && (
                     <TouchableOpacity
                    style={styles.outlineBtn}
                    onPress={handlePrev}
                  >
                    <Text style={styles.outlineBtnText}>Previous</Text>
                  </TouchableOpacity>
                  )
                 }

                  <TouchableOpacity
                    style={styles.filledBtn}
                    onPress={handleNext}
                    disabled={isLoading}
                  >
                    <Text style={styles.submitBtnText}>
                      {isLoading ? "Creating Account..." : "Sign Up"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
    lineHeight: 28,
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

  // Progress Bar Styles
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
  nodeWrapper: { alignItems: "center", width: "25%" },
  nodeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  nodeActive: { backgroundColor: "#ECFDF5" }, // light green bg
  nodeInactive: { backgroundColor: "#F3F4F6" },
  nodeText: {
    fontSize: 9,
    color: "#374151",
    textAlign: "center",
    fontWeight: "500",
  },

  formContainer: { marginTop: 10 },
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
  sublabel: { fontSize: 12, color: "#6B7280", marginBottom: 16 },
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

  uploadArea: {
    width: "100%",
    height: 150,
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#93C5FD",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  uploadText: { color: "#374151", fontSize: 14, fontWeight: "500" },
  uploadInfo: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 10,
  },

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

  submitBtnFull: {
    backgroundColor: "#E4C77B",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  rowButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    height: 50,
    gap: 15,
  },
  outlineBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4C77B",
    alignItems: "center",
  },
  outlineBtnText: { color: "#3E2723", fontWeight: "bold", fontSize: 16 },
  filledBtn: {
    flex: 1,
    backgroundColor: "#E4C77B",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitBtnText: { color: "#3E2723", fontWeight: "bold", fontSize: 16 },
  termsContainer: { flexDirection: "row", alignItems: "center", marginTop: 20 },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: { backgroundColor: "#E4C77B", borderColor: "#E4C77B" },
  termsText: { fontSize: 12, color: "#111827", fontWeight: "500" },
  linkText: { color: "#E4C77B", textDecorationLine: "underline" },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  line: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  dividerText: { marginHorizontal: 15, color: "#6B7280", fontSize: 12 },
  socialBtnOutlined: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E4C77B",
    borderRadius: 8,
    paddingVertical: 16,
    marginBottom: 12,
    backgroundColor: "#FFF",
  },
  socialBtnText: { color: "#3E2723", fontWeight: "bold", fontSize: 14 },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginBottom: 10,
    textAlign: "center",
  },
});
