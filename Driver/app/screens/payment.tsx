import { useBookings } from "@/context/BookingContext";
import { AppHeader } from "@/src/ui/AppHeader";
import { colors, radius, spacing, text } from "@/src/ui/theme";
import { router, useLocalSearchParams } from "expo-router";
import {
  CheckCircle2,
  Circle,
  CreditCard,
  Landmark,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import { Text } from "../../components/AppText";

export default function PaymentScreen() {
  const {
    bookingId,
    packageType,
    scheduledAt,
    pickupAddress,
    dropoffAddress,
    totalAmount,
    authorizationUrl,
    reference,
    addOns,
    isExtension,
  } = useLocalSearchParams<{
    bookingId: string;
    packageType: string;
    scheduledAt: string;
    pickupAddress: string;
    dropoffAddress: string;
    totalAmount: string;
    authorizationUrl: string;
    reference: string;
    addOns?: string;
    isExtension?: string;
  }>();

  const [selectedType, setSelectedType] = useState<"Card" | "Transfer" | null>(
    null,
  );
  const [showWebView, setShowWebView] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [finalAuthUrl, setFinalAuthUrl] = useState<string | null>(null);
  const { reinitializeBooking } = useBookings(); // we'll add this below

  const handleContinue = async () => {
    if (!selectedType || !bookingId) return;
    if (isExtension === "true") {
      setFinalAuthUrl(authorizationUrl);
      setShowWebView(true);
      return;
    }
    setIsInitializing(true);
    try {
      // Re-initialize with the chosen channel so Paystack restricts to it
      const channel = selectedType === "Card" ? "card" : "bank_transfer";
      const data = await reinitializeBooking(bookingId, channel);
      setFinalAuthUrl(data.authorizationUrl);
      setShowWebView(true);
    } catch (err) {
      console.error("Payment initialization error:", err);
      Alert.alert("Error", "Could not prepare payment. Please try again.");
    } finally {
      setIsInitializing(false);
    }
  };

  // Called when WebView navigates — detect Paystack callback
  // const handleNavigationChange = async (navState: { url: string }) => {
  //   const { url } = navState;

  //   // Paystack redirects to callback_url after payment
  //   // Your callback_url is: BASE_URL/api/payments/callback
  //   if (url.includes('/api/payments/callback') || url.includes('paystack.co/close')) {
  //     setShowWebView(false);
  //     setVerifying(true);

  //     try {
  //       await verifyPayment(reference);
  //       // Navigate to success screen
  //       router.replace({
  //         pathname: '/screens/payment-success',
  //         params: {
  //           bookingId,
  //           packageType,
  //           scheduledAt,
  //           pickupAddress,
  //           dropoffAddress,
  //           totalAmount,
  //           reference,
  //           addOns,
  //         },
  //       });
  //     } catch {
  //       router.replace({
  //         pathname: '/screens/payment-failed',
  //         params: { reference, bookingId },
  //       });
  //     } finally {
  //       setVerifying(false);
  //     }
  //   }
  // };

  // Replace handleNavigationChange with this:
  const handleNavigationChange = (navState: { url: string }) => {
    const { url } = navState;

    // Paystack's own closure - user closed the modal
    if (url.includes("paystack.co/close")) {
      setShowWebView(false);
      return;
    }

    // Your callback URL — payment flow completed (success OR failure)
    // Extract the status Paystack appends as a query param
    if (url.includes("/api/payments/callback")) {
      setShowWebView(false);

      if (isExtension === "true") {
        // Verify the extension payment before going back to live
        router.replace({
          pathname: "/screens/extension-success",
          params: { bookingId, packageType, scheduledAt, pickupAddress, dropoffAddress, totalAmount, reference, addOns },
        });
        return;
      }

      // Paystack appends ?trxref=...&reference=... to callback
      // We don't verify here — webhook already handles DB update.
      // We just optimistically route to success and let the screen
      // do a single delayed verify to confirm.
      router.replace({
        pathname: "/screens/payment-success",
        params: {
          bookingId,
          packageType,
          scheduledAt,
          pickupAddress,
          dropoffAddress,
          totalAmount,
          reference,
          addOns,
        },
      });
    }
  };

  if (verifying) {
    return (
      <SafeAreaView
        style={[
          styles.root,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.navy} />
        <Text style={{ marginTop: 16, color: colors.muted }}>
          Verifying your payment...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <AppHeader title="Payment" showBack />

      <View style={styles.content}>
        <Text style={styles.title}>Choose Payment Method</Text>

        {/* Card Option */}
        <TouchableOpacity
          style={[
            styles.card,
            selectedType === "Card"
              ? styles.selectedCard
              : styles.cardUnselected,
          ]}
          onPress={() => setSelectedType("Card")}
          activeOpacity={0.85}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconRow}>
              <CreditCard
                size={20}
                color={selectedType === "Card" ? "#1D4ED8" : "#6B7280"}
              />
              <Text
                style={[
                  styles.cardTitle,
                  selectedType === "Card" && styles.selectedCardTitle,
                ]}
              >
                Card
              </Text>
            </View>
            {selectedType === "Card" ? (
              <CheckCircle2 size={24} color="#1D4ED8" />
            ) : (
              <Circle size={24} color="#D1D5DB" />
            )}
          </View>
          {selectedType === "Card" && (
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={handleContinue}
              disabled={isInitializing}
            >
              <Text style={styles.continueBtnText}>
                {isInitializing ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  "Continue with Card"
                )}
              </Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Bank Transfer Option */}
        <TouchableOpacity
          style={[
            styles.card,
            selectedType === "Transfer"
              ? styles.selectedTransfer
              : styles.cardUnselected,
          ]}
          onPress={() => setSelectedType("Transfer")}
          activeOpacity={0.85}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconRow}>
              <Landmark
                size={20}
                color={selectedType === "Transfer" ? "#974C16" : "#6B7280"}
              />
              <Text
                style={[
                  styles.cardTitle,
                  selectedType === "Transfer" && styles.selectedTransferTitle,
                ]}
              >
                Bank Transfer
              </Text>
            </View>
            {selectedType === "Transfer" ? (
              <CheckCircle2 size={24} color="#974C16" />
            ) : (
              <Circle size={24} color="#D1D5DB" />
            )}
          </View>
          {selectedType === "Transfer" && (
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={handleContinue}
              disabled={isInitializing}
            >
              <Text style={styles.continueBtnText}>
                {isInitializing ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  "Continue with Bank Transfer"
                )}
              </Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>

      {/* Paystack WebView Modal */}
      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={() => setShowWebView(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={styles.webViewHeader}>
            <Text style={styles.webViewTitle}>Secure Payment</Text>
            <TouchableOpacity
              onPress={() => setShowWebView(false)}
              style={styles.closeBtn}
            >
              <X size={20} color="#374151" />
            </TouchableOpacity>
          </View>
          <WebView
            source={{ uri: finalAuthUrl ?? authorizationUrl }}
            onNavigationStateChange={handleNavigationChange}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.webViewLoader}>
                <ActivityIndicator size="large" color={colors.navy} />
                <Text style={{ marginTop: 12, color: colors.muted }}>
                  Loading payment gateway...
                </Text>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.lg,
    margin: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.softBorder,
  },
  title: { ...text.h2, fontSize: 18, marginBottom: spacing.lg },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardUnselected: { backgroundColor: "#F9F6F0", borderColor: "#E5E7EB" },
  selectedCard: { backgroundColor: "#F0F7FF", borderColor: "#1D4ED8" },
  selectedTransfer: { backgroundColor: "#FFF8F0", borderColor: "#974C16" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconRow: { flexDirection: "row", alignItems: "center" },
  cardTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
    color: "#4B5563",
  },
  selectedCardTitle: { color: "#1D4ED8" },
  selectedTransferTitle: { color: "#974C16" },
  continueBtn: {
    backgroundColor: "#E4C77B",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 14,
  },
  continueBtnText: { fontWeight: "700", color: "#3E2723" },
  webViewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  webViewTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  webViewLoader: { flex: 1, justifyContent: "center", alignItems: "center" },
});
