import { Stack } from 'expo-router';

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="confirmation" />
      <Stack.Screen name="account-type" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="register-individual" />
      <Stack.Screen name="register-business" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="congratulations" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="payment-success" />
      <Stack.Screen name="payment-failed" />
      <Stack.Screen name="payment-details" />
    </Stack>
  );
}
