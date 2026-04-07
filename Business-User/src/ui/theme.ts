export const colors = {
  navy: '#0B1B2B',
  background: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  border: '#D1D5DB',
  softBorder: '#E5E7EB',

  gold: '#E4C77B',
  goldSoft: '#E9D28F',
  sky: '#9FE3FF',
  skySoft: '#CDEFFF',

  success: '#16A34A',
  danger: '#EF4444',
  warning: '#F59E0B',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
};

export const radius = {
  md: 12,
  lg: 16,
  xl: 22,
};

export const text = {
  h1: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
  },
  h2: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.text,
  },
  body: {
    fontSize: 14,
    color: colors.text,
  },
  small: {
    fontSize: 12,
    color: colors.text,
  },
  label: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.text,
  },
};
