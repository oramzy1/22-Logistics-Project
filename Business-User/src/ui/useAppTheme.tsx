import { useColorScheme } from 'react-native';

export const lightColors = {
  navy: '#0B1B2B',
  background: '#FFFFFF',
  card: '#FFFFFF',
  cardPrimary: '#F3F4F6',
  cardSecondary: '#F3F4F6',
  card1: '#1A46A7',
  card3: '#1A46A7',
  card2: '#F97316',
  text: '#111827',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  muted: '#6B7280',
  border: '#D1D5DB',
  softBorder: '#E5E7EB',
  inputBg: '#FFFFFF',
  sectionBg: '#F3F4F6',
  gold: '#E4C77B',
  success: '#16A34A',
  danger: '#EF4444',
  warning: '#F59E0B',
};

export const darkColors = { 
  navy: '#121212',
  background: '#121212',
  card: '#1e1e1e',
  card1: '#1e1e1e',
  card2: '#2c2c2c',
  card3: '#2c2c2c',
  cardPrimary: '#1e1e1e',
  cardSecondary: '#2c2c2c',
  text: '#F9FAFB',
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
  muted: '#9CA3AF',
  border: '#2D3F52',
  softBorder: '#1F3044',
  inputBg: '#152232',
  sectionBg: '#152232',
  gold: '#E4C77B',
  success: '#16A34A',
  danger: '#EF4444',
  warning: '#F59E0B',
};

export function useAppTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return {
    isDark,
    colors: isDark ? darkColors : lightColors,
  };
}