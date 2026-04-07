import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { AppSwitch } from './AppSwitch';
import { colors, radius, spacing, text } from './theme';

export function ToggleCard({
  title,
  value,
  onValueChange,
  children,
  style,
}: {
  title: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.head}>
        <Text style={styles.title}>{title}</Text>
        <AppSwitch value={value} onValueChange={onValueChange} />
      </View>
      <View style={{ marginTop: spacing.md }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: radius.xl,
    padding: spacing.lg,
    backgroundColor: '#fff',
  },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...text.h2, color: colors.text },
});
