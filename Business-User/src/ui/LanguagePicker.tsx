import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { Check, Globe, X } from 'lucide-react-native';
import { Text } from '../../components/AppText';
import { LANGUAGES, LangCode, useTranslation } from '@/src/i18n/useTranslation';

export function LanguagePickerItem() {
  const { language, setLanguage, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === language);

  return (
    <>
      {/* The list row — same look as other ListItems */}
      <TouchableOpacity
        style={s.row}
        onPress={() => setOpen(true)}
        activeOpacity={0.75}
      >
        <View style={s.left}>
          <Globe size={18} color="#6B7280" style={{ marginRight: 16 }} />
          <Text style={s.title}>{t('language')}</Text>
        </View>
        <Text style={s.value}>{current?.nativeLabel ?? 'English'}</Text>
      </TouchableOpacity>

      {/* Picker sheet */}
      <Modal transparent animationType="slide" visible={open} onRequestClose={() => setOpen(false)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[s.langRow, language === lang.code && s.langRowActive]}
                  onPress={async () => {
                    await setLanguage(lang.code as LangCode);
                    setOpen(false);
                  }}
                  activeOpacity={0.75}
                >
                  <View>
                    <Text style={[s.langNative, language === lang.code && { color: '#0B1B2B' }]}>
                      {lang.nativeLabel}
                    </Text>
                    {lang.nativeLabel !== lang.label && (
                      <Text style={s.langEnglish}>{lang.label}</Text>
                    )}
                  </View>
                  {language === lang.code && <Check size={18} color="#0B1B2B" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 14, color: '#374151', fontWeight: '500' },
  value: { fontSize: 13, color: '#9CA3AF' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: '#0B1B2B' },

  langRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F9F9F9',
    paddingHorizontal: 4,
  },
  langRowActive: { backgroundColor: '#FDF8EE', borderRadius: 8, paddingHorizontal: 10 },
  langNative: { fontSize: 15, fontWeight: '600', color: '#374151' },
  langEnglish: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
});