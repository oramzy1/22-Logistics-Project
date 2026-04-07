import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from './theme';

export function StatusPill({ status }: { status: 'Successful' | 'Pay Later' | 'Monthly Billing' | 'Completed' }) {
  const { c } = getStyle(status);
  return (
    <View style={[styles.root, { borderColor: c }] }>
      <Text style={[styles.text, { color: c }]}>{status}</Text>
    </View>
  );
}

function getStyle(status: string) {
  if (status === 'Successful' || status === 'Completed') return { c: colors.success };
  if (status === 'Monthly Billing') return { c: '#F59E0B' };
  return { c: '#B45309' };
}

const styles = StyleSheet.create({
  root: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  text: { fontSize: 12, fontWeight: '800' },
});
