import React from 'react';
import { Pressable, StyleSheet, ActivityIndicator, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Text } from '../../components/AppText';

import { colors, radius, spacing } from './theme';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'dark';
  loading?: boolean;
  disabled?: boolean;
  marginTop?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  marginTop = false,
  style,
  textStyle,
}: Props) {
  const isOutline = variant === 'outline';
  const isDark = variant === 'dark';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        isOutline && styles.outline,
        isDark && styles.dark,
        isDisabled && styles.disabled,
        pressed && !isDisabled && { opacity: 0.85 },
        marginTop && { marginTop: spacing.md },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isDark ? '#fff' : '#3A2A00'}
        />
      ) : (
        <Text
          style={[
            styles.text,
            isOutline && styles.textOutline,
            isDark && styles.textDark,
            isDisabled && styles.textDisabled,
            textStyle
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: spacing.md,
  },

  text: {
    fontWeight: '800',
    color: '#3A2A00',
    fontSize: 14,
  },

  outline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.goldSoft,
  },

  textOutline: {
    color: '#3A2A00',
  },

  dark: {
    backgroundColor: '#111827',
  },

  textDark: {
    color: '#fff',
  },

  disabled: {
    opacity: 0.5,
  },

  textDisabled: {
    color: '#888',
  },
});