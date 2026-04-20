import { useAuth } from "@/context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { FileText, UploadCloud } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, TextInput,
  TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/AppText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showToast } from "@/app/utils/toast";

export default function CompleteDriverProfileScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [licenseUri, setLicenseUri] = useState<string | null>(null);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePickLicense = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 0.8,
    });
    if (!result.canceled) setLicenseUri(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    setError("");
    if (!licenseUri)     return setError("Please upload your driver's license.");
    if (!licenseNumber)  return setError("Please enter your license number.");

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");

      const formData = new FormData();
      formData.append("licenseNumber", licenseNumber);
      const safeUri = Platform.OS === "ios" ? licenseUri.replace("file://", "") : licenseUri;
      formData.append("license", { uri: safeUri, type: "image/jpeg", name: "license.jpg" } as any);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/complete-driver-profile`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Upload failed");
      }

      await refreshUser();
      showToast.success("License submitted! Pending admin verification.");
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err?.message || "Failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.headerBar} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scrollContent}>

          {/* Header */}
          <View style={s.badgeRow}>
            <View style={s.badge}>
              <Text style={s.badgeText}>One last step</Text>
            </View>
          </View>
          <Text style={s.title}>Upload your Driver's License</Text>
          <Text style={s.subtitle}>
            22Logistics provides the vehicle — we just need your valid license to verify you as a driver.
            Your account will be activated after admin review.
          </Text>

          {/* Upload area */}
          <TouchableOpacity style={s.uploadArea} onPress={handlePickLicense} activeOpacity={0.8}>
            {licenseUri ? (
              <Image source={{ uri: licenseUri }} style={s.licensePreview} resizeMode="cover" />
            ) : (
              <>
                <View style={s.uploadIconBox}>
                  <UploadCloud size={32} color="#3B82F6" />
                </View>
                <Text style={s.uploadTitle}>Tap to upload</Text>
                <Text style={s.uploadHint}>JPG or PNG · Max 5MB</Text>
              </>
            )}
          </TouchableOpacity>

          {licenseUri && (
            <TouchableOpacity onPress={handlePickLicense} style={s.retakeBtn}>
              <Text style={s.retakeText}>Choose a different image</Text>
            </TouchableOpacity>
          )}

          {/* License number */}
          <Text style={s.label}>License Number</Text>
          <View style={s.inputContainer}>
            <FileText size={18} color="#9CA3AF" style={s.inputIcon} />
            <TextInput
              style={s.input}
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              placeholder="e.g. ABC1234567"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
            />
          </View>

          {/* Info card */}
          <View style={s.infoCard}>
            <Text style={s.infoTitle}>What happens next?</Text>
            <Text style={s.infoItem}>① Admin reviews your license — usually within 24 hours</Text>
            <Text style={s.infoItem}>② You receive a notification when approved</Text>
            <Text style={s.infoItem}>③ Go online and start receiving ride requests</Text>
          </View>

          {!!error && <Text style={s.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[s.btn, isLoading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Text style={s.btnText}>
              {isLoading ? "Submitting..." : "Submit for Review"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.skipBtn} onPress={() => router.replace("/(tabs)")}>
            <Text style={s.skipText}>Skip for now — I'll do this later</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  headerBar: { height: 70, backgroundColor: "#0B1B2B", borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  scrollContent: { padding: 24, paddingBottom: 48 },
  badgeRow: { marginTop: 12, marginBottom: 12 },
  badge: { alignSelf: "flex-start", backgroundColor: "#FEF9EC", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: "#E4C77B" },
  badgeText: { color: "#92600A", fontSize: 12, fontWeight: "600" },
  title: { fontSize: 22, fontWeight: "700", color: "#0B1B2B", marginBottom: 10, lineHeight: 30 },
  subtitle: { fontSize: 13, color: "#6B7280", lineHeight: 20, marginBottom: 28 },
  uploadArea: {
    width: "100%", minHeight: 180,
    backgroundColor: "#F0F9FF",
    borderWidth: 1.5, borderColor: "#93C5FD",
    borderStyle: "dashed", borderRadius: 16,
    justifyContent: "center", alignItems: "center",
    marginBottom: 12, overflow: "hidden",
    paddingVertical: 24,
  },
  licensePreview: { width: "100%", height: 200 },
  uploadIconBox: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  uploadTitle: { fontSize: 15, fontWeight: "600", color: "#1E40AF", marginBottom: 4 },
  uploadHint: { fontSize: 12, color: "#9CA3AF" },
  retakeBtn: { alignSelf: "center", marginBottom: 20 },
  retakeText: { fontSize: 13, color: "#3B82F6", fontWeight: "500" },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8, marginTop: 8 },
  inputContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, paddingHorizontal: 12, height: 48, backgroundColor: "#FFF" },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: "#111827" },
  infoCard: { backgroundColor: "#F9F6F0", borderRadius: 12, padding: 16, marginTop: 24, borderLeftWidth: 4, borderLeftColor: "#E4C77B" },
  infoTitle: { fontSize: 13, fontWeight: "700", color: "#0B1B2B", marginBottom: 10 },
  infoItem: { fontSize: 12, color: "#4B5563", lineHeight: 22 },
  errorText: { color: "#EF4444", fontSize: 12, marginTop: 12, textAlign: "center" },
  btn: { backgroundColor: "#E4C77B", paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 28 },
  btnText: { color: "#3E2723", fontWeight: "700", fontSize: 15 },
  skipBtn: { alignItems: "center", paddingVertical: 16 },
  skipText: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },
});