import { Stack } from 'expo-router';

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="confirmation" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="congratulations" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="payment-success" />
      <Stack.Screen name="payment-failed" />
      <Stack.Screen name="payment-details" />
    </Stack>
  );
}
