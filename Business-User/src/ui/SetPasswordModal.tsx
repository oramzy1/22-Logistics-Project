import { UserService } from "@/api/user.service";
import { showToast } from "@/app/utils/toast";
import { useLoading } from "@/context/LoadingContext";
import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, View } from "react-native";
import { PrimaryButton } from "./PrimaryButton";

type SetPasswordModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void; // retry the original action after setup
};

export const SetPasswordModal = ({ visible, onClose, onSuccess }: SetPasswordModalProps) => {
  const [step, setStep] = useState<"intro" | "otp" | "password">("intro");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { showLoading, hideLoading } = useLoading();

  const handleRequestOtp = async () => {
    showLoading("Sending code...");
    try {
      await UserService.requestPasswordSetupOtp();
      setStep("otp");
      showToast.success("Check your email for a verification code");
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || "Failed to send code");
    } finally {
      hideLoading();
    }
  };

  const handleSetPassword = async () => {
    if (newPassword !== confirmPassword) {
      return showToast.error("Passwords do not match");
    }
    showLoading("Setting password...");
    try {
      await UserService.setupPassword(otp, newPassword);
      showToast.success("Password set! You can now continue.");
      onSuccess(); // ← retries the original blocked action
      onClose();
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || "Failed");
    } finally {
      hideLoading();
    }
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalCard}>
          {step === "intro" && (
            <>
              <Text style={styles.modalTitle}>Set a Password</Text>
              <Text style={{ color: "#6B7280", fontSize: 13, marginBottom: 20 }}>
                To perform sensitive actions on your account, you need to set a 
                password first. We'll send a verification code to your email to get started.
              </Text>
              <PrimaryButton title="Send Verification Code" onPress={handleRequestOtp} />
              <TouchableOpacity onPress={onClose} style={{ marginTop: 12, alignItems: "center" }}>
                <Text style={{ color: "#6B7280" }}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {step === "otp" && (
            <>
              <Text style={styles.modalTitle}>Enter Verification Code</Text>
              <Text style={{ color: "#6B7280", fontSize: 13, marginBottom: 16 }}>
                Check your email for the 6-digit code.
              </Text>
              <TextInput
                style={styles.modalInput}
                value={otp}
                onChangeText={setOtp}
                placeholder="6-digit code"
                keyboardType="number-pad"
                maxLength={6}
              />
              <PrimaryButton
                title="Continue"
                style={{ marginTop: 16 }}
                onPress={() => otp.length === 6 && setStep("password")}
              />
            </>
          )}

          {step === "password" && (
            <>
              <Text style={styles.modalTitle}>Create a Password</Text>
              <TextInput
                style={[styles.modalInput, { marginBottom: 12 }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New password"
                secureTextEntry
              />
              <TextInput
                style={styles.modalInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                secureTextEntry
              />
              <PrimaryButton
                title="Set Password"
                style={{ marginTop: 20 }}
                onPress={handleSetPassword}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};