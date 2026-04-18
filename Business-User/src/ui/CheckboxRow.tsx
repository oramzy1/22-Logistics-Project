import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from './useAppTheme';
import { colors, spacing, text } from './theme';

export function AppCheckboxRow({
  label,
  price,
  value,
  onValueChange,
  disabled,
}: {
  label: string;
  price: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {

  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);
  return (
    <Pressable
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={({ pressed }) => [styles.root, pressed && !disabled && { opacity: 0.85 }, disabled && { opacity: 0.5 }]}>
      <View style={[styles.box, value && styles.boxOn]}>
        {value ? <Text style={{ color: themeColors.textPrimary, fontWeight: '900' }}>✓</Text> : null}
      </View>
      <Text style={[text.body, { flex: 1 }, { color: themeColors.textPrimary }]}>{label}</Text>
      <Text style={[text.body, { color: themeColors.textSecondary, fontWeight: '700' }]}>{price}</Text>
    </Pressable>
  );
}

const createStyles = (themeColors: any) => StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  box: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.background,
  },
  boxOn: {
    backgroundColor: themeColors.navy,
    borderColor: themeColors.navy,
  },
});
