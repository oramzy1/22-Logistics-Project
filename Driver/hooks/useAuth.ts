// import * as Google from 'expo-auth-session/providers/google';
// import * as AppleAuthentication from 'expo-apple-authentication';
// import * as WebBrowser from 'expo-web-browser';
// import { AuthService } from '@/api/auth.service';
// import { useAuth } from '@/context/AuthContext';
// import { useRouter } from 'expo-router';
// import { showToast } from '@/app/utils/toast';
// import { Platform } from 'react-native';
// import * as AuthSession from "expo-auth-session";

// WebBrowser.maybeCompleteAuthSession();

// const iosId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID 
// const androidId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '552515162391-ekrt13fnht06vo0cmm4f1nbr5puqtkdd.apps.googleusercontent.com'
// const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID

// console.log('ios:', iosId, 'android:', androidId, 'web:', clientId)


// export function useOAuth(appType: 'user-app' | 'driver-app') {
//   const { setAuthData, refreshUser } = useAuth();
//   const router = useRouter();

//     const redirectUri = AuthSession.makeRedirectUri({
//     native: Platform.select({
//       ios: "com.vendoramarketplace.logisticsdriver:/oauthredirect",
//       android: "com.vendoramarketplace.logisticsdriver:/oauthredirect",
//     }),
//     // useProxy: false,
//   });

//   const [_, googleResponse, googlePromptAsync] = Google.useAuthRequest({
//     clientId: clientId,
//     iosClientId: iosId,
//     androidClientId: androidId,
//     redirectUri: redirectUri,
//     scopes: ['profile', 'email'],
//   });

//   const handleOAuthSuccess = async (
//     token: string,
//     user: any,
//     needsProfileCompletion: boolean
//   ) => {
//     await setAuthData(token, user);
//     await refreshUser();
//     if (needsProfileCompletion && appType === 'driver-app') {
//       // Driver signed in via OAuth but hasn't uploaded license yet
//       router.replace('/(auth)/complete-profile');
//     } else {
//       router.replace('/(tabs)');
//     }
//   };

//   const signInWithGoogle = async () => {
//     try {
//       const result = await googlePromptAsync();
//       if (result.type !== 'success') return;

//       const { id_token } = result.params;
//       const data = await AuthService.googleAuth({ idToken: id_token, appType });
//       showToast.success('Signed in with Google!');
//       await handleOAuthSuccess(data.token, data.user, data.needsProfileCompletion);
//     } catch (err: any) {
//       showToast.error(err?.response?.data?.message || 'Google sign-in failed');
//     }
//   };

//   const signInWithApple = async () => {
//     if (Platform.OS !== 'ios') return;
//     try {
//       const credential = await AppleAuthentication.signInAsync({
//         requestedScopes: [
//           AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
//           AppleAuthentication.AppleAuthenticationScope.EMAIL,
//         ],
//       });
//       const data = await AuthService.appleAuth({
//         identityToken: credential.identityToken!,
//         fullName: credential.fullName,
//         appType,
//       });
//       showToast.success('Signed in with Apple!');
//       await handleOAuthSuccess(data.token, data.user, data.needsProfileCompletion);
//     } catch (err: any) {
//       if (err.code !== 'ERR_CANCELED') {
//         showToast.error(err?.response?.data?.message || 'Apple sign-in failed');
//       }
//     }
//   };

//   return { signInWithGoogle, signInWithApple };
// }





import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { AuthService } from '@/api/auth.service';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { showToast } from '@/app/utils/toast';
import { Alert, Platform } from 'react-native';
import { useLoading } from '@/context/LoadingContext';

GoogleSignin.configure({
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  offlineAccess: false,
  scopes: ['profile', 'email'],
});

interface OAuthOptions {
  appType: 'user-app' | 'driver-app';
  // Only set on registration screens — omit on sign-in screen
  role?: 'INDIVIDUAL' | 'BUSINESS' | 'DRIVER';
  // Derived automatically: if role is provided → 'register', else → 'signin'
}

export function useOAuth({ appType, role }: OAuthOptions) {
  const { showLoading, hideLoading } = useLoading();
  const { setAuthData, refreshUser } = useAuth();
  const router = useRouter();

  // If a role was explicitly passed, we're on a registration screen
  const mode: 'signin' | 'register' = role ? 'register' : 'signin';

  const handleOAuthSuccess = async (
    token: string,
    user: any,
    flags: { needsLicenseUpload: boolean; needsBusinessProfile: boolean }
  ) => {
    await setAuthData(token, user);
    await refreshUser();

    if (flags.needsLicenseUpload && appType === 'user-app') {
      return null;
    } else if (flags.needsBusinessProfile && appType === 'driver-app') {
      router.replace('/(auth)/complete-profile');
    } else {
      router.replace('/(tabs)');
    }
  };

  const signInWithGoogle = async () => {
    showLoading('Please Wait...');
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      await GoogleSignin.signOut(); 
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (!idToken) { showToast.error('No token received from Google'); return; }

      const data = await AuthService.googleAuth({ idToken, appType, role, mode });
      showToast.success(
        mode === "register" ? "Account created!" : "Login Successful",
        mode === "register" ? "Login Succesful" : "Welcome back!",
      );;
      await handleOAuthSuccess(data.token, data.user, {
        needsLicenseUpload:   data.needsLicenseUpload   ?? false,
        needsBusinessProfile: data.needsBusinessProfile ?? false,
      });
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) return;
      if (err.code === statusCodes.IN_PROGRESS) return;
      if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Google Sign-In', 'Google Play Services not available.'); return;
      }
      // Surface the backend message directly — covers the 404 "not registered" case
      const message = err?.response?.data?.message || 'Google sign-in failed';
      showToast.error(message);
      if (err?.response?.status === 404){
        router.replace('/(auth)/register')
      }
    }finally{
      hideLoading();
    }
  };

  const signInWithApple = async () => {
    showLoading('Please Wait...');
    if (Platform.OS !== 'ios') return;
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) { showToast.error('No token received from Apple'); return; }

      const data = await AuthService.appleAuth({
        identityToken: credential.identityToken,
        fullName: credential.fullName,
        appType,
        role,
        mode,
      });
      showToast.success(
        mode === "register" ? "Account created!" : "Login Successful",
        mode === "register" ? "Login Succesful" : "Welcome back!",
      );
      await handleOAuthSuccess(data.token, data.user, {
        needsLicenseUpload:   data.needsLicenseUpload   ?? false,
        needsBusinessProfile: data.needsBusinessProfile ?? false,
      });
    } catch (err: any) {
      if (err.code === 'ERR_CANCELED') return;
      const message = err?.response?.data?.message || 'Apple sign-in failed';
      showToast.error(message);
       if (err?.response?.status === 404){
        router.replace('/(auth)/register')
      }
    }finally{
      hideLoading();
    }
  };

  return { signInWithGoogle, signInWithApple };
}