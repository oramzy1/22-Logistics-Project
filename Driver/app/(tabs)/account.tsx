import { UserService } from "@/api/user.service";
import { useAuth } from "@/context/AuthContext";
import { AppHeader } from "@/src/ui/AppHeader";
import { colors } from "@/src/ui/theme";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  Bell,
  Calendar,
  Car,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Download,
  Edit3,
  FileText,
  Gift,
  Globe,
  HelpCircle,
  History,
  Info,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  Moon,
  Phone,
  Shield,
  Trash2,
  User,
  UserX,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
  RefreshControl,
  Appearance,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/AppText";
import { showToast } from "../utils/toast";
import { AccountSkeleton } from "@/src/ui/skeletons/AccountSkeleton";
import { DriverService } from "@/api/driver.service";
import { useAppTheme } from "@/src/ui/useAppTheme";
import { isProfileComplete } from "@/src/ui/ProfileCompletionCard";
import { SupportSheet } from "@/src/ui/SupportSheet";
import { useLoading } from "@/context/LoadingContext";
import { PrimaryButton } from "@/src/ui/PrimaryButton";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Custom Reusable Components
const ListItem: React.FC<any> = ({
  icon: Icon,
  title,
  subtitle,
  rightElement,
  isDanger = false,
  isLast = false,
  onPress,
}: any) => {
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);

  return (
    <TouchableOpacity
      style={[styles.listItem, !isLast && styles.listBorder]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.listItemLeft}>
        <Icon
          size={18}
          color={isDanger ? "#EF4444" : themeColors.textSecondary}
          style={{ marginRight: 16 }}
        />
        <View>
          <Text
            style={[styles.listItemTitle, isDanger && { color: "#EF4444" }]}
          >
            {title}
          </Text>
          {subtitle && <Text style={styles.listItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || <ChevronRight size={16} color="#9CA3AF" />}
    </TouchableOpacity>
  );
};

const AccordionItem: React.FC<any> = ({
  title,
  icon: Icon,
  children,
  isDanger = false,
}: any) => {
  const [expanded, setExpanded] = useState(false);

  const { isDark, colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);

  const toggleAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View
      style={[styles.accordionWrapper, { backgroundColor: themeColors.card }]}
    >
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={toggleAccordion}
        activeOpacity={0.7}
      >
        <View style={styles.accordionHeaderLeft}>
          <View style={styles.iconBox}>
            <Icon
              size={18}
              color={isDanger ? "#EF4444" : themeColors.textSecondary}
            />
          </View>
          <Text
            style={[styles.accordionTitle, isDanger && { color: "#EF4444" }]}
          >
            {title}
          </Text>
        </View>
        {expanded ? (
          <ChevronDown size={20} color="#9CA3AF" />
        ) : (
          <ChevronRight size={20} color="#9CA3AF" />
        )}
      </TouchableOpacity>
      {expanded && <View style={styles.accordionContent}>{children}</View>}
    </View>
  );
};

type OAuthModalMode = "action" | "emailChange"; // action = delete/deactivate, emailChange = full flow

type OAuthActionModalProps = {
  visible: boolean;
  mode: OAuthModalMode;
  onClose: () => void;
  onActionVerified: (otp: string) => void; // for "action" mode — passes OTP back to caller
  onEmailChangeComplete: () => void; // for "emailChange" mode — triggers logout
};

