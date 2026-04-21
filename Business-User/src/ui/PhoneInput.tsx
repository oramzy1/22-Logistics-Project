// src/ui/PhoneInput.tsx
import React, { useState } from 'react';
import {
  FlatList, Modal, Platform, StyleSheet,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { Text } from '../../components/AppText';
import { ChevronDown, X } from 'lucide-react-native';

const COUNTRIES = [
  { code: '+234', flag: '🇳🇬', name: 'Nigeria',        iso: 'NG' },
  { code: '+1',   flag: '🇺🇸', name: 'United States',  iso: 'US' },
  { code: '+44',  flag: '🇬🇧', name: 'United Kingdom', iso: 'GB' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana',          iso: 'GH' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya',          iso: 'KE' },
  { code: '+27',  flag: '🇿🇦', name: 'South Africa',   iso: 'ZA' },
  { code: '+251', flag: '🇪🇹', name: 'Ethiopia',       iso: 'ET' },
  { code: '+255', flag: '🇹🇿', name: 'Tanzania',       iso: 'TZ' },
  { code: '+256', flag: '🇺🇬', name: 'Uganda',         iso: 'UG' },
  { code: '+237', flag: '🇨🇲', name: 'Cameroon',       iso: 'CM' },
  { code: '+225', flag: '🇨🇮', name: "Côte d'Ivoire",  iso: 'CI' },
  { code: '+33',  flag: '🇫🇷', name: 'France',         iso: 'FR' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany',        iso: 'DE' },
  { code: '+91',  flag: '🇮🇳', name: 'India',          iso: 'IN' },
  { code: '+86',  flag: '🇨🇳', name: 'China',          iso: 'CN' },
  { code: '+971', flag: '🇦🇪', name: 'UAE',            iso: 'AE' },
];

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function PhoneInput({ value, onChangeText, placeholder = 'Phone number' }: Props) {
  const [selected, setSelected] = useState(COUNTRIES[0]); // Nigeria default
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.includes(search)
  );

  return (
    <View style={s.wrapper}>
      {/* Country picker trigger */}
      <TouchableOpacity style={s.picker} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={s.flag}>{selected.flag}</Text>
        <Text style={s.code}>{selected.code}</Text>
        <ChevronDown size={14} color="#9CA3AF" />
      </TouchableOpacity>

      <View style={s.divider} />

      {/* Number input */}
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType="phone-pad"
      />

      {/* Picker modal */}
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Select Country Code</Text>
              <TouchableOpacity onPress={() => { setOpen(false); setSearch(''); }}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={s.search}
              placeholder="Search country..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              autoFocus
            />

            <FlatList
              data={filtered}
              keyExtractor={i => i.iso}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[s.countryRow, selected.iso === item.iso && s.countryRowActive]}
                  onPress={() => { setSelected(item); setOpen(false); setSearch(''); }}
                  activeOpacity={0.75}
                >
                  <Text style={s.countryFlag}>{item.flag}</Text>
                  <Text style={s.countryName}>{item.name}</Text>
                  <Text style={s.countryCode}>{item.code}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#F3F4F6' }} />}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Returns the full number with country code for API submission
export function usePhoneWithCode(localNumber: string, countryCode: string) {
  return `${countryCode}${localNumber.replace(/^0/, '')}`;
}

const s = StyleSheet.create({
  wrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
    height: 48, backgroundColor: '#FFF', overflow: 'hidden',
  },
  picker: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, gap: 4,
  },
  flag: { fontSize: 20 },
  code: { fontSize: 13, fontWeight: '600', color: '#374151' },
  divider: { width: 1, height: 28, backgroundColor: '#E5E7EB', marginHorizontal: 6 },
  input: { flex: 1, fontSize: 14, color: '#111827', paddingRight: 12 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: Platform.OS === 'ios' ? 44 : 28, maxHeight: '75%',
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: '#0B1B2B' },
  search: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
    paddingHorizontal: 12, height: 44, fontSize: 14,
    color: '#111827', marginBottom: 12,
  },
  countryRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 4,
  },
  countryRowActive: { backgroundColor: '#FDF8EE', borderRadius: 8 },
  countryFlag: { fontSize: 22, marginRight: 12 },
  countryName: { flex: 1, fontSize: 14, color: '#374151', fontWeight: '500' },
  countryCode: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
});