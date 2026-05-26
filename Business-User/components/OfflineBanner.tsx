import { useEffect, useState } from "react";
import { Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OfflineBanner({ isConnected }: { isConnected: boolean }) {
  const insets = useSafeAreaInsets();
  const height = useSharedValue(0);
  const [wasOffline, setWasOffline] = useState(false);
  const [showOnline, setShowOnline] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      setWasOffline(true);
      setShowOnline(false);
      height.value = withTiming(50, { duration: 500 });
    } else if (wasOffline) {
      setShowOnline(true);
      height.value = withTiming(50, { duration: 500 });

      const timer = setTimeout(() => {
        height.value = withTiming(0, { duration: 500 });
        setTimeout(() => {
          setShowOnline(false);
          setWasOffline(false);
        }, 500);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: height.value === 0 ? 0 : 1,
  }));

  return (
    <Animated.View
      style={[
        {
           backgroundColor: showOnline ? "#15803d" : "#b91c1c",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        },
        animatedStyle,
      ]}
    >
      <Text style={{ color: "white", fontWeight: "500", paddingTop: 14, }}>
        {showOnline ? 'Back online - Network Restored' : 'You are offline - No internet connection'}
      </Text>
    </Animated.View>
  );
}