const OAuthActionModal = ({
  visible,
  mode,
  onClose,
  onActionVerified,
  onEmailChangeComplete,
}: OAuthActionModalProps) => {
  const [step, setStep] = useState<
    "requestOtp" | "enterOtp" | "newCredentials" | "verifyNewEmail"
  >("requestOtp");
  const [otp, setOtp] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmailOtp, setNewEmailOtp] = useState("");
  const { showLoading, hideLoading } = useLoading();
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);

  // Reset on open
  useEffect(() => {
    if (visible) {
      setStep("requestOtp");
      setOtp("");
      setNewEmail("");
      setNewPassword("");
      setConfirmPassword("");
      setNewEmailOtp("");
    }
  }, [visible]);

  const handleRequestOtp = async () => {
    showLoading("Sending code...");
    try {
      await UserService.requestActionOtp();
      setStep("enterOtp");
      showToast.success("Check your email for a verification code");
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || "Failed to send code");
    } finally {
      hideLoading();
    }
  };

  const handleOtpContinue = () => {
    if (otp.length !== 6) return;
    if (mode === "action") {
      // Pass OTP back — the caller will use it as the credential
      onActionVerified(otp);
      onClose();
    } else {
      // Email change — proceed to new credentials step
      setStep("newCredentials");
    }
  };

  const handleSubmitEmailChange = async () => {
    if (newPassword !== confirmPassword) {
      return showToast.error("Passwords do not match");
    }
    if (!newEmail) return showToast.error("Please enter a new email");

    showLoading("Processing...");
    try {
      await UserService.requestEmailChange(newEmail, newPassword, otp);
      setStep("verifyNewEmail");
      showToast.success("Verification code sent to your new email");
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || "Failed");
    } finally {
      hideLoading();
    }
  };

  const handleConfirmNewEmail = async () => {
    showLoading("Confirming...");
    try {
      await UserService.confirmEmailChange(newEmailOtp);
      showToast.success(
        "Email changed! Please sign in with your new credentials.",
      );
      onEmailChangeComplete(); // triggers clearAuthData + redirect
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || "Failed");
    } finally {
      hideLoading();
    }
  };

  const titles = {
    requestOtp: "Verify Your Identity",
    enterOtp: "Enter Verification Code",
    newCredentials: "Set New Email & Password",
    verifyNewEmail: "Verify New Email",
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{titles[step]}</Text>

          {step === "requestOtp" && (
            <>
              <Text
                style={{ color: "#6B7280", fontSize: 13, marginBottom: 20 }}
              >
                {mode === "action"
                  ? "We'll send a verification code to your email to confirm this action."
                  : "To change your email and set a password, we'll first verify your current account."}
              </Text>
              <PrimaryButton
                title="Send Verification Code"
                onPress={handleRequestOtp}
              />
              <TouchableOpacity
                onPress={onClose}
                style={{ marginTop: 12, alignItems: "center" }}
              >
                <Text style={{ color: "#6B7280" }}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {step === "enterOtp" && (
            <>
              <Text
                style={{ color: "#6B7280", fontSize: 13, marginBottom: 16 }}
              >
                Enter the 6-digit code sent to your email.
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
                onPress={handleOtpContinue}
              />
            </>
          )}

          {step === "newCredentials" && (
            <>
              <Text
                style={{ color: "#6B7280", fontSize: 13, marginBottom: 16 }}
              >
                Enter your new email and create a password. You'll verify the
                new email next.
              </Text>
              <Text style={styles.modalLabel}>New Email</Text>
              <TextInput
                style={styles.modalInput}
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="New email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.modalLabel}>New Password</Text>
              <TextInput
                style={styles.modalInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Create a password"
                secureTextEntry
              />
              <Text style={styles.modalLabel}>Confirm Password</Text>
              <TextInput
                style={[styles.modalInput, { marginBottom: 4 }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                secureTextEntry
              />
              <PrimaryButton
                title="Send Verification to New Email"
                style={{ marginTop: 20 }}
                onPress={handleSubmitEmailChange}
              />
            </>
          )}

          {step === "verifyNewEmail" && (
            <>
              <Text
                style={{ color: "#6B7280", fontSize: 13, marginBottom: 16 }}
              >
                Enter the verification code sent to {newEmail} to complete the
                change.
              </Text>
              <TextInput
                style={styles.modalInput}
                value={newEmailOtp}
                onChangeText={setNewEmailOtp}
                placeholder="6-digit code"
                keyboardType="number-pad"
                maxLength={6}
              />
              <Text style={{ color: "#9CA3AF", fontSize: 11, marginTop: 8 }}>
                Until you verify this code, your account remains unchanged.
              </Text>
              <PrimaryButton
                title="Confirm & Complete"
                style={{ marginTop: 20 }}
                onPress={handleConfirmNewEmail}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default function AccountTabScreen() {
  const { isDark, colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);
  const [notifications, setNotifications] = useState({
    trip: true,
    driver: true,
    payment: true,
    promos: false,
  });
  const [darkMode, setDarkMode] = useState(isDark);

  const {
    user,
    clearAuthData,
    updateUser,
    signOut,
    refreshUser,
    isLoading,
    isBusiness,
  } = useAuth();
  const router = useRouter();
  const profileComplete = isProfileComplete(user);
  const [activeModal, setActiveModal] = useState<
    | "editProfile"
    | "changeEmail"
    | "changePassword"
    | "deleteAccount"
    | "editVehicle"
    | "editWorkingHours"
    | "deactivateAccount"
    | null
  >(null);
  const [modalValues, setModalValues] = useState({
    name: "",
    phone: "",
    newEmail: "",
    password: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    deletePassword: "",
    vehicleType: "",
    brandModel: "",
    plateNumber: "",
    vehicleColor: "",
    workingHours: "",
  });
  const [supportSheet, setSupportSheet] = useState<any>(null);
  const { showLoading, hideLoading } = useLoading();
  const [passwordSetupModal, setPasswordSetupModal] = useState<{
    visible: boolean;
    onSuccess: () => void;
  }>({ visible: false, onSuccess: () => {} });

  const isOAuthUser = user?.authProvider === "google" || user?.authProvider === "apple";

  const [oauthModal, setOauthModal] = useState<{
    visible: boolean;
    mode: OAuthModalMode;
    pendingAction?: (otp: string) => Promise<void>;
  }>({ visible: false, mode: "action" });

  const withPasswordSetup = (action: () => Promise<void>) => async () => {
    try {
      await action();
    } catch (err: any) {
      if (err?.response?.data?.requiresPasswordSetup) {
        setPasswordSetupModal({
          visible: true,
          onSuccess: action, // retry original action after password is set
        });
      }
    }
  };

  const handleEditProfile = () => {
    setModalValues((v) => ({
      ...v,
      name: user?.name ?? "",
      phone: user?.phone ?? "",
    }));
    setActiveModal("editProfile");
  };

const handleChangeEmail = () => {
    if (isOAuthUser) {
      setOauthModal({ visible: true, mode: "emailChange" });
    } else {
      setModalValues((v) => ({
        ...v,
        newEmail: user?.email ?? "",
        password: "",
      }));
      setActiveModal("changeEmail");
    }
  };


  const handleChangePassword = () => {
    setModalValues((v) => ({
      ...v,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
    setActiveModal("changePassword");
  };

  const handleDeactivate = () => {
    Alert.alert(
      "Deactivate Account",
      "Your account will be disabled. You can contact support to reactivate it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: () => {
            if (isOAuthUser) {
              setOauthModal({
                visible: true,
                mode: "action",
                pendingAction: async (otp: string) => {
                  showLoading("Deactivating Account...");
                  try {
                    await UserService.deactivateAccount(otp);
                    await clearAuthData();
                    router.replace("/(auth)/sign-in");
                  } catch (err: any) {
                    showToast.error(err?.response?.data?.message || "Failed");
                  } finally {
                    hideLoading();
                  }
                },
              });
            } else {
              // existing email/hybrid flow — prompt for password in modal
              setModalValues((v) => ({ ...v, deletePassword: "" }));
              setActiveModal("deactivateAccount"); // add this modal type
            }
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "This is permanent and cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          if (isOAuthUser) {
            setOauthModal({
              visible: true,
              mode: "action",
              pendingAction: async (otp: string) => {
                showLoading("Deleting Account...");
                try {
                  await UserService.deleteAccount(otp);
                  await clearAuthData();
                  router.replace("/(auth)/sign-in");
                } catch (err: any) {
                  showToast.error(
                    err?.response?.data?.message || "Deletion failed",
                  );
                } finally {
                  hideLoading();
                }
              },
            });
          } else {
            setModalValues((v) => ({ ...v, deletePassword: "" }));
            setActiveModal("deleteAccount");
          }
        },
      },
    ]);
  };
  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          showLoading("Removing Session...");
          try {
            await signOut();
            router.replace("/(auth)/sign-in");
            showToast.success("Signed out successfully", "See you Soon!");
          } catch (err) {
            showToast.error("Failed to Sign out");
          } finally {
            hideLoading();
          }
        },
      },
    ]);
  };

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
        const data = await UserService.uploadAvatar(result.assets[0].uri);

        if (isBusiness && data.logoUrl) {
          await updateUser({
            businessProfile: { logoUrl: data.logoUrl },
          });
        } else if (data.avatarUrl) {
          await updateUser({ avatarUrl: data.avatarUrl });
        }

        showToast.success("Profile photo updated");
      } catch (err) {
        console.log("Error:", err);
        showToast.error("Failed to upload photo");
      }
    }
  };

  const handleEditVehicle = () => {
    setModalValues((v) => ({
      ...v,
      vehicleType: user?.driverProfile?.vehicleType || "",
      brandModel: user?.driverProfile?.brandModel || "",
      plateNumber: user?.driverProfile?.plateNumber || "",
      vehicleColor: user?.driverProfile?.vehicleColor || "",
    }));
    setActiveModal("editVehicle");
  };
  const handleEditWorkingHours = () => {
    setModalValues((v) => ({
      ...v,
      workingHours: user?.driverProfile?.workingHours || "8:00 AM - 5:00 PM",
    }));
    setActiveModal("editWorkingHours");
  };

  if (isLoading) return <AccountSkeleton />;

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.root, { backgroundColor: themeColors.navy }]}
    >
      <AppHeader title="Account" rightIcons />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { backgroundColor: themeColors.background },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl onRefresh={refreshUser} refreshing={isLoading} />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            onPress={handlePickAvatar}
            style={styles.avatarWrapper}
          >
            {(isBusiness ? user?.businessProfile?.logoUrl : user?.avatarUrl) ? (
              <Image
                source={{
                  uri: isBusiness
                    ? user?.businessProfile?.logoUrl!
                    : user?.avatarUrl!,
                }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Edit3 size={10} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{user?.name ?? "—"}</Text>
          <Text style={styles.contact}>{user?.phone ?? "No phone added"}</Text>
          <Text style={styles.email}>{user?.email ?? "—"}</Text>

          <View
            style={{
              backgroundColor:
                user?.driverProfile?.licenseStatus === "APPROVED"
                  ? "#baf8e3"
                  : user?.driverProfile?.licenseStatus === "REJECTED"
                    ? "#ebb9b9"
                    : "#f5ddb5",
              borderRadius: 5,
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                color:
                  user?.driverProfile?.licenseStatus === "APPROVED"
                    ? "#10B981"
                    : user?.driverProfile?.licenseStatus === "REJECTED"
                      ? "#EF4444"
                      : "#F59E0B",
                fontSize: 13,
                fontWeight: "600",
                padding: 3,
              }}
            >
              ● {user?.driverProfile?.licenseStatus || "PENDING"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={handleEditProfile}
          >
            <Edit3 size={14} color="#3E2723" style={{ marginRight: 6 }} />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ACCORDIONS */}
        <AccordionItem title="ACCOUNT" icon={User}>
          <ListItem
            icon={User}
            title="Edit Profile"
            onPress={handleEditProfile}
          />
          <ListItem
            icon={Mail}
            title="Change Email"
            onPress={handleChangeEmail}
          />
         <ListItem
            icon={Lock}
            title="Change Password"
            subtitle={
              isOAuthUser
                ? "Change your email first to set a password"
                : undefined
            }
            isLast
            onPress={isOAuthUser ? undefined : handleChangePassword}
          />
        </AccordionItem>

        <AccordionItem title="VEHICLE INFORMATION" icon={Car}>
          <ListItem
            icon={Car}
            title={`Type: ${user?.driverProfile?.vehicleType || "Not Set"}`}
            onPress={handleEditVehicle}
          />
          <ListItem
            icon={Car}
            title={`Brand & Model: ${user?.driverProfile?.brandModel || "Not Set"}`}
            onPress={handleEditVehicle}
          />
          <ListItem
            icon={CheckCircle}
            title={`Plate Number: ${user?.driverProfile?.plateNumber || "Not Set"}`}
            onPress={handleEditVehicle}
          />
          <ListItem
            icon={Edit3}
            title={`Color: ${user?.driverProfile?.vehicleColor || "Not Set"}`}
            isLast
            onPress={handleEditVehicle}
          />
        </AccordionItem>
        {/* DOCUMENTS */}
        <AccordionItem title="DOCUMENT INFORMATION" icon={FileText}>
          <ListItem
            icon={FileText}
            title="Driver's License"
            isLast
            rightElement={
              <Text
                style={{
                  color:
                    user?.driverProfile?.licenseStatus === "APPROVED"
                      ? "#10B981"
                      : user?.driverProfile?.licenseStatus === "REJECTED"
                        ? "#EF4444"
                        : "#F59E0B",
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                ● {user?.driverProfile?.licenseStatus || "PENDING"}
              </Text>
            }
          />
        </AccordionItem>
        {/* AVAILABILITY */}
        <AccordionItem title="AVAILABILITY" icon={User}>
          <ListItem
            icon={Globe}
            title="Online Status"
            rightElement={
              <Switch
                value={user?.driverProfile?.onlineStatus !== "OFFLINE"}
                disabled={
                  user?.driverProfile?.onlineStatus === "OFFLINE" &&
                  !profileComplete
                }
                onValueChange={async (v) => {
                  const newStatus = v ? "ONLINE" : "OFFLINE";
                  try {
                    await DriverService.setOnlineStatus(newStatus);
                    await updateUser({
                      driverProfile: {
                        ...user?.driverProfile,
                        onlineStatus: newStatus,
                      },
                    });
                  } catch (err) {
                    Alert.alert("Error", "Could not update status");
                  }
                }}
                trackColor={{ true: "#111827" }}
              />
            }
          />
          <ListItem
            icon={Clock}
            title="Working Hours"
            onPress={handleEditWorkingHours}
            isLast
            rightElement={
              <Text style={{ color: "#6B7280", fontSize: 12 }}>
                {user?.driverProfile?.workingHours || "8:00 AM - 5:00 PM"}
              </Text>
            }
          />
        </AccordionItem>

        <AccordionItem title="NOTIFICATIONS" icon={Bell}>
          <ListItem
            icon={Bell}
            title="Trip updates"
            rightElement={
              <Switch
                value={notifications.trip}
                onValueChange={(v) =>
                  setNotifications({ ...notifications, trip: v })
                }
                trackColor={{ true: "#111827" }}
              />
            }
          />
        </AccordionItem>

        <AccordionItem title="PREFERENCES" icon={Globe}>
          <ListItem icon={Globe} title="Language" subtitle="English" />
          <ListItem
            icon={Moon}
            title="Dark Mode"
            isLast
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={(v) => {
                  setDarkMode(v);
                  Appearance.setColorScheme(v ? "dark" : "light");
                }}
                trackColor={{ true: "#111827" }}
              />
            }
          />
        </AccordionItem>

        <AccordionItem title="SUPPORT" icon={HelpCircle}>
          <ListItem
            icon={HelpCircle}
            title="Help Center"
            onPress={() => setSupportSheet("help")}
          />
          <ListItem
            icon={Info}
            title="FAQs"
            onPress={() => setSupportSheet("faq")}
          />
          <ListItem
            icon={Phone}
            title="Contact Support"
            onPress={() => setSupportSheet("contact")}
          />
          <ListItem
            icon={MessageCircle}
            title="Report an Issue"
            isLast
            onPress={() => setSupportSheet("report")}
          />
        </AccordionItem>

        <AccordionItem title="LEGAL" icon={Shield}>
          <ListItem icon={FileText} title="Terms & Condition" />
          <ListItem icon={Shield} title="Privacy Policy" isLast />
        </AccordionItem>

        <Text style={styles.sectionLabel}>DANGER ZONE</Text>
        <View style={styles.dangerCard}>
          <ListItem
            icon={UserX}
            title="Deactivate Account"
            subtitle="Temporarily disable your account"
            isDanger
            onPress={handleDeactivate}
          />
          <ListItem
            icon={Trash2}
            title="Delete Account"
            subtitle="Permanently remove your account"
            isDanger
            isLast
            onPress={handleDeleteAccount}
          />
          <ListItem
            icon={LogOut}
            title="Sign Out"
            subtitle="Are you sure you want to Sign out?"
            isDanger
            isLast
            onPress={handleSignOut}
          />
        </View>

        <Text style={styles.versionText}>v.1.0 (22Logistics)</Text>
      </ScrollView>
      {/* Reusable Modal Shell */}
      {activeModal && (
        <Modal
          transparent
          animationType="slide"
          onRequestClose={() => setActiveModal(null)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.modalCard}>
              {/* EDIT PROFILE */}
              {activeModal === "editProfile" && (
                <>
                  <Text style={styles.modalTitle}>Edit Profile</Text>
                  <Text style={styles.modalLabel}>Full Name</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={modalValues.name}
                    onChangeText={(t) =>
                      setModalValues((v) => ({ ...v, name: t }))
                    }
                    placeholder="Full Name"
                  />
                  <Text style={styles.modalLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={modalValues.phone}
                    onChangeText={(t) =>
                      setModalValues((v) => ({ ...v, phone: t }))
                    }
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                  />
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => setActiveModal(null)}
                    >
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <PrimaryButton
                      style={styles.modalSaveBtn}
                      title="Save"
                      variant="primary"
                      onPress={async () => {
                        showLoading("Updating Profile...");
                        try {
                          await UserService.updateProfile({
                            name: modalValues.name,
                            phone: modalValues.phone,
                          });
                          await updateUser({
                            name: modalValues.name,
                            phone: modalValues.phone,
                          });
                          setActiveModal(null);
                          Alert.alert("Success", "Profile updated");
                        } catch (err: any) {
                          Alert.alert(
                            "Error",
                            err?.response?.data?.message || "Update failed",
                          );
                        } finally {
                          hideLoading();
                        }
                      }}
                    />
                  </View>
                </>
              )}

              {/* CHANGE EMAIL */}
              {activeModal === "changeEmail" && (
                <>
                  <Text style={styles.modalTitle}>Change Email</Text>
                  <Text style={styles.modalLabel}>New Email</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={modalValues.newEmail}
                    onChangeText={(t) =>
                      setModalValues((v) => ({ ...v, newEmail: t }))
                    }
                    placeholder="New Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <Text style={styles.modalLabel}>Confirm Password</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={modalValues.password}
                    onChangeText={(t) =>
                      setModalValues((v) => ({ ...v, password: t }))
                    }
                    placeholder="Your current password"
                    secureTextEntry
                  />
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => setActiveModal(null)}
                    >
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <PrimaryButton
                      style={styles.modalSaveBtn}
                      title="Save"
                      variant="primary"
                      onPress={async () => {
                        showLoading("Updating Email...");
                        try {
                          await UserService.updateEmail(
                            modalValues.newEmail,
                            modalValues.password,
                          );
                          await clearAuthData();
                          setActiveModal(null);
                          router.replace({
                            pathname: "/(auth)/verify",
                            params: { email: modalValues.newEmail },
                          });
                        } catch (err: any) {
                          Alert.alert(
                            "Error",
                            err?.response?.data?.message || "Update failed",
                          );
                        } finally {
                          hideLoading();
                        }
                      }}
                    />
                  </View>
                </>
              )}

              {/* CHANGE PASSWORD */}
              {activeModal === "changePassword" && (
                <>
                  <Text style={styles.modalTitle}>Change Password</Text>
                  <Text style={styles.modalLabel}>Current Password</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={modalValues.currentPassword}
                    onChangeText={(t) =>
                      setModalValues((v) => ({ ...v, currentPassword: t }))
                    }
                    placeholder="Current password"
                    secureTextEntry
                  />
                  <Text style={styles.modalLabel}>New Password</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={modalValues.newPassword}
                    onChangeText={(t) =>
                      setModalValues((v) => ({ ...v, newPassword: t }))
                    }
                    placeholder="New password"
                    secureTextEntry
                  />
                  <Text style={styles.modalLabel}>Confirm New Password</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={modalValues.confirmPassword}
                    onChangeText={(t) =>
                      setModalValues((v) => ({ ...v, confirmPassword: t }))
                    }
                    placeholder="Confirm new password"
                    secureTextEntry
                  />
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => setActiveModal(null)}
                    >
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <PrimaryButton
                      style={styles.modalSaveBtn}
                      title="Save"
                      onPress={withPasswordSetup(async () => {
                        showLoading("Updating...");
                        try {
                          await UserService.changePassword(
                            modalValues.currentPassword,
                            modalValues.newPassword,
                          );
                          setActiveModal(null);
                          Alert.alert(
                            "Success",
                            "Password changed successfully",
                          );
                        } catch (err: any) {
                          // re-throw so withPasswordSetup can check it
                          throw err;
                        } finally {
                          hideLoading();
                        }
                      })}
                    />
                  </View>
                </>
              )}

              {/* DELETE ACCOUNT */}
              {activeModal === "deleteAccount" && (
                <>
                  <Text style={styles.modalTitle}>Confirm Deletion</Text>
                  <Text
                    style={{ color: "#6B7280", fontSize: 13, marginBottom: 16 }}
                  >
                    Enter your password to permanently delete your account.
                  </Text>
                  <Text style={styles.modalLabel}>Password</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={modalValues.deletePassword}
                    onChangeText={(t) =>
                      setModalValues((v) => ({ ...v, deletePassword: t }))
                    }
                    placeholder="Your password"
                    secureTextEntry
                    autoFocus
                  />
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => setActiveModal(null)}
                    >
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <PrimaryButton
                      style={[
                        styles.modalSaveBtn,
                        { backgroundColor: "#EF4444" },
                      ]}
                      title="Delete Forever"
                      onPress={async () => {
                        showLoading("Deleting Account...");
                        if (!modalValues.deletePassword) {
                          showToast.error("Please enter your password");
                          return;
                        }
                        try {
                          await UserService.deleteAccount(
                            modalValues.deletePassword,
                          );
                          setActiveModal(null);
                          await clearAuthData();
                          router.replace("/(auth)/sign-in");
                        } catch (err: any) {
                          showToast.error(
                            err?.response?.data?.message || "Deletion failed",
                          );
                        } finally {
                          hideLoading();
                        }
                      }}
                    />
                  </View>
                </>
              )}
              {/* DEACTIVATE ACCOUNT */}
              {activeModal === "deactivateAccount" && (
                <>
                  <Text style={styles.modalTitle}>Deactivate Account</Text>
                  <Text
                    style={{ color: "#6B7280", fontSize: 13, marginBottom: 16 }}
                  >
                    Enter your password to temporarily disable your account.
                  </Text>
                  <Text style={styles.modalLabel}>Password</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={modalValues.deletePassword}
                    onChangeText={(t) =>
                      setModalValues((v) => ({ ...v, deletePassword: t }))
                    }
                    placeholder="Your password"
                    secureTextEntry
                    autoFocus
                  />
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => setActiveModal(null)}
                    >
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <PrimaryButton
                      style={[
                        styles.modalSaveBtn,
                        { backgroundColor: "#F59E0B" },
                      ]}
                      title="Deactivate"
                      onPress={async () => {
                        if (!modalValues.deletePassword) {
                          showToast.error("Please enter your password");
                          return;
                        }
                        showLoading("Deactivating Account...");
                        try {
                          await UserService.deactivateAccount(
                            modalValues.deletePassword,
                          );
                          setActiveModal(null);
                          await clearAuthData();
                          router.replace("/(auth)/sign-in");
                        } catch (err: any) {
                          showToast.error(
                            err?.response?.data?.message || "Failed",
                          );
                        } finally {
                          hideLoading();
                        }
                      }}
                    />
                  </View>
                </>
              )}
              {activeModal === "editVehicle" && (
                <>
                  <Text style={styles.modalTitle}>Vehicle Information</Text>

                  <Text style={styles.modalLabel}>Vehicle Type</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={modalValues.vehicleType}
                    onChangeText={(t) =>
                      setModalValues((v) => ({ ...v, vehicleType: t }))
                    }
                    placeholder="e.g. Sedan, SUV, Truck"
                  />
                  <Text style={styles.modalLabel}>Brand & Model</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={modalValues.brandModel}
                    onChangeText={(t) =>
                      setModalValues((v) => ({ ...v, brandModel: t }))
                    }
                    placeholder="e.g. Toyota Camry 2022"
                  />
                  <Text style={styles.modalLabel}>Plate Number</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={modalValues.plateNumber}
                    onChangeText={(t) =>
                      setModalValues((v) => ({ ...v, plateNumber: t }))
                    }
                    placeholder="e.g. ACCA-1784"
                  />
                  <Text style={styles.modalLabel}>Color</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={modalValues.vehicleColor}
                    onChangeText={(t) =>
                      setModalValues((v) => ({ ...v, vehicleColor: t }))
                    }
                    placeholder="e.g. Red, Blue, Black"
                  />
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => setActiveModal(null)}
                    >
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <PrimaryButton
                      title="Save"
                      style={styles.modalSaveBtn}
                      onPress={async () => {
                        showLoading("Updating");
                        try {
                          await DriverService.updateProfile({
                            vehicleType: modalValues.vehicleType,
                            brandModel: modalValues.brandModel,
                            plateNumber: modalValues.plateNumber,
                            vehicleColor: modalValues.vehicleColor,
                          });
                          await updateUser({
                            driverProfile: {
                              ...user?.driverProfile,
                              vehicleType: modalValues.vehicleType,
                              brandModel: modalValues.brandModel,
                              plateNumber: modalValues.plateNumber,
                              vehicleColor: modalValues.vehicleColor,
                            },
                          });
                          setActiveModal(null);
                          showToast.success("Vehicle details updated");
                        } catch (err: any) {
                          console.error(
                            "Cancel error:",
                            JSON.stringify({
                              status: err?.response?.status,
                              data: err?.response?.data,
                              message: err?.message,
                            }),
                          );
                          Alert.alert(
                            "Error",
                            err?.response?.data?.message || "Update failed",
                          );
                        } finally {
                          hideLoading();
                        }
                      }}
                    />
                  </View>
                </>
              )}
              {/* EDIT WORKING HOURS */}
              {activeModal === "editWorkingHours" && (
                <>
                  <Text style={styles.modalTitle}>Set Working Hours</Text>

                  <Text style={styles.modalLabel}>Available Hours</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={modalValues.workingHours}
                    onChangeText={(t) =>
                      setModalValues((v) => ({ ...v, workingHours: t }))
                    }
                    placeholder="e.g. 8:00 AM - 5:00 PM"
                  />
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => setActiveModal(null)}
                    >
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <PrimaryButton
                      title="Save"
                      style={styles.modalSaveBtn}
                      onPress={async () => {
                        showLoading("Adjusting Working Hours...");
                        try {
                          await DriverService.updateProfile({
                            workingHours: modalValues.workingHours,
                          });
                          await updateUser({
                            driverProfile: {
                              ...user?.driverProfile,
                              workingHours: modalValues.workingHours,
                            },
                          });
                          setActiveModal(null);
                          showToast.success("Working hours updated");
                        } catch (err: any) {
                          console.error(
                            "Cancel error:",
                            JSON.stringify({
                              status: err?.response?.status,
                              data: err?.response?.data,
                              message: err?.message,
                            }),
                          );
                          Alert.alert(
                            "Error",
                            err?.response?.data?.message || "Update failed",
                          );
                        } finally {
                          hideLoading();
                        }
                      }}
                    />
                  </View>
                </>
              )}
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
      <SupportSheet
        type={supportSheet}
        onClose={() => setSupportSheet(null)}
        userEmail={user?.email ?? ""}
        userName={user?.name ?? ""}
      />
      <OAuthActionModal
        visible={oauthModal.visible}
        mode={oauthModal.mode}
        onClose={() => setOauthModal({ visible: false, mode: "action" })}
        onActionVerified={async (otp) => {
          await oauthModal.pendingAction?.(otp);
        }}
        onEmailChangeComplete={async () => {
          await clearAuthData();
          router.replace("/(auth)/sign-in");
        }}
      />
    </SafeAreaView>
  );
}

