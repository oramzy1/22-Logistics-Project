import React, { useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import RNDateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Text } from '../../components/AppText';
import { colors, radius, spacing } from './theme';
import { useAppTheme } from "./useAppTheme";

type Props = {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  mode: 'date' | 'time';
  placeholder?: string;
  minimumDate?: Date;
  icon?: React.ReactNode;
};

export function DateTimePickerInput({
  label,
  value,
  onChange,
  mode,
  placeholder,
  minimumDate,
  icon,
}: Props) {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value ?? new Date());
    const { colors: themeColors } = useAppTheme();
    const styles = createStyles(themeColors);

  const displayValue = value
    ? mode === 'date'
      ? value.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
      : value.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
    : null;

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (event.type === 'set' && selected) onChange(selected);
    } else {
      if (selected) setTempDate(selected);
    }
  };

  const handleConfirmIOS = () => {
    onChange(tempDate);
    setShow(false);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShow(true)} activeOpacity={0.7}>
        <Text style={[styles.valueText, !displayValue && styles.placeholder]}>
          {displayValue ?? (placeholder ?? `Select ${mode}`)}
        </Text>
        {icon && <View style={styles.icon}>{icon}</View>}
      </TouchableOpacity>

      {/* Android: renders inline when show=true */}
      {Platform.OS === 'android' && show && (
        <RNDateTimePicker
          value={tempDate}
          mode={mode}
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
        />
      )}

      {/* iOS: modal with confirm button */}
      {Platform.OS === 'ios' && (
        <Modal visible={show} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  {mode === 'date' ? 'Select Date' : 'Select Time'}
                </Text>
                <TouchableOpacity onPress={handleConfirmIOS}>
                  <Text style={styles.modalConfirm}>Confirm</Text>
                </TouchableOpacity>
              </View>
              <RNDateTimePicker
                value={tempDate}
                mode={mode}
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                style={{ backgroundColor: '#fff' }}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const createStyles = (themeColors: any) => StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: themeColors.textSecondary,
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: themeColors.border,
    paddingHorizontal: 14,
    backgroundColor: themeColors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueText: {
    fontSize: 14,
    color: themeColors.text,
    flex: 1,
  },
  placeholder: {
    color: themeColors.textSecondary,
  },
  icon: { marginLeft: 8 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  modalCancel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  modalConfirm: { fontSize: 14, color: '#0066FF', fontWeight: '700' },
});