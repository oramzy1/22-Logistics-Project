import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export const LANGUAGES = [
  { code: 'en', label: 'English',  nativeLabel: 'English' },
  { code: 'ha', label: 'Hausa',    nativeLabel: 'Hausa' },
  { code: 'ig', label: 'Igbo',     nativeLabel: 'Igbo' },
  { code: 'yo', label: 'Yoruba',   nativeLabel: 'Yorùbá' },
  { code: 'fr', label: 'French',   nativeLabel: 'Français' },
  { code: 'ar', label: 'Arabic',   nativeLabel: 'العربية' },
] as const;

export type LangCode = typeof LANGUAGES[number]['code'];

// ── Translations ───────────────────────────────────────────────
// Add keys as needed. Keep en as the source of truth.
const translations: Record<LangCode, Record<string, string>> = {
  en: {
    account: 'Account',
    edit_profile: 'Edit Profile',
    change_email: 'Change Email',
    change_password: 'Change Password',
    notifications: 'Notifications',
    preferences: 'Preferences',
    support: 'Support',
    legal: 'Legal',
    danger_zone: 'Danger Zone',
    sign_out: 'Sign Out',
    deactivate: 'Deactivate Account',
    delete_account: 'Delete Account',
    language: 'Language',
    dark_mode: 'Dark Mode',
    help_center: 'Help Center',
    faqs: 'FAQs',
    contact_support: 'Contact Support',
    report_issue: 'Report an Issue',
    terms: 'Terms & Condition',
    privacy: 'Privacy Policy',
    trip_updates: 'Trip Updates',
    driver_alerts: 'Driver Arrival Alerts',
    payment_confirm: 'Payment Confirmation',
    promotions: 'Promotions',
    booking_trips: 'Booking & Trips',
    active_bookings: 'Active Bookings',
    trip_history: 'Trip History',
    cancelled_trips: 'Cancelled Trips',
    payment: 'Payment',
    payment_method: 'Payment Method',
    transaction_history: 'Transaction History',
    save: 'Save',
    cancel: 'Cancel',
    full_name: 'Full Name',
    phone_number: 'Phone Number',
    send_request: 'Send Request',
    describe_issue: 'Describe the issue...',
    attach_screenshot: 'Attach screenshot',
  },
  ha: {
    account: 'Asusun',
    edit_profile: 'Gyara Bayanai',
    change_email: 'Canza Imel',
    change_password: 'Canza Kalmar Sirri',
    notifications: 'Sanarwa',
    preferences: 'Zaɓuɓɓuka',
    support: 'Taimako',
    legal: 'Doka',
    danger_zone: 'Yankin Haɗari',
    sign_out: 'Fita',
    deactivate: 'Kashe Asusun',
    delete_account: 'Goge Asusun',
    language: 'Harshe',
    dark_mode: 'Yanayin Duhun',
    help_center: 'Cibiyar Taimako',
    faqs: 'Tambayoyin Yau da Kullum',
    contact_support: 'Tuntuɓi Tallafi',
    report_issue: 'Bayar da Rahoto',
    terms: 'Sharuɗɗa',
    privacy: 'Manufar Sirri',
    trip_updates: 'Sabuntawar Tafiya',
    driver_alerts: 'Faɗakarwar Direba',
    payment_confirm: 'Tabbatarwar Biyan Kuɗi',
    promotions: 'Ci Gaba',
    booking_trips: 'Ajiye & Tafiya',
    active_bookings: 'Ajiye na Yanzu',
    trip_history: 'Tarihin Tafiya',
    cancelled_trips: 'Tafiye-tafiye da aka Soke',
    payment: 'Biyan Kuɗi',
    payment_method: 'Hanyar Biyan Kuɗi',
    transaction_history: 'Tarihin Ma\'amala',
    save: 'Ajiye',
    cancel: 'Soke',
    full_name: 'Sunan Cikakke',
    phone_number: 'Lambar Waya',
    send_request: 'Aika Buƙata',
    describe_issue: 'Bayyana matsalar...',
    attach_screenshot: 'Haɗa hoton allo',
  },
  ig: {
    account: 'Akaụntụ',
    edit_profile: 'Dezie Profaịlụ',
    change_email: 'Gbanwee Email',
    change_password: 'Gbanwee Paswọọdụ',
    notifications: 'Ọkwa',
    preferences: 'Mmasị',
    support: 'Nkwado',
    legal: 'Iwu',
    danger_zone: 'Mpaghara Ihe Ize Ndụ',
    sign_out: 'Pụọ Ọnụ',
    deactivate: 'Mechie Akaụntụ',
    delete_account: 'Hichapụ Akaụntụ',
    language: 'Asụsụ',
    dark_mode: 'Ọnọdụ Ọchịchọ',
    help_center: 'Ebe Enyemaka',
    faqs: 'Ajụjụ a na-ajụkarị',
    contact_support: 'Kpọtụrụ Nkwado',
    report_issue: 'Kọọ Nsogbu',
    terms: 'Usoro na Ọnọdụ',
    privacy: 'Amụma Nzuzo',
    trip_updates: 'Mmelite Njem',
    driver_alerts: 'Ọkwa Ọbịbị Onye Ọzụzụ',
    payment_confirm: 'Nkwenye Ịkwụ Ụgwọ',
    promotions: 'Mbupu',
    booking_trips: 'Ndekọ & Njem',
    active_bookings: 'Ndekọ Dị Ndụ',
    trip_history: 'Akụkọ Ihe Mere Eme Njem',
    cancelled_trips: 'Njem e wepụrụ',
    payment: 'Ịkwụ Ụgwọ',
    payment_method: 'Ụzọ Ịkwụ Ụgwọ',
    transaction_history: 'Akụkọ Ihe Mere Eme Azụmahịa',
    save: 'Chekwaa',
    cancel: 'Kagbuo',
    full_name: 'Aha Nke Ọha',
    phone_number: 'Nọmba Ekwentị',
    send_request: 'Zipu Arịọ',
    describe_issue: 'Kọwaa nsogbu...',
    attach_screenshot: 'Tinye ihe odide',
  },
  yo: {
    account: 'Àkáùntì',
    edit_profile: 'Ṣatunkọ Profaili',
    change_email: 'Yí Imeeli Padà',
    change_password: 'Yí Ọ̀rọ̀ Aṣínà Padà',
    notifications: 'Ìwífún',
    preferences: 'Àwọn Aṣayan',
    support: 'Àtìlẹyìn',
    legal: 'Òfin',
    danger_zone: 'Agbègbè Ewu',
    sign_out: 'Jáde',
    deactivate: 'Pa Àkáùntì Run Ní Ìgbà díẹ',
    delete_account: 'Pa Àkáùntì Run Pátápátá',
    language: 'Èdè',
    dark_mode: 'Ipo Òkùnkùn',
    help_center: 'Àárín Ìrànwọ́',
    faqs: 'Àwọn Ìbéèrè Tí a Máa Ń Béèrè',
    contact_support: 'Kan Sí Àtìlẹyìn',
    report_issue: 'Jabo Ìṣòro',
    terms: 'Àwọn Ìlànà',
    privacy: 'Ìlànà Àṣírí',
    trip_updates: 'Àwọn Ìmúdójúìwọ̀n Ìrìn-àjò',
    driver_alerts: 'Àwọn Ìkìlọ̀ Awakọ̀',
    payment_confirm: 'Àmúdájú Ìsanwó',
    promotions: 'Àwọn Ìgbéraga',
    booking_trips: 'Àyàtò & Ìrìn-àjò',
    active_bookings: 'Àwọn Àyàtò Tó Wà Lọwọ',
    trip_history: 'Ìtàn Ìrìn-àjò',
    cancelled_trips: 'Àwọn Ìrìn-àjò Tí a Fagilé',
    payment: 'Ìsanwó',
    payment_method: 'Ọ̀nà Ìsanwó',
    transaction_history: 'Ìtàn Ìdúnàádúrà',
    save: 'Fi Pamọ́',
    cancel: 'Fagilé',
    full_name: 'Orúkọ Kíkún',
    phone_number: 'Nọ́mbà Fóònù',
    send_request: 'Fi Ìbéèrè Ránṣẹ́',
    describe_issue: 'Ṣàpèjúwe ìṣòro naa...',
    attach_screenshot: 'So àwòrán kan pọ̀',
  },
  fr: {
    account: 'Compte',
    edit_profile: 'Modifier le Profil',
    change_email: 'Changer l\'Email',
    change_password: 'Changer le Mot de Passe',
    notifications: 'Notifications',
    preferences: 'Préférences',
    support: 'Support',
    legal: 'Légal',
    danger_zone: 'Zone Danger',
    sign_out: 'Se Déconnecter',
    deactivate: 'Désactiver le Compte',
    delete_account: 'Supprimer le Compte',
    language: 'Langue',
    dark_mode: 'Mode Sombre',
    help_center: 'Centre d\'Aide',
    faqs: 'Questions Fréquentes',
    contact_support: 'Contacter le Support',
    report_issue: 'Signaler un Problème',
    terms: 'Conditions d\'Utilisation',
    privacy: 'Politique de Confidentialité',
    trip_updates: 'Mises à jour de Trajet',
    driver_alerts: 'Alertes d\'Arrivée Chauffeur',
    payment_confirm: 'Confirmation de Paiement',
    promotions: 'Promotions',
    booking_trips: 'Réservations & Trajets',
    active_bookings: 'Réservations Actives',
    trip_history: 'Historique des Trajets',
    cancelled_trips: 'Trajets Annulés',
    payment: 'Paiement',
    payment_method: 'Méthode de Paiement',
    transaction_history: 'Historique des Transactions',
    save: 'Enregistrer',
    cancel: 'Annuler',
    full_name: 'Nom Complet',
    phone_number: 'Numéro de Téléphone',
    send_request: 'Envoyer la Demande',
    describe_issue: 'Décrivez le problème...',
    attach_screenshot: 'Joindre une capture',
  },
  ar: {
    account: 'الحساب',
    edit_profile: 'تعديل الملف الشخصي',
    change_email: 'تغيير البريد الإلكتروني',
    change_password: 'تغيير كلمة المرور',
    notifications: 'الإشعارات',
    preferences: 'التفضيلات',
    support: 'الدعم',
    legal: 'قانوني',
    danger_zone: 'منطقة الخطر',
    sign_out: 'تسجيل الخروج',
    deactivate: 'تعطيل الحساب',
    delete_account: 'حذف الحساب',
    language: 'اللغة',
    dark_mode: 'الوضع الداكن',
    help_center: 'مركز المساعدة',
    faqs: 'الأسئلة الشائعة',
    contact_support: 'اتصل بالدعم',
    report_issue: 'الإبلاغ عن مشكلة',
    terms: 'الشروط والأحكام',
    privacy: 'سياسة الخصوصية',
    trip_updates: 'تحديثات الرحلة',
    driver_alerts: 'تنبيهات وصول السائق',
    payment_confirm: 'تأكيد الدفع',
    promotions: 'العروض',
    booking_trips: 'الحجوزات والرحلات',
    active_bookings: 'الحجوزات النشطة',
    trip_history: 'تاريخ الرحلات',
    cancelled_trips: 'الرحلات الملغاة',
    payment: 'الدفع',
    payment_method: 'طريقة الدفع',
    transaction_history: 'تاريخ المعاملات',
    save: 'حفظ',
    cancel: 'إلغاء',
    full_name: 'الاسم الكامل',
    phone_number: 'رقم الهاتف',
    send_request: 'إرسال الطلب',
    describe_issue: 'صِف المشكلة...',
    attach_screenshot: 'إرفاق لقطة شاشة',
  },
};

// ── Context ────────────────────────────────────────────────────
interface I18nContextValue {
  language: LangCode;
  setLanguage: (code: LangCode) => Promise<void>;
  t: (key: string) => string;
  isRTL: boolean;
}

import { createContext as _createContext, useContext as _useContext } from 'react';
// Export these so App can wrap with <I18nProvider>
export const I18nContext = createContext<I18nContextValue>({
  language: 'en',
  setLanguage: async () => {},
  t: (k) => k,
  isRTL: false,
});

const STORAGE_KEY = '@22log_lang';
const RTL_LANGS: LangCode[] = ['ar'];

export function useI18nState(): I18nContextValue {
  const [language, setLang] = useState<LangCode>('en');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored && LANGUAGES.find((l) => l.code === stored)) {
        setLang(stored as LangCode);
      }
    });
  }, []);

  const setLanguage = useCallback(async (code: LangCode) => {
    setLang(code);
    await AsyncStorage.setItem(STORAGE_KEY, code);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[language]?.[key] ?? translations.en[key] ?? key;
    },
    [language]
  );

  return { language, setLanguage, t, isRTL: RTL_LANGS.includes(language) };
}

export function useTranslation() {
  return useContext(I18nContext);
}