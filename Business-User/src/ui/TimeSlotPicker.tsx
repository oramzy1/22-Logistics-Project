// src/ui/TimeSlotPicker.tsx
import React, { useMemo } from "react";
import { ScrollView, TouchableOpacity, View, StyleSheet } from "react-native";
import { Text } from "../../components/AppText";
import { useAppTheme } from "./useAppTheme";
import {
  OPERATING_START_HOUR,
  OPERATING_END_HOUR,
  getMinimumPickupDateTime,
  formatTime,
} from "@/src/utils/timeSlots";
import { showToast } from "@/app/utils/toast";

type Props = {
  label: string;
  pickupDate: Date | null;
  value: Date | null;
  onSelect: (time: Date) => void;
  stepMinutes?: number;
};

export function TimeSlotPicker({
  label,
  pickupDate,
  value,
  onSelect,
  stepMinutes = 15,
}: Props) {
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);

  const slots = useMemo(() => {
    if (!pickupDate) return [];
    const minAllowed = getMinimumPickupDateTime();
    const out: { time: Date; disabled: boolean }[] = [];

    for (
      let mins = OPERATING_START_HOUR * 60;
      mins <= OPERATING_END_HOUR * 60;
      mins += stepMinutes
    ) {
      const slot = new Date(
        pickupDate.getFullYear(),
        pickupDate.getMonth(),
        pickupDate.getDate(),
        Math.floor(mins / 60),
        mins % 60,
      );
      out.push({ time: slot, disabled: slot.getTime() < minAllowed.getTime() });
    }
    return out;
  }, [pickupDate, stepMinutes]);

  const handlePress = (time: Date, disabled: boolean) => {
    if (disabled) {
      const minAllowed = getMinimumPickupDateTime();
      showToast.error(
        `Rides need 2 hours' notice — earliest available today is ${formatTime(minAllowed)}.`,
      );
      return; // reject on tap, no state change, no waiting for a modal to close
    }
    onSelect(time);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {slots.map(({ time, disabled }) => {
          const active = value?.getTime() === time.getTime();
          return (
            <TouchableOpacity
              key={time.getTime()}
              onPress={() => handlePress(time, disabled)}
              activeOpacity={disabled ? 1 : 0.7}
              style={[
                styles.chip,
                disabled && styles.chipDisabled,
                active && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  disabled && styles.chipTextDisabled,
                  active && styles.chipTextActive,
                ]}
              >
                {formatTime(time)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (themeColors: any) =>
  StyleSheet.create({
    wrapper: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: "600", color: themeColors.textSecondary, marginBottom: 8 },
    chip: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: themeColors.border,
      marginRight: 8,
      backgroundColor: themeColors.background,
    },
    chipDisabled: { opacity: 0.35 },
    chipActive: { borderColor: themeColors.gold, backgroundColor: themeColors.cardPrimary },
    chipText: { fontSize: 13, color: themeColors.text },
    chipTextDisabled: { color: themeColors.textSecondary },
    chipTextActive: { fontWeight: "700" },
  });