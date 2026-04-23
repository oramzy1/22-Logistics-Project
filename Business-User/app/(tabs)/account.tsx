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
  UserPlus,
  UserX,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Appearance,
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/AppText";
import { showToast } from "../utils/toast";
import { AccountSkeleton } from "@/src/ui/skeletons/AccountSkeleton";
import { useAppTheme } from "@/src/ui/useAppTheme";
import { SupportSheet, SupportType } from "@/src/ui/SupportSheet";
import { LanguagePickerItem } from "@/src/ui/LanguagePicker";
import { NotificationPrefs } from "@/hooks/useNotificationPrefs";
import { useLoading } from "@/context/LoadingContext";
import { PrimaryButton } from "@/src/ui/PrimaryButton";
import { PasswordStrengthIndicator } from "@/src/ui/PasswordStrengthIndicator";

export type NotifPrefs = {
  trip: boolean;
  driver: boolean;
  payment: boolean;
  promos: boolean;
};

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Custom Reusable Components
const ListItem = ({
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
          color={isDanger ? "#EF4444" : "#6B7280"}
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

const AccordionItem = ({
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
    <View style={styles.accordionWrapper}>
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
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { signOut } = useAuth();

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

const handleOtpContinue = async () => {
  if (otp.length !== 6) return;

  if (mode === "action") {
    onActionVerified(otp);
    onClose();
  } else {
    // Verify OTP with backend BEFORE allowing user to set new credentials
    showLoading("Verifying code...");
    try {
      await UserService.verifyActionOtp(otp);
      setStep("newCredentials"); // only advances on success
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || "Invalid or expired code.");
      // Clear the OTP field so they must re-enter
      setOtp("");
    } finally {
      hideLoading();
    }
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
      await signOut(); // force logout after email change
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
                style={{ marginVertical: 12, alignItems: "center" }}
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
                style={{ marginVertical: 16 }}
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
              <View>
              <Text style={styles.modalLabel}>New Password</Text>
              <TextInput
                style={styles.modalInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Create a password"
                secureTextEntry
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <PasswordStrengthIndicator
              password={newPassword}
              visible={passwordFocused && newPassword.length > 0}
              backgroundColor='transparent'
              />
              </View>
              <View style={[passwordFocused && newPassword.length > 0 && {marginTop: 65}]}>
                  <Text style={styles.modalLabel}>Confirm Password</Text>
              <TextInput
                style={[styles.modalInput, { marginBottom: 4 }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                secureTextEntry
              />
              </View>
              <PrimaryButton
                title="Send Verification to New Email"
                style={{ marginTop: 20, marginBottom: 10 }}
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
  const { colors: themeColors, isDark } = useAppTheme();
  const styles = createStyles(themeColors);
  const [notifications, setNotifications] = useState<NotifPrefs>({
    trip: true,
    driver: true,
    payment: true,
    promos: false,
  });
  const [darkMode, setDarkMode] = useState(isDark);

  const { user, clearAuthData, updateUser, signOut, isBusiness } = useAuth();
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<
    | "editProfile"
    | "changeEmail"
    | "changePassword"
    | "deleteAccount"
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
  });
  const [supportSheet, setSupportSheet] = useState<SupportType>(null);
  const { showLoading, hideLoading } = useLoading();
  const [passwordSetupModal, setPasswordSetupModal] = useState<{
    visible: boolean;
    onSuccess: () => void;
  }>({ visible: false, onSuccess: () => {} });
  const isOAuthUser =
    user?.authProvider === "google" || user?.authProvider === "apple";

  const [oauthModal, setOauthModal] = useState<{
    visible: boolean;
    mode: OAuthModalMode;
    pendingAction?: (otp: string) => Promise<void>;
  }>({ visible: false, mode: "action" });
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Reusable interceptor — wrap any sensitive action with this
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

  useEffect(() => {
    NotificationPrefs.load().then(setNotifications);
  }, []);

  const updatePref = async (key: keyof NotifPrefs, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    await NotificationPrefs.save(updated);
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
      showLoading("Please wait...");
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
      } finally {
        hideLoading();
      }
    }
  };

  // if (isLoading) return <AccountSkeleton />;

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <AppHeader title="Account" rightIcons />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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

        <AccordionItem title="BOOKING & TRIPS" icon={Calendar}>
          <ListItem
            icon={Calendar}
            title="Active Bookings"
            subtitle="View your current bookings"
          />
          <ListItem
            icon={History}
            title="Trip History"
            onPress={() =>
              router.replace({
                pathname: "/(tabs)/bookings",
                params: { tab: "Completed" },
              })
            }
          />

          <ListItem
            icon={UserPlus}
            title="Upcoming Trips"
            onPress={() =>
              router.replace({
                pathname: "/(tabs)/bookings",
                params: { tab: "Upcoming" },
              })
            }
          />

          <ListItem
            icon={UserX}
            title="Cancelled Trips"
            onPress={() =>
              router.replace({
                pathname: "/(tabs)/bookings",
                params: { tab: "Cancelled" },
              })
            }
          />
          <ListItem icon={Download} title="Download Trip Receipt" isLast />
        </AccordionItem>

        {/* <AccordionItem title="PAYMENT" icon={CreditCard}>
          <ListItem icon={CreditCard} title="Payment Method" />
          <ListItem icon={History} title="Transaction History" />
          <ListItem icon={FileText} title="Download Invoice" isLast />
        </AccordionItem> */}

        <AccordionItem title="NOTIFICATIONS" icon={Bell}>
          <ListItem
            icon={Bell}
            title="Trip updates"
            rightElement={
              <Switch
                value={notifications.trip}
                onValueChange={(v) => updatePref("trip", v)}
                trackColor={{ true: "#111827" }}
              />
            }
          />
          <ListItem
            icon={Car}
            title="Driver Arrival Alerts"
            rightElement={
              <Switch
                value={notifications.driver}
                onValueChange={(v) => updatePref("driver", v)}
                trackColor={{ true: "#111827" }}
              />
            }
          />
          <ListItem
            icon={CheckCircle}
            title="Payment Confirmation"
            rightElement={
              <Switch
                value={notifications.payment}
                onValueChange={(v) => updatePref("payment", v)}
                trackColor={{ true: "#111827" }}
              />
            }
          />
          <ListItem
            icon={Gift}
            title="Promotions"
            isLast
            rightElement={
              <Switch
                value={notifications.promos}
                onValueChange={(v) => updatePref("promos", v)}
                trackColor={{ true: "#111827" }}
              />
            }
          />
        </AccordionItem>

        <AccordionItem title="PREFERENCES" icon={Globe}>
          <LanguagePickerItem />
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
                  <View>
                    <Text style={styles.modalLabel}>New Password</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={modalValues.newPassword}
                    onChangeText={(t) =>
                      setModalValues((v) => ({ ...v, newPassword: t }))
                    }
                    placeholder="New password"
                    secureTextEntry
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <PasswordStrengthIndicator
                  password={modalValues.newPassword}
                  visible={passwordFocused && modalValues.newPassword.length > 0}  
                  backgroundColor="transparent"                
                  />
                  </View>
                <View style={[passwordFocused && modalValues.newPassword.length > 0 && {marginTop: 65}]}>
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
                </View>
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
    root: { flex: 1, backgroundColor: themeColors.navy }, // Light gray background to show white cards
    content: {
      padding: 20,
      paddingBottom: 60,
      backgroundColor: themeColors.background,
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
      backgroundColor: themeColors.card,
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
