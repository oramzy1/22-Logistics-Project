import { router, useLocalSearchParams } from 'expo-router';
import { XCircle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/AppText';
import { colors, radius, spacing } from '@/src/ui/theme';
import LottieView from 'lottie-react-native';
import { useAppTheme } from '@/src/ui/useAppTheme';


function FailureBadge() {
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);
  return (
    <View style={styles.lottieContainer}>
      <LottieView
        source={require("../../assets/animations/Error animation.json")}
        autoPlay
        loop={false}
        style={{ width: 150, height: 150 }}
      />
    </View>
  );
}

export default function PaymentFailedScreen() {
  const { reference, bookingId } = useLocalSearchParams<{
    reference: string;
    bookingId: string;
  }>();

  
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);

  return ( 
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
       <FailureBadge />
        <Text style={styles.title}>Payment Failed</Text>
        <Text style={styles.sub}>
          We couldn't process your payment. Your booking is still saved — you can retry or choose a different method.
        </Text>

        {reference ? (
          <View style={styles.refBox}>
            <Text style={styles.refLabel}>Reference</Text>
            <Text style={styles.refValue}>{reference}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.replace('/(tabs)/bookings')}
        >
          <Text style={styles.cancelText}>Go to My Bookings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (themeColors: any) => StyleSheet.create({
  root: { flex: 1, backgroundColor: themeColors.background, justifyContent: 'center' },
  content: { padding: spacing.lg, alignItems: 'center' },
  iconWrap: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', color: themeColors.text, marginBottom: 12, textAlign: 'center' },
  sub: { fontSize: 14, color: themeColors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  refBox: {
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    width: '100%',
    marginBottom: 32,
    alignItems: 'center',
  },
  refLabel: { fontSize: 11, color: colors.muted, marginBottom: 4 },
  refValue: { fontSize: 14, fontWeight: '700', color: themeColors.text },
  retryBtn: {
    backgroundColor: '#E4C77B',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  retryText: { fontWeight: '700', color: '#3E2723', fontSize: 15 },
  cancelBtn: {
    borderWidth: 1,
    borderColor: themeColors.border,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    width: '100%',
  },
  cancelText: { fontWeight: '600', color: themeColors.textSecondary, fontSize: 15 },
    lottieContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  }, 
});