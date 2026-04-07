import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/AppText';
import LottieView from 'lottie-react-native'; 

export default function CongratulationsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}></View>
      <View style={styles.content}>
        <Text style={styles.title}>Congratulations!</Text>
        <Text style={styles.subtitle}>Account Created <Text style={styles.successText}>Successfully</Text></Text>

        <View style={styles.lottieContainer}>
           {/* Replace this View with LottieView once package is installed */}
           <LottieView source={require('../../assets/animations/confetti.json')} autoPlay loop={false} style={{ width: 200, height: 200 }} />
           {/* <Text style={{fontSize: 80}}>🎉</Text>  */}
        </View>

        <Text style={styles.description}>
          Your 22 Logistics account is now active. You can now schedule rides and manage your trips effortlessly.
        </Text>

        <TouchableOpacity style={styles.proceedBtn} onPress={() => router.push('/(auth)/sign-in')}>
           <Text style={styles.proceedBtnText}>Proceed to Sign in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerBar: { height: 70, backgroundColor: '#0B1B2B', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  content: { flex: 1, padding: 24, alignItems: 'center', paddingTop: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#4B5563', marginBottom: 40 },
  successText: { color: '#10B981', fontWeight: '600' },
  lottieContainer: { height: 250, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  description: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, paddingHorizontal: 10, marginBottom: 'auto' },
  proceedBtn: { backgroundColor: '#E4C77B', width: '100%', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  proceedBtnText: { color: '#3E2723', fontWeight: 'bold', fontSize: 16 },
});
