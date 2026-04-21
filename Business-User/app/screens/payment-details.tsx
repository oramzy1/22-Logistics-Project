import { TripExtension, useBookings } from "@/context/BookingContext";
import { AppHeader } from "@/src/ui/AppHeader";
import { colors, radius, spacing, text } from "@/src/ui/theme";
import { useLocalSearchParams } from "expo-router";
import { ChevronDown, ChevronUp, Download } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/AppText";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

function Row({
  label,
  value,
  valueStyle,
  noBorder,
}: {
  label: string;
  value: string;
  valueStyle?: any;
  noBorder?: boolean;
}) {
  return (
    <View style={[styles.row, noBorder && { borderBottomWidth: 0 }]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueStyle]}>{value}</Text>
    </View>
  );
}

export default function PaymentHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bookings } = useBookings();
  const [showExtensions, setShowExtensions] = useState(false);

  const booking = bookings.find((b) => b.id === id);
  const extensions: TripExtension[] = booking?.extensions ?? [];
  const paidExtensions = extensions.filter((e) => e.paymentStatus === "PAID");

  const handleDownload = async () => {
  const booking = bookings.find((b) => b.id === id);
  const html = `
    <html><body style="font-family:sans-serif;padding:32px;max-width:600px;margin:auto">
      <div style="text-align:center;background:#0B1B2B;padding:20px;border-radius:12px;margin-bottom:24px">
        <h1 style="color:#E4C77B;margin:0;letter-spacing:2px">22Logistics</h1>
        <p style="color:#9CA3AF;margin:4px 0 0">Official Receipt</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:10px 0;border-bottom:1px solid #F1F5F9;color:#6B7280">Invoice Number</td>
            <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;font-weight:700;text-align:right">22LOG${booking?.id.slice(-8).toUpperCase()}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #F1F5F9;color:#6B7280">Package</td>
            <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;font-weight:700;text-align:right">${booking?.packageType}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #F1F5F9;color:#6B7280">Date</td>
            <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;font-weight:700;text-align:right">${formattedDate}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #F1F5F9;color:#6B7280">Pick-up</td>
            <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;font-weight:700;text-align:right">${booking?.pickupAddress}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #F1F5F9;color:#6B7280">Drop-off</td>
            <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;font-weight:700;text-align:right">${booking?.dropoffAddress}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #F1F5F9;color:#6B7280">Driver</td>
            <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;font-weight:700;text-align:right">${booking?.driver ? booking.driver.name : 'Pending'}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #F1F5F9;color:#6B7280">Payment Status</td>
            <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;font-weight:700;text-align:right;color:${booking?.paymentStatus === 'PAID' ? '#22C55E' : '#EF4444'}">${booking?.paymentStatus}</td></tr>
        <tr><td style="padding:14px 0;color:#111827;font-weight:800;font-size:16px">Total Amount</td>
            <td style="padding:14px 0;font-weight:900;font-size:18px;text-align:right">₦${booking?.totalAmount.toLocaleString()}</td></tr>
        ${paidExtensions.length > 0 ? `
        <tr><td style="padding:10px 0;color:#6B7280">Extensions Total</td>
            <td style="padding:10px 0;font-weight:700;text-align:right">₦${paidExtensions.reduce((s, e) => s + e.amount, 0).toLocaleString()}</td></tr>
        <tr><td style="padding:14px 0;color:#111827;font-weight:800">Grand Total</td>
            <td style="padding:14px 0;font-weight:900;font-size:18px;text-align:right">₦${(booking?.totalAmount + paidExtensions.reduce((s, e) => s + e.amount, 0)).toLocaleString()}</td></tr>
        ` : ''}
      </table>
      <p style="text-align:center;color:#9CA3AF;font-size:12px;margin-top:32px">
        Thank you for riding with 22Logistics<br>
        📞 +1238095832217 · ✉️ hello@22logistics.com
      </p>
    </body></html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Receipt - ${booking?.packageType}`,
      UTI: 'com.adobe.pdf',
    });
  } catch (err) {
    console.error('Download failed:', err);
  }
};


  if (!booking) {
    return (
      <SafeAreaView style={styles.root}>
        <AppHeader title="View Payment History" showBack rightIcons />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: colors.muted }}>Booking not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate = new Date(booking.scheduledAt).toLocaleDateString(
    "en-NG",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
  const formattedTime = new Date(booking.scheduledAt).toLocaleTimeString(
    "en-NG",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const statusColor =
    booking.status === "COMPLETED"
      ? "#22C55E"
      : booking.status === "CANCELLED"
        ? "#EF4444"
        : "#F59E0B";

  const paymentColor = booking.paymentStatus === "PAID" ? "#22C55E" : "#EF4444";

  return (
    <SafeAreaView style={styles.root}>
      <AppHeader title="View Payment History" showBack rightIcons />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Billing Header */}
        <View style={styles.billingHeader}>
          <View>
            <Text style={styles.billingTitle}>BILLING Details</Text>
            <Text style={styles.billingRideType}>{booking.packageType}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.billingAmount}>
              ₦{booking.totalAmount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Top Meta Row */}
        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>{formattedDate}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.metaLabel}>Ride Status</Text>
            <Text style={[styles.metaValue, { color: statusColor }]}>
              {booking.status.replace("_", " ")}
            </Text>
          </View>
        </View>

        {/* Invoice Row */}
        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>INVOICE NUMBER</Text>
            <Text style={styles.metaValue}>
              22LOG{booking.id.slice(-8).toUpperCase()}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.metaLabel}>Payment</Text>
            <Text style={styles.metaValue}>
              {booking.paymentStatus === "PAID" ? "Card" : "Pending"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Detail Rows */}
        <View style={styles.card}>
          <Row label="Schedule date" value={formattedDate} />
          <Row label="Schedule time" value={formattedTime} />
          <Row label="Pick up location" value={booking.pickupAddress} />
          <Row label="Drop off location" value={booking.dropoffAddress} />
          {booking.notes ? (
            <Row
              label="Add-ons selected"
              value={booking.notes.replace("Interstate: ", "")}
            />
          ) : null}
          <Row
            label="Booking ID"
            value={`#${booking.paymentRef.slice(-12).toUpperCase()}`}
          />
          <Row
            label="Driver Status"
            value={booking.driver ? "Assigned" : "Pending"}
            valueStyle={{ color: booking.driver ? "#22C55E" : "#F59E0B" }}
          />
          <Row
            label="Status Badge"
            value={
              booking.status === "CANCELLED"
                ? "Cancel"
                : booking.status.replace("_", " ")
            }
            valueStyle={{ color: statusColor }}
          />
          <Row
            label="Payment status"
            value={booking.paymentStatus === "PAID" ? "Successful" : "Unpaid"}
            valueStyle={{ color: paymentColor }}
            noBorder
          />
        </View>

        {/* Download Button */}
        <TouchableOpacity style={styles.downloadBtn}onPress={handleDownload}>
          <Download size={16} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.downloadText}>Download</Text>
        </TouchableOpacity>
        {paidExtensions.length > 0 && (
          <>
            <TouchableOpacity
              style={styles.extensionsToggle}
              onPress={() => setShowExtensions((v) => !v)}
            >
              <View>
                <Text style={styles.extensionsToggleLabel}>
                  Trip Extensions
                </Text>
                <Text style={styles.extensionsToggleSub}>
                  {paidExtensions.length} extension
                  {paidExtensions.length > 1 ? "s" : ""} paid
                </Text>
              </View>
              {showExtensions ? (
                <ChevronUp size={20} color="#6B7280" />
              ) : (
                <ChevronDown size={20} color="#6B7280" />
              )}
            </TouchableOpacity>

            {showExtensions && (
              <View style={styles.extensionsDrawer}>
                {paidExtensions.map((ext, i) => (
                  <View
                    key={ext.id}
                    style={[
                      styles.extRow,
                      i < paidExtensions.length - 1 && styles.extRowBorder,
                    ]}
                  >
                    <View>
                      <Text style={styles.extHours}>
                        +{ext.hours} Hour{ext.hours > 1 ? "s" : ""}
                      </Text>
                      <Text style={styles.extRef}>
                        #{ext.paymentRef.slice(-10).toUpperCase()}
                      </Text>
                      <Text style={styles.extDate}>
                        {new Date(ext.createdAt).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.extAmount}>
                        ₦{ext.amount.toLocaleString()}
                      </Text>
                      <View style={styles.extPaidBadge}>
                        <Text style={styles.extPaidText}>Paid</Text>
                      </View>
                    </View>
                  </View>
                ))}

                {/* Total including extensions */}
                <View style={styles.extTotal}>
                  <Text style={styles.extTotalLabel}>
                    Total Paid (incl. extensions)
                  </Text>
                  <Text style={styles.extTotalValue}>
                    ₦
                    {(
                      booking.totalAmount +
                      paidExtensions.reduce((s, e) => s + e.amount, 0)
                    ).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 40 },
  billingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  billingTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  billingRideType: { fontSize: 22, fontWeight: "900", color: "#111827" },
  billingAmount: { fontSize: 22, fontWeight: "900", color: "#111827" },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  metaLabel: { fontSize: 11, color: colors.muted, marginBottom: 2 },
  metaValue: { fontSize: 13, fontWeight: "700", color: "#111827" },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: spacing.md,
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.softBorder,
    backgroundColor: "#fff",
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  rowLabel: { ...text.body, color: colors.muted },
  rowValue: {
    ...text.body,
    fontWeight: "800",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  downloadBtn: {
    backgroundColor: "#111827",
    paddingVertical: 16,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  downloadText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  extensionsToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 10
  },
  extensionsToggleLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  extensionsToggleSub: { fontSize: 12, color: "#6B7280" },
  extensionsDrawer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
    overflow: "hidden",
  },
  extRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  extRowBorder: { borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  extHours: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 3,
  },
  extRef: { fontSize: 11, color: "#9CA3AF", marginBottom: 2 },
  extDate: { fontSize: 11, color: "#9CA3AF" },
  extAmount: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  extPaidBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  extPaidText: { fontSize: 11, fontWeight: "700", color: "#166534" },
  extTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  extTotalLabel: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  extTotalValue: { fontSize: 15, fontWeight: "900", color: "#111827" },
});
