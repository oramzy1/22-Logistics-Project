import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { AuthService } from '@/api/auth.service';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { showToast } from '@/app/utils/toast';
import { Platform } from 'react-native';
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

const iosId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID 
const androidId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '552515162391-ekrt13fnht06vo0cmm4f1nbr5puqtkdd.apps.googleusercontent.com'
const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID

console.log('ios:', iosId, 'android:', androidId, 'web:', clientId)


export function useOAuth(appType: 'user-app' | 'driver-app') {
  const { setAuthData, refreshUser } = useAuth();
  const router = useRouter();

    const redirectUri = AuthSession.makeRedirectUri({
    native: Platform.select({
      ios: "com.vendoramarketplace.logisticsdriver:/oauthredirect",
      android: "com.vendoramarketplace.logisticsdriver:/oauthredirect",
    }),
    // useProxy: false,
  });

  const [_, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    clientId: clientId,
    iosClientId: iosId,
    androidClientId: androidId,
    redirectUri: redirectUri,
    scopes: ['profile', 'email'],
  });

  const handleOAuthSuccess = async (
    token: string,
    user: any,
    needsProfileCompletion: boolean
  ) => {
    await setAuthData(token, user);
    await refreshUser();
    if (needsProfileCompletion && appType === 'driver-app') {
      // Driver signed in via OAuth but hasn't uploaded license yet
      router.replace('/(auth)/complete-profile');
    } else {
      router.replace('/(tabs)');
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