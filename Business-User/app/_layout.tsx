import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { AuthProvider } from "../context/AuthContext";

import { toastConfig } from "@/components/Toast";
import { useColorScheme } from "@/components/useColorScheme";
import { BookingProvider } from "@/context/BookingContext";
import { ScheduleProvider } from "@/context/ScheduleContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { GlobalSocketAlerts } from "@/src/ui/GlobalSocketAlerts";

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

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView>
      <ScheduleProvider>
        <BookingProvider>
          <GlobalSocketAlerts />
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
    </GestureHandlerRootView>
  );
}
