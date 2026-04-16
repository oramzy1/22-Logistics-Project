import { useColorScheme } from 'react-native';

export const lightColors = {
  navy: '#0B1B2B',
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#111827',
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
  navy: '#060F18',
  background: '#0B1B2B',
  card: '#1a2a3a',
  text: '#F9FAFB',
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