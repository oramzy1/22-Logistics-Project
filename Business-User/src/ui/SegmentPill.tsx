import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, text } from './theme';
import { Clock } from 'lucide-react-native';
import { useAppTheme } from './useAppTheme';

export function PillSegment({
  title,
  subtitle,
  active,
  onPress,
}: {
  title: string;
  subtitle?: string;
  active?: boolean;
  onPress?: () => void;
}) {
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);
  return (
    <Pressable onPress={onPress} style={[styles.root, active && styles.rootActive]}>
      <View style={[styles.icon, active && styles.iconActive]}>
        <Clock color={active ? '#fff' : themeColors.navy} size={10} />
      </View>
      <Text style={[styles.title]}>{title}</Text>
      {!!subtitle && <Text style={[styles.sub, active ? { color: themeColors.text }: { color: themeColors.text }]}>{subtitle}</Text>}
    </Pressable>
  );
}

const createStyles = (themeColors: any) => StyleSheet.create({
  root: {
    width: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.sm,
    backgroundColor: themeColors.background,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    borderWidth: 1,
    borderColor: themeColors.softBorder,
    elevation: 5,
  },
  rootActive: {
    borderColor: '#3B82F6',
  },
  icon: {
    width: 18,
    height: 18,
    borderRadius: 13,
    backgroundColor: '#E6F4FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconActive: {
    backgroundColor: colors.navy,
  },
  title: {
    ...text.small,
    fontWeight: '500',
    color: "#3B82F6"
  },
  sub: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
    color: themeColors.text
  },
});
