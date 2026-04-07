import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

export default function SplashScreen() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();


  useEffect(() => {
    if (isLoading) return;

    const navigate = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem("hasLaunched");
        const token = await AsyncStorage.getItem("token");
        console.log("hasLaunched:", hasLaunched);
        console.log("isAuthenticated:", isAuthenticated);
        console.log("token:", token);

        setTimeout(() => {
          if (!hasLaunched) {
            router.replace("/(auth)/onboarding");
          } else if (!isAuthenticated) {
            router.replace("/(auth)/sign-in");
          } else {
            router.replace("/(tabs)");
          }
        }, 3000);
      } catch (error) {
        console.error("Navigation error:", error);
        router.replace("/(auth)/onboarding");
      }
    };

    navigate();
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/22LogisticsLogo.png")}
        />
      </View>
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
  logoContainer: {
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