const createStyles = (themeColors: any) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.navy },
    content: {
      padding: 20,
      paddingBottom: 60,
      backgroundColor: colors.background,
    },

    profileHeader: { alignItems: "center", marginBottom: 30, marginTop: 10 },
    avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
    name: {
      fontSize: 20,
      fontWeight: "bold",
      color: themeColors.text,
      marginBottom: 4,
    },
    contact: { fontSize: 13, color: "#6B7280", marginBottom: 2 },
    email: { fontSize: 13, color: "#6B7280", marginBottom: 14 },
    editProfileBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F9F6F0",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "#E5E7EB",
    },
    editProfileText: { color: "#3E2723", fontWeight: "600", fontSize: 13 },

    accordionWrapper: {
      // backgroundColor: themeColors.card,
      borderRadius: 12,
      marginBottom: 12,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    accordionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
    },
    accordionHeaderLeft: { flexDirection: "row", alignItems: "center" },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: themeColors.cardSecondary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    accordionTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: themeColors.text,
      textTransform: "uppercase",
    },
    accordionContent: { paddingHorizontal: 16, paddingBottom: 8 },

    listItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
    },
    listBorder: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
    listItemLeft: { flexDirection: "row", alignItems: "center" },
    listItemTitle: {
      fontSize: 14,
      color: themeColors.textSecondary,
      fontWeight: "500",
    },
    listItemSubtitle: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },

    sectionLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: "#6B7280",
      marginTop: 10,
      marginBottom: 8,
      marginLeft: 4,
    },
    dangerCard: {
      backgroundColor: themeColors.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingBottom: 8,
      marginBottom: 30,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    versionText: {
      textAlign: "center",
      fontSize: 11,
      color: "#9CA3AF",
      marginBottom: 20,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalCard: {
      backgroundColor: themeColors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      paddingBottom: 40,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: themeColors.text,
      marginBottom: 20,
    },
    modalLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: themeColors.textSecondary,
      marginBottom: 6,
      marginTop: 12,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: themeColors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      height: 48,
      fontSize: 14,
      color: themeColors.text,
    },
    modalButtons: { flexDirection: "row", gap: 12, marginTop: 24 },
    modalCancelBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: themeColors.border,
      alignItems: "center",
    },
    modalCancelText: { color: themeColors.textSecondary, fontWeight: "600" },
    modalSaveBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 8,
      backgroundColor: "#E4C77B",
      alignItems: "center",
    },
    modalSaveText: { color: "#3E2723", fontWeight: "700" },
    avatarWrapper: { position: "relative", marginBottom: 12 },
    avatarPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "#0B1B2B",
      alignItems: "center",
      justifyContent: "center",
    },
    avatarInitial: { color: "#fff", fontSize: 28, fontWeight: "700" },
    avatarEditBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "#E4C77B",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "#fff",
    },
  });
