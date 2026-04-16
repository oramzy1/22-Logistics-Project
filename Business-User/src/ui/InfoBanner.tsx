import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, text } from './theme';
import { CarFront, Info, TriangleAlert } from 'lucide-react-native';

export function InfoBanner({ text: message, variant }: { text: string; variant: 'warning' | 'info' | 'basic' }) {
  const bg = variant === 'warning' || variant === 'basic' ? '#FFF7ED' : '#EFF6FF';
  const border = variant === 'warning' || variant === 'basic' ? '#FED7AA' : '#BFDBFE';
  const icon = variant === 'warning' ? <TriangleAlert size={17} color={colors.text} /> : variant === 'basic' ? <CarFront size={17} color={colors.text} /> : <Info size={17} color={colors.text} />;

  return (
    <View style={[styles.root, { backgroundColor: bg, borderColor: border }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    gap: 10,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
  },
  text: {
    ...text.small,
    color: colors.text,
    flex: 1,
    lineHeight: 16,
  },
});
