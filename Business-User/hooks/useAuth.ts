// src/hooks/useOAuth.ts
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { AuthService } from '@/api/auth.service';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { showToast } from '@/app/utils/toast';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export function useOAuth(appType: 'user-app' | 'driver-app') {
  const { setAuthData, refreshUser } = useAuth();
  const router = useRouter();

  const [_, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  const handleOAuthSuccess = async (
    token: string,
    user: any,
    needsProfileCompletion: boolean
  ) => {
    await setAuthData(token, user);
    await refreshUser();
    if (needsProfileCompletion && appType === 'user-app') {
      // Driver signed in via OAuth but hasn't uploaded license yet
      router.replace('/(driver-auth)/complete-profile');
    } else {
      router.replace(appType === 'driver-app' ? '/(driver-tabs)' : '/(tabs)');
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await googlePromptAsync();
      if (result.type !== 'success') return;

      const { id_token } = result.params;
      const data = await AuthService.googleAuth({ idToken: id_token, appType });
      showToast.success('Signed in with Google!');
      await handleOAuthSuccess(data.token, data.user, data.needsProfileCompletion);
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Google sign-in failed');
    }
  };

  const signInWithApple = async () => {
    if (Platform.OS !== 'ios') return;
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const data = await AuthService.appleAuth({
        identityToken: credential.identityToken!,
        fullName: credential.fullName,
        appType,
      });
      showToast.success('Signed in with Apple!');
      await handleOAuthSuccess(data.token, data.user, data.needsProfileCompletion);
    } catch (err: any) {
      if (err.code !== 'ERR_CANCELED') {
        showToast.error(err?.response?.data?.message || 'Apple sign-in failed');
      }
    }
  };

  return { signInWithGoogle, signInWithApple };
}