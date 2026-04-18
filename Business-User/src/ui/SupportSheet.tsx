// src/ui/SupportSheet.tsx
// Drop-in bottom sheet for Help Center, FAQs, Contact Support, Report an Issue
// Requires NO new packages — uses the existing Modal pattern from Account tabs.

import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  ChevronDown,
  Image as ImageIcon,
  Phone,
  Mail,
  X,
} from 'lucide-react-native';
import { Text } from '../../components/AppText';
import { UserService } from '@/api/user.service';
import { showToast } from '@/app/utils/toast';

// ── Types ──────────────────────────────────────────────────────
export type SupportType = 'contact' | 'report' | 'help' | 'faq' | null;

const SUBJECTS = [
  'Booking Issue',
  'Payment Problem',
  'Driver Complaint',
  'App Bug / Error',
  'Account Issue',
  'Other',
];

const FAQS = [
  { q: 'How do I book a ride?', a: 'Tap the "Book" tab, select your package, set pickup/dropoff locations, choose a date & time, then proceed to payment.' },
  { q: 'Can I cancel a booking?', a: 'Yes. Go to your active booking and tap "Cancel Booking". Cancellations after driver assignment may incur a fee.' },
  { q: 'How do I extend my trip?', a: 'While your trip is in progress, tap "Extend Trip" on the active booking screen and choose additional hours.' },
  { q: 'What payment methods are accepted?', a: 'We accept card payments and bank transfers via Paystack.' },
  { q: 'How do I rate my driver?', a: 'After a trip is marked Completed, a rating prompt appears on your booking screen.' },
];

// ── Contact Info Card (Image 1 style) ──────────────────────────
function ContactCard() {
  return (
    <View style={s.contactCard}>
      <Text style={s.contactCardTitle}>Contact Us</Text>
      <TouchableOpacity
        style={s.contactRow}
        onPress={() => Linking.openURL('tel:+1238095832217')}
        activeOpacity={0.7}
      >
        <View style={s.contactIconBox}>
          <Phone size={18} color="#6B7280" />
        </View>
        <View>
          <Text style={s.contactLabel}>Our 24/7 customer service</Text>
          <Text style={s.contactValue}>+1238095832217</Text>
        </View>
      </TouchableOpacity>

      <View style={s.contactDivider} />

      <TouchableOpacity
        style={s.contactRow}
        onPress={() => Linking.openURL('mailto:hello@22logistics.com')}
        activeOpacity={0.7}
      >
        <View style={s.contactIconBox}>
          <Mail size={18} color="#6B7280" />
        </View>
        <View>
          <Text style={s.contactLabel}>Write us at</Text>
          <Text style={s.contactValue}>hello@22logistics.com</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// ── Support Form (Image 2 style) ───────────────────────────────
function SupportForm({ userEmail, userName }: { userEmail: string; userName: string }) {
  const [subject, setSubject] = useState('');
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [subjectError, setSubjectError] = useState(false);

  const pickScreenshot = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });
    if (!result.canceled) setScreenshot(result.assets[0].uri);
  };

  const handleSend = async () => {
    if (!subject) { setSubjectError(true); return; }
    if (!description.trim()) {
      Alert.alert('Missing info', 'Please describe the issue.');
      return;
    }
    setLoading(true);
    try {
      await UserService.sendSupportRequest({ subject, description, screenshotUri: screenshot ?? undefined });
      showToast.success("Request sent! We'll get back to you soon.");
      setSubject('');
      setDescription('');
      setScreenshot(null);
    } catch {
      showToast.error('Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Text style={s.formTitle}>Contact Support</Text>
      <Text style={s.formSubtitle}>We're here to help. Tell us what's going on.</Text>

      {/* Subject Picker */}
      <TouchableOpacity
        style={[s.subjectBtn, subjectError && s.subjectBtnError]}
        onPress={() => { setSubjectOpen(!subjectOpen); setSubjectError(false); }}
        activeOpacity={0.8}
      >
        <Text style={[s.subjectBtnText, !subject && { color: '#9CA3AF' }]}>
          {subject || 'Subject'}
        </Text>
        <ChevronDown size={18} color="#9CA3AF" />
      </TouchableOpacity>
      {subjectError && (
        <Text style={s.subjectErrorText}>⊘ Please describe the issue so we can help you.</Text>
      )}
      {subjectOpen && (
        <View style={s.dropdownList}>
          {SUBJECTS.map((item) => (
            <TouchableOpacity
              key={item}
              style={s.dropdownItem}
              onPress={() => { setSubject(item); setSubjectOpen(false); }}
            >
              <Text style={[s.dropdownItemText, subject === item && { color: '#0B1B2B', fontWeight: '700' }]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Description */}
      <TextInput
        style={s.textarea}
        placeholder="Describe the issue...."
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        value={description}
        onChangeText={setDescription}
      />

      {/* Screenshot */}
      <TouchableOpacity style={s.screenshotBox} onPress={pickScreenshot} activeOpacity={0.8}>
        {screenshot ? (
          <Image source={{ uri: screenshot }} style={s.screenshotPreview} resizeMode="cover" />
        ) : (
          <View style={s.screenshotPlaceholder}>
            <ImageIcon size={22} color="#9CA3AF" />
            <Text style={s.screenshotText}>
              Attach screenshot <Text style={{ color: '#9CA3AF', fontWeight: '400' }}>(optional)</Text>
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.sendBtn, loading && { opacity: 0.7 }]}
        onPress={handleSend}
        disabled={loading}
        activeOpacity={0.85}
      >
        <Text style={s.sendBtnText}>{loading ? 'Sending...' : 'Send Request'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── FAQ List ───────────────────────────────────────────────────
function FAQList() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={s.formTitle}>Frequently Asked Questions</Text>
      {FAQS.map((item, i) => (
        <TouchableOpacity
          key={i}
          style={s.faqItem}
          onPress={() => setOpen(open === i ? null : i)}
          activeOpacity={0.75}
        >
          <View style={s.faqHeader}>
            <Text style={s.faqQ}>{item.q}</Text>
            <ChevronDown
              size={16}
              color="#6B7280"
              style={{ transform: [{ rotate: open === i ? '180deg' : '0deg' }] }}
            />
          </View>
          {open === i && <Text style={s.faqA}>{item.a}</Text>}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ── Main exported component ────────────────────────────────────
interface Props {
  type: SupportType;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

export function SupportSheet({ type, onClose, userEmail = '', userName = '' }: Props) {
  if (!type) return null;

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.overlay}
      >
        <View style={s.sheet}>
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <X size={20} color="#6B7280" />
          </TouchableOpacity>

          {type === 'contact' && <ContactCard />}
          {(type === 'report' || type === 'help') && (
            <SupportForm userEmail={userEmail} userName={userName} />
          )}
          {type === 'faq' && <FAQList />}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
    maxHeight: '88%',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    marginBottom: 8,
    padding: 4,
  },

  // Contact card
  contactCard: { paddingTop: 8 },
  contactCardTitle: { fontSize: 17, fontWeight: '700', color: '#0B1B2B', marginBottom: 20 },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  contactIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#F9F6F0',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14, borderWidth: 1, borderColor: '#E5E7EB',
  },
  contactLabel: { fontSize: 12, color: '#6B7280', marginBottom: 3 },
  contactValue: { fontSize: 15, fontWeight: '700', color: '#0B1B2B' },
  contactDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },

  // Form
  formTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 6 },
  formSubtitle: { fontSize: 13, color: '#4B5563', marginBottom: 20 },
  subjectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 14, marginBottom: 4,
  },
  subjectBtnError: { borderColor: '#EF4444' },
  subjectBtnText: { fontSize: 14, color: '#111827', fontWeight: '500' },
  subjectErrorText: { fontSize: 12, color: '#EF4444', marginBottom: 12 },
  dropdownList: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    marginBottom: 12, overflow: 'hidden',
  },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dropdownItemText: { fontSize: 14, color: '#374151' },
  textarea: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    padding: 12, height: 130, fontSize: 14, color: '#111827',
    marginBottom: 12,
  },
  screenshotBox: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10,
    borderStyle: 'dashed', marginBottom: 20, overflow: 'hidden',
    minHeight: 72,
  },
  screenshotPlaceholder: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 20,
  },
  screenshotPreview: { width: '100%', height: 120 },
  screenshotText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  sendBtn: {
    backgroundColor: '#E4C77B', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginBottom: 8,
  },
  sendBtnText: { color: '#3E2723', fontWeight: '700', fontSize: 15 },

  // FAQ
  faqItem: {
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    paddingVertical: 14,
  },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { fontSize: 14, fontWeight: '600', color: '#111827', flex: 1, marginRight: 8 },
  faqA: { fontSize: 13, color: '#4B5563', lineHeight: 20, marginTop: 10 },
});