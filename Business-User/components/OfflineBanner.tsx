import { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export default function OfflineBanner({ isConnected }: { isConnected: boolean }) {
  const height = useSharedValue(0);

  useEffect(() => {
    if (!isConnected) {
      height.value = withTiming(50, { duration: 500 }); // slide down
    } else {
      height.value = withTiming(0, { duration: 500 }); // slide up
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
          backgroundColor: "#b91c1c",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        },
        animatedStyle,
      ]}
    >
      <Text style={{ color: "white", fontWeight: "500" }}>
        You are offline - No internet connection
      </Text>
    </Animated.View>
  );
}
