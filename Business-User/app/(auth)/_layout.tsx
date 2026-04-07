import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="account-type" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="register-individual" />
      <Stack.Screen name="register-business" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="congratulations" />
    </Stack>
  );
}
