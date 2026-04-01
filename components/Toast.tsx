import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#10B981', borderRadius: 12, marginHorizontal: 16 }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{ fontFamily: 'Grotesque-SemiBold', fontSize: 14, color: '#111827' }}
      text2Style={{ fontFamily: 'Grotesque-Regular', fontSize: 12, color: '#6B7280' }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#EF4444', borderRadius: 12, marginHorizontal: 16 }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{ fontFamily: 'Grotesque-SemiBold', fontSize: 14, color: '#111827' }}
      text2Style={{ fontFamily: 'Grotesque-Regular', fontSize: 12, color: '#6B7280' }}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#E4C77B', borderRadius: 12, marginHorizontal: 16 }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{ fontFamily: 'Grotesque-SemiBold', fontSize: 14, color: '#111827' }}
      text2Style={{ fontFamily: 'Grotesque-Regular', fontSize: 12, color: '#6B7280' }}
    />
  ),
};