import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { colors, radius, spacing } from './theme';
import { useAppTheme } from './useAppTheme';

interface OutOfLGAModalProps {
  visible: boolean;
  lgaName: string;
  onContinue: () => void;
  onChangeDestination: () => void;
}

export const OutOfLGAModal: React.FC<OutOfLGAModalProps> = ({
  visible, lgaName, onContinue, onChangeDestination,
}) => {
  
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);
  return(
  <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>Out-of-LGA Charges Apply</Text>

        <View style={styles.banner}>
          <AlertCircle size={16} color="#D97706" style={{ marginTop: 2 }} />
          <Text style={styles.bannerText}>
            Trips outside Port Harcourt and Obio/Akpor LGAs attract additional charges.{' '}
            <Text style={styles.price}>(₦3,000)</Text>
          </Text>
        </View>

        <Text style={styles.sub}>
          The extra fee is shown in your fare summary before confirmation.
        </Text>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.outlineBtn} onPress={onChangeDestination}>
            <Text style={styles.outlineText}>Change Destination</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fillBtn} onPress={onContinue}>
            <Text style={styles.fillText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);}

const createStyles = (themeColors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: themeColors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: themeColors.text,
    marginBottom: 14,
  },
  banner: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 12,
    marginBottom: 12,
  },
  bannerText: { flex: 1, fontSize: 13, color: '#92400E', lineHeight: 20 },
  price: { fontWeight: '700' },
  sub: { fontSize: 13, color: themeColors.textSecondary, marginBottom: 20, lineHeight: 20 },
  btnRow: { flexDirection: 'row', gap: 12 },
  outlineBtn: {
    flex: 1, height: 48, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: '#D1D5DB',
    justifyContent: 'center', alignItems: 'center',
  },
  outlineText: { fontSize: 14, fontWeight: '600', color: themeColors.textSecondary },
  fillBtn: {
    flex: 1, height: 48, borderRadius: radius.md,
    backgroundColor: '#16A34A', justifyContent: 'center', alignItems: 'center',
  },
  fillText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});