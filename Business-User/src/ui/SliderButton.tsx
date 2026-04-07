import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import { ChevronRight } from "lucide-react-native";

const { width } = Dimensions.get("window");

interface SwipeSliderProps {
  title: string;
  onComplete: () => void;
}

export const SwipeSlider: React.FC<SwipeSliderProps> = ({
  title,
  onComplete,
}) => {
  const SLIDER_WIDTH = width - 10; // adjust padding
  const HANDLE_WIDTH = 180;

  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationX >= 0 && e.translationX <= SLIDER_WIDTH - HANDLE_WIDTH) {
        translateX.value = e.translationX;
      }
    })
    .onEnd(() => {
      if (translateX.value > (SLIDER_WIDTH - HANDLE_WIDTH) * 0.85) {
        // reached end
        translateX.value = withSpring(SLIDER_WIDTH - HANDLE_WIDTH);
        runOnJS(onComplete)();
      } else {
        // return back
        translateX.value = withSpring(0);
      }
    });

  const animatedHandleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedArrowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SLIDER_WIDTH - HANDLE_WIDTH],
      [1, 0]
    ),
  }));

  return (
    <View style={styles.wrapper}>
      <View style={styles.track}>
        <Animated.View style={[styles.arrowsContainer, animatedArrowStyle]}>
          <ChevronRight size={18} color="#C28B3C" />
          <ChevronRight size={18} color="#C28B3C" />
          <ChevronRight size={18} color="#C28B3C" />
        </Animated.View>

        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.handle, animatedHandleStyle]}>
            <Text style={styles.text}>{title}</Text>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  track: {
    backgroundColor: "#E9DFC9",
    borderRadius: 40,
    height: 64,
    justifyContent: "center",
    overflow: "hidden",
  },
  handle: {
    position: "absolute",
    height: 52,
    width: 120,
    backgroundColor: "#D97706",
    borderRadius: 40,
    justifyContent: "center",
    paddingHorizontal: 24,
    marginLeft: 6,
  },
  text: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  arrowsContainer: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    gap: 4,
  },
});