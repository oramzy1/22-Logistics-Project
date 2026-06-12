import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";

export default function SplashScreen() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const [minDelayDone, setMinDelayDone] = useState(false);


    useEffect(() => {
    const t = setTimeout(() => setMinDelayDone(true), 2000);
    return () => clearTimeout(t);
  }, []);


  useEffect(() => {
    if (isLoading || !minDelayDone) return;

    const navigate = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem("hasLaunched");
        const token = await AsyncStorage.getItem("token");
        console.log("hasLaunched:", hasLaunched);
        console.log("isAuthenticated:", isAuthenticated);
        console.log("token:", token);

        if (!hasLaunched) {
          router.replace("/(auth)/onboarding");
        } else if (!isAuthenticated) {
          router.replace("/(auth)/sign-in");
        } else {
          router.replace("/(tabs)");
        }
        // setTimeout(() => {
        // }, 3000);
      } catch (error) {
        console.error("Navigation error:", error);
        router.replace("/(auth)/onboarding");
      }
    };

    navigate();
  }, [isLoading, isAuthenticated, minDelayDone]);

  const ready = !isLoading && minDelayDone;


  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/22LogisticsLogo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      {/* Spinner fades in only if auth is taking longer than the splash */}
      {!ready && (
        <ActivityIndicator
          size="small"
          color="#E4C77B"
          style={styles.spinner}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F6F0",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 250,
    height: 130,
  },
  spinner: {
    position: "absolute",
    bottom: 80,
  },
});