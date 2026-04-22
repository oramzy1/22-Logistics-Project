import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getKeyForValue } from '@/src/i18n';

function translateChildren(
  t: (key: string) => string,
  children: React.ReactNode
): React.ReactNode {
  if (typeof children === 'string') {
    const key = getKeyForValue(children); // "Edit Profile" → "edit_profile"
    return t(key);                        // "edit_profile" → "Gyara Bayanai" in Hausa
  }
  if (Array.isArray(children)) {
    return children.map((child) =>
      typeof child === 'string' ? translateChildren(t, child) : child
    );
  }
  return children;
}


export function Text(props: TextProps) {
  const { t } = useTranslation();
  const flatStyle = StyleSheet.flatten(props.style) ?? {};
  const { fontWeight, fontFamily: _fontFamily, ...remainingStyle } = flatStyle as any;
  const weight = fontWeight ? String(fontWeight) : undefined;

  let fontFamilyStyle: { fontFamily?: string } = { fontFamily: 'Grotesque-Regular' };
  if (weight === 'bold' || weight === '700' || weight === '800' || weight === '900') {
    fontFamilyStyle = { fontFamily: 'Grotesque-Bold' };
  } else if (weight === '600') {
    fontFamilyStyle = { fontFamily: 'Grotesque-SemiBold' };
  } else if (weight === '500') {
    fontFamilyStyle = { fontFamily: 'Grotesque-Medium' };
  } else if (!weight) {
    fontFamilyStyle = {};
  }

  return (
    <RNText
      {...props}
      style={[remainingStyle, fontFamilyStyle]}
    >
      {translateChildren(t, props.children)}
    </RNText>
  );
}
