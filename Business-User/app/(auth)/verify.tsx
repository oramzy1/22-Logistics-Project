import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, TextInput, AppStateStatus, AppState } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
  interpolateColor,
} from "react-native-reanimated";
import { AuthService } from "@/api/auth.service";
import { Text } from "../../components/AppText";
import { showToast } from "../utils/toast";

export default function VerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  console.log("Verify screen email param:", email);
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<TextInput[]>([]);
const RESEND_COOLDOWN = 90;
const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN);
const [canResend, setCanResend] = useState(false);
const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
const endTimeRef = useRef<number>(0); // stores the absolute end timestamp
const appStateRef = useRef(AppState.currentState);

const startTimer = () => {
  if (timerRef.current) clearInterval(timerRef.current);
  
  // Store when the timer should END as an absolute timestamp
  endTimeRef.current = Date.now() + RESEND_COOLDOWN * 1000;
  setSecondsLeft(RESEND_COOLDOWN);
  setCanResend(false);

  timerRef.current = setInterval(() => {
    const remaining = Math.round((endTimeRef.current - Date.now()) / 1000);
    if (remaining <= 0) {
      clearInterval(timerRef.current!);
      setSecondsLeft(0);
      setCanResend(true);
    } else {
      setSecondsLeft(remaining);
    }
  }, 1000);
};

// Handle app coming back from background — recalculate from wall clock
useEffect(() => {
  const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
    if (
      appStateRef.current.match(/inactive|background/) &&
      nextState === "active"
    ) {
      // App just came to foreground — resync timer from real clock
      if (endTimeRef.current > 0) {
        const remaining = Math.round((endTimeRef.current - Date.now()) / 1000);
        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          setSecondsLeft(0);
          setCanResend(true);
        } else {
          setSecondsLeft(remaining);
          // Restart the interval cleanly
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = setInterval(() => {
            const rem = Math.round((endTimeRef.current - Date.now()) / 1000);
            if (rem <= 0) {
              clearInterval(timerRef.current!);
              setSecondsLeft(0);
              setCanResend(true);
            } else {
              setSecondsLeft(rem);
            }
          }, 1000);
        }
      }
    }
    appStateRef.current = nextState;
  });

  return () => subscription.remove();
}, []);

// Start timer on mount
useEffect(() => {
  startTimer();
  return () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };
}, []);

  const formatTime = (s: number) => {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

  
  // Animation values
  const shakeOffset = useSharedValue(0);
  const errorColorProgress = useSharedValue(0);
  // Auto-focus the first input on mount
  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (text: string, index: number) => {
    if (!/^\d?$/.test(text)) return; // allow only single digit

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Move forward if typing
    if (text !== "" && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    // If last box filled → auto submit
    if (text !== "" && index === 5) {
      const finalCode = newCode.join("");
      handleVerify(finalCode);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace logic to move focus backward
    if (e.nativeEvent.key === "Backspace" && code[index] === "" && index > 0) {
      inputs.current[index - 1]?.focus();

      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
    }
  };
  const triggerErrorAnimation = () => {
    shakeOffset.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withRepeat(withTiming(10, { duration: 100 }), 3, true),
      withTiming(0, { duration: 50 }),
    );
    errorColorProgress.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(1, { duration: 2000 }),
      withTiming(0, { duration: 500 }),
    );
  };

  const handleVerify = async (enteredCode?: string) => {
    const finalCode = enteredCode ?? code.join("");
    if (finalCode.length < 6) return;

    try {
      setIsLoading(true);
      await AuthService.verifyEmail(email, finalCode);
      router.push("/(auth)/congratulations");
    } catch (err: any) {
      console.log("Verify error status:", err?.response?.status);
      console.log("Verify error data:", err?.response?.data);
      triggerErrorAnimation();
      setTimeout(() => {
        setCode(["", "", "", "", "", ""]);
        inputs.current[0]?.focus();
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  const animatedGroupStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeOffset.value }],
    };
  });
  const animatedInputStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      errorColorProgress.value,
      [0, 1],
      ["#E5E7EB", "#EF4444"], // Normal gray vs Red
    );
    return { borderColor };
  });

 const handleResend = async () => {
  if (!canResend) return;
  try {
    await AuthService.resendVerification(email);
    startTimer();
    showToast.success("Code resent", "Check your email");
  } catch (err) {
    console.log("Resend failed:", err);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}></View>
      <View style={styles.content}>
        <Text style={styles.title}>Verification</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to {email}
        </Text>

       <View style={styles.timerBadge}>
  <Text style={styles.timerText}>
    {canResend
      ? "Code expired. "
      : <>This code will expire in <Text style={styles.timerBold}>{formatTime(secondsLeft)}</Text></>
    }
  </Text>
</View>
        <Animated.View style={[styles.codeContainer, animatedGroupStyle]}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Animated.View
              key={index}
              style={[styles.inputWrapper, animatedInputStyle]}
            >
              <TextInput
                ref={(ref: any) => (inputs.current[index] = ref)}
                style={styles.codeInput}
                keyboardType="number-pad"
                maxLength={1}
                value={code[index]}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            </Animated.View>
          ))}
        </Animated.View>
       <Text style={styles.resendPrompt}>Didn't receive code?</Text>
<TouchableOpacity onPress={handleResend} disabled={!canResend}>
  <Text style={[styles.resendLink, !canResend && styles.resendDisabled]}>
    {canResend ? "Resend code" : `Resend available in ${formatTime(secondsLeft)}`}
  </Text>
</TouchableOpacity>

        <TouchableOpacity
          style={[styles.verifyBtn, isLoading && { opacity: 0.7 }]}
          onPress={() => handleVerify()}
          disabled={isLoading}
        >
          <Text style={styles.verifyBtnText}>
            {isLoading ? "Verifying..." : "Verify"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  headerBar: {
    height: 70,
    backgroundColor: "#0B1B2B",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  content: { padding: 24, alignItems: "center", paddingTop: 20 },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#3E2723",
    textAlign: "left",
    fontWeight: "500",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  timerBadge: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 30,
  },
  timerText: { fontSize: 12, color: "#6B7280" },
  timerBold: { fontWeight: "700", color: "#111827" },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 30,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#FFF",
  },
  codeInput: {
    width: 45,
    height: 50,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
  },
  resendPrompt: { fontSize: 14, color: "#6B7280", marginBottom: 8 },
  resendLink: {
    fontSize: 14,
    color: "#374151",
    textDecorationLine: "underline",
    fontWeight: "500",
    marginBottom: 40,
  },
  verifyBtn: {
    backgroundColor: "#E4C77B",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  verifyBtnText: { color: "#3E2723", fontWeight: "bold", fontSize: 16 },
  resendDisabled: { color: "#9CA3AF", textDecorationLine: "none" },
});
