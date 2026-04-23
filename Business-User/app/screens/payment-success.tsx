import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/AppText';
import { useBookings } from '@/context/BookingContext';
import LottieView from "lottie-react-native";
import { colors, radius, spacing, text } from '@/src/ui/theme';
import { Image } from 'expo-image';
import { useAppTheme } from '@/src/ui/useAppTheme';

function SuccessBadge() {
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);
  return (
    <View style={styles.lottieContainer}>
      <LottieView
        source={require("../../assets/animations/Done_tick.json")}
        autoPlay
        loop={false}
        style={{ width: 150, height: 150 }}
      />
    </View>
  );
}

export default function PaymentSuccessScreen() {
  const params = useLocalSearchParams<{
    bookingId: string;
    packageType: string;
    scheduledAt: string;
    pickupAddress: string;
    dropoffAddress: string;
    totalAmount: string;
    reference: string;
    addOns?: string;
  }>();

  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);
  const { verifyPayment, fetchBookings } = useBookings();
  const [verifyStatus, setVerifyStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending');

//   useEffect(() => {
//   const confirmPayment = async () => {
//     try {
//       await new Promise ((resolve) => setTimeout(resolve, 2000));
//       await verifyPayment(params.reference);
//       await fetchBookings();
//       setVerifyStatus('confirmed');
//     } catch (err: any) {
//       // If already verified by webhook, it returns 400 "Payment not successful"
//       // but DB may already be updated — refetch regardless
//       await fetchBookings();
//       setVerifyStatus('confirmed');
//     }
//   };

//   confirmPayment();
// }, []);


useEffect(() => {
  console.log('🧾 Success screen params:', params);
  console.log('📤 Reference being verified:', params.reference);
  const confirmPayment = async () => {
    let attempts = 0;
    const maxAttempts = 3;

    const tryVerify = async (): Promise<void> => {
      attempts++;
      try {
        await verifyPayment(params.bookingId);
        await fetchBookings();
        setVerifyStatus('confirmed');
      } catch (err: any) {
        console.log(`Frontend verify attempt ${attempts} failed:`, err?.response?.status);

        if (attempts < maxAttempts) {
          // Wait 3s between frontend retries
          await new Promise((r) => setTimeout(r, 3000));
          return tryVerify();
        }

        // Exhausted retries — still refetch in case webhook already handled it
        await fetchBookings();
        setVerifyStatus('confirmed'); // UI shows confirmed, actual DB state is truth
      }
    };

    // Small initial delay — let Paystack process on their end first
    await new Promise((r) => setTimeout(r, 1500));
    await tryVerify();
  };

  confirmPayment();
}, []);

  const formattedDate = params.scheduledAt
    ? new Date(params.scheduledAt).toLocaleDateString('en-NG', { month: 'long', day: 'numeric' })
    : '—';
  const formattedTime = params.scheduledAt
    ? new Date(params.scheduledAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
    : '—';
  const formattedDateTime = params.scheduledAt
    ? new Date(params.scheduledAt).toLocaleString('en-NG', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
       <SuccessBadge />
        <Text style={styles.successTitle}>Payment Successful</Text>
        <Text style={styles.successSub}>
          Your ride is confirmed. A driver will be assigned shortly.
        </Text>

        {/* Verification badge */}
        {/* <View style={[
          styles.verifyBadge,
          verifyStatus === 'confirmed' && styles.verifyBadgeConfirmed,
        ]}>
          {verifyStatus === 'pending' ? (
            <>
              <ActivityIndicator size="small" color="#92400E" style={{ marginRight: 8 }} />
              <Text style={styles.verifyText}>Confirming payment...</Text>
            </>
          ) : (
            <Text style={[styles.verifyText, { color: '#166534' }]}>✓ Payment confirmed</Text>
          )}
        </View> */}

        <Text style={styles.dateLabel}>{formattedDateTime}</Text>

        <View style={styles.card}>
          <Row label="Ride type" value={params.packageType ?? '—'} />
          <Row label="Schedule date" value={formattedDate} />
          <Row label="Schedule time" value={formattedTime} />
          <Row label="Pick up location" value={params.pickupAddress ?? '—'} />
          <Row label="Drop off location" value={params.dropoffAddress ?? '—'} />
          {params.addOns ? <Row label="Add-ons selected" value={params.addOns} /> : null}
          {params.bookingId ? (
            <Row label="Booking ID" value={`#${params.bookingId.slice(-12).toUpperCase()}`} />
          ) : null}
          <Row
            label="Status"
            value="Successful"
            valueStyle={{ color: '#22C55E', fontWeight: '800' }}
          />
        </View>

        <View style={styles.driverBanner}>
          <Text style={styles.driverBannerText}>Driver Pending Assignment..</Text>
           <Image source={require('../../assets/images/car.png')} style={{  width: 40, height: 40 }} />
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace('/(tabs)/bookings')}
          disabled={verifyStatus === 'pending'}
        >
          <Text style={styles.primaryBtnText}>{verifyStatus === 'pending' ? 'Loading...' : 'View Bookings'}</Text>
        </TouchableOpacity>

       { verifyStatus !== 'pending' && (
         <TouchableOpacity style={styles.outlineBtn}>
          <Text style={styles.outlineBtnText}>Download Receipt</Text>
        </TouchableOpacity>
       )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, valueStyle }: { label: string; value: string; valueStyle?: any }) {
  
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueStyle]}>{value}</Text>
    </View>
  );
}

const createStyles = (themeColors: any) => StyleSheet.create({
  root: { flex: 1, backgroundColor: themeColors.background },
  content: { padding: spacing.lg, paddingBottom: 40 },
  successIcon: { alignItems: 'center', marginTop: 12, marginBottom: 16 },
   lottieContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    // marginBottom: 10,
  },    
  successTitle: { fontSize: 22, fontWeight: '800', color: themeColors.text, textAlign: 'center', marginBottom: 8 },
  successSub: { fontSize: 14, color: themeColors.textSecondary, textAlign: 'center', marginBottom: 12, lineHeight: 20 },
  verifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'center',
    marginBottom: 12,
  },
  verifyBadgeConfirmed: { backgroundColor: '#DCFCE7' },
  verifyText: { fontSize: 13, fontWeight: '600', color: '#92400E' },
  dateLabel: { fontSize: 12, color: colors.muted, textAlign: 'center', marginBottom: spacing.lg },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.softBorder,
    backgroundColor: themeColors.background,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowLabel: { ...text.body, color: themeColors.textSecondary },
  rowValue: { ...text.body, fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 16, color: themeColors.textPrimary },
  driverBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.sky,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    height: 56,
    marginBottom: spacing.lg,
  },
  driverBannerText: { fontWeight: '700', color: '#1D4ED8', fontSize: 13 },
  primaryBtn: {
    backgroundColor: '#E4C77B',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: { fontWeight: '700', color: '#3E2723', fontSize: 15 },
  outlineBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  outlineBtnText: { fontWeight: '600', color: '#374151', fontSize: 15 },
});