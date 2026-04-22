import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Appearance, StatusBar } from 'react-native';
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { AuthProvider } from "../context/AuthContext";

import { toastConfig } from "@/components/Toast";
import { useColorScheme } from "@/components/useColorScheme";
import { BookingProvider } from "@/context/BookingContext";
import { ScheduleProvider } from "@/context/ScheduleContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { NotificationService } from '@/api/notification.service';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { LoadingProvider } from "@/context/LoadingContext";
import { I18nextProvider } from "react-i18next";
import i18n, { initI18n } from "@/src/i18n";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
  }),
});

async function registerPushToken() {
  if (!Device.isDevice) return; // simulators don't get push tokens
  const { status: existing } = await Notifications.getPermissionsAsync();
  const { status } = existing === 'granted'
    ? { status: existing }
    : await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const token = (await Notifications.getExpoPushTokenAsync({
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID, // from app.json extra.eas.projectId
  })).data;

  try {
    await NotificationService.savePushToken(token);
  } catch {}
}


export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Grotesque-Regular": require("../assets/fonts/BricolageGrotesque-Regular.ttf"),
    "Grotesque-Medium": require("../assets/fonts/BricolageGrotesque-Medium.ttf"),
    "Grotesque-Bold": require("../assets/fonts/BricolageGrotesque-Bold.ttf"),
    "Grotesque-SemiBold": require("../assets/fonts/BricolageGrotesque-SemiBold.ttf"),
  });

    const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);


  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
  registerPushToken();
}, []);

  if (!loaded || !i18nReady) {
    return null;
  }


  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme(); 
  const isDark = colorScheme === 'dark';

  return (
    <GestureHandlerRootView>
      <I18nextProvider i18n={i18n}>
       <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#060F18' : '#0B1B2B'}
      />
      <LoadingProvider>
      <ScheduleProvider>
        <BookingProvider>
          <AuthProvider>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                {/* Main flow screens */}
                <Stack.Screen name="screens" options={{ headerShown: false }} />

                {/* Booking detail */}
                <Stack.Screen
                  name="payment-history"
                  options={{ headerShown: false }}
                />

                {/* Keeping template modal available (not used). */}
                <Stack.Screen
                  name="modal"
                  options={{ presentation: "modal" }}
                />
              </Stack>
            </ThemeProvider>
          </AuthProvider>
        </BookingProvider>
      </ScheduleProvider>
      <Toast config={toastConfig} />
      </LoadingProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}
