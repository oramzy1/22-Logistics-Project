import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, text } from './theme';

export function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: 'pin' | 'flag';
}) {
  const ic = icon === 'flag' ? '📍' : '📌';
  return (
    <View style={styles.root}>
      <Text style={styles.icon}>{ic}</Text>
      <Text style={[text.small, { color: colors.muted, width: 110 }]}>{label}</Text>
      <Text style={[text.body, { fontWeight: '800', flex: 1, textAlign: 'right' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { width: 18 },
});
