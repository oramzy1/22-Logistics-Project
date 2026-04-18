import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useAppTheme } from '@/src/ui/useAppTheme';

export function Text(props: TextProps) {
  const flatStyle = StyleSheet.flatten(props.style) ?? {};
  const { fontWeight, fontFamily: _fontFamily, ...remainingStyle } = flatStyle as any;

  const weight = fontWeight ? String(fontWeight) : undefined;

  let fontFamilyStyle: { fontFamily?: string } = { fontFamily: 'Grotesque-Regular' }; // default

  if (weight === 'bold' || weight === '700' || weight === '800' || weight === '900') {
    fontFamilyStyle = { fontFamily: 'Grotesque-Bold' };
  } else if (weight === '600') {
    fontFamilyStyle = { fontFamily: 'Grotesque-SemiBold' };
  } else if (weight === '500') {
    fontFamilyStyle = { fontFamily: 'Grotesque-Medium' };
  } else if (!weight) {
    // No fontWeight specified — don't set fontFamily at all, inherit from parent
    fontFamilyStyle = {};
  }

  return (
    <RNText
      {...props}
      style={[remainingStyle, fontFamilyStyle]}
    />
  );
}