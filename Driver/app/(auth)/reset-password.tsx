import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, EyeOff, Eye, Check } from 'lucide-react-native';
import LoadingOverlay from '@/src/ui/LoadingOverlay';
import { Text } from '../../components/AppText'; 

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleReset = () => {
    setIsLoading(true);
    // Simulate API call then route
    setTimeout(() => {
      setIsLoading(false);
      router.push('/(auth)/sign-in');
    }, 2500);
  };

  const ValidationPill = ({ text, isValid }: { text: string, isValid: boolean }) => (
    <View style={[styles.validationPill, isValid && styles.validationPillValid]}>
       <Check size={12} color={isValid ? "#10B981" : "#6B7280"} style={{marginRight: 4}} />
       <Text style={[styles.validationText, isValid && styles.validationTextValid]}>{text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}></View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={styles.title}>Reset Password</Text>

          {/* Password Input */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Lock size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="********" 
              secureTextEntry={!showPassword} 
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <Eye size={18} color="#9CA3AF" /> : <EyeOff size={18} color="#9CA3AF" />}
            </TouchableOpacity>
          </View>

          {/* Check Pills */}
          <View style={styles.validationContainer}>
            <ValidationPill text="Minimum 8 characters" isValid={hasMinLength} />
            <ValidationPill text="1 Uppercase character (A,B,C...)" isValid={hasUpper} />
            <ValidationPill text="1 Lowercase character (a,b,c...)" isValid={hasLower} />
            <ValidationPill text="1 Special character (!@,#,$...)" isValid={hasSpecial} />
          </View>

          {/* Confirm Password Input */}
          <Text style={styles.label}>Confirm password</Text>
          <View style={[styles.inputContainer, isMismatch && styles.inputErrorBorder, { marginBottom: 4 }]}>
            <Lock size={18} color={isMismatch ? "#EF4444" : "#9CA3AF"} style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="********" 
              secureTextEntry={!showConfirmPassword} 
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <Eye size={18} color="#9CA3AF" /> : <EyeOff size={18} color="#9CA3AF" />}
            </TouchableOpacity>
          </View>
          {isMismatch && <Text style={styles.errorText}>Password mismatch</Text>}

          <View style={{ marginTop: 'auto', paddingBottom: 20 }}>
            <TouchableOpacity style={styles.submitBtn} onPress={handleReset}>
              <Text style={styles.submitBtnText}>Reset Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={isLoading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerBar: { height: 70, backgroundColor: '#0B1B2B', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  content: { flex: 1, padding: 24, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 30, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, height: 48, backgroundColor: '#FFF', marginBottom: 16 },
  inputErrorBorder: { borderColor: '#EF4444' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: '#111827' },
  errorText: { color: '#EF4444', fontSize: 12, textAlign: 'right', marginBottom: 16 },
  validationContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 30 },
  validationPill: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#FFF' },
  validationPillValid: { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
  validationText: { fontSize: 11, color: '#6B7280' },
  validationTextValid: { color: '#065F46' },
  submitBtn: { backgroundColor: '#A28E62', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
