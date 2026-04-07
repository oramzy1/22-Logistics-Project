import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, Circle, Building2, User2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/AppText';

export default function AccountTypeScreen() {
  const [selectedType, setSelectedType] = useState<'business' | 'individual' | null>(null);
  const router = useRouter();

  const handleContinue = () => {
    if (selectedType === 'business') {
      router.push('/(auth)/register-business');
    } else if (selectedType === 'individual') {
      router.push('/(auth)/register-individual');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}></View>

      <View style={styles.content}>
        <Text style={styles.title}>Choose Your Account Type</Text>
        <Text style={styles.subtitle}>How would you like to continue?</Text>

        {/* Business Account Option */}
        <TouchableOpacity 
          style={[styles.card, selectedType === 'business' ? styles.cardSelectedBusiness : styles.cardUnselected]}
          onPress={() => setSelectedType('business')}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconRow}>
              <Building2 size={20} color={selectedType === 'business' ? '#1D4ED8' : '#6B7280'} />
              <Text style={[styles.cardTitle, selectedType === 'business' && styles.titleSelectedBusiness]}>
                Business Account
              </Text>
            </View>
            {selectedType === 'business' ? <CheckCircle2 size={24} color="#3E2723" /> : <Circle size={24} color="#D1D5DB" />}
          </View>
          <Text style={styles.cardDesc}>Manage company rides and staff bookings</Text>
          
          {selectedType === 'business' && (
            <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
              <Text style={styles.continueBtnText}>Continue as Business</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Individual Account Option */}
        <TouchableOpacity 
          style={[styles.card, selectedType === 'individual' ? styles.cardSelectedIndividual : styles.cardUnselected]}
          onPress={() => setSelectedType('individual')}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconRow}>
              <User2 size={20} color={selectedType === 'individual' ? '#974C16' : '#6B7280'} />
              <Text style={[styles.cardTitle, selectedType === 'individual' && styles.titleSelectedIndividual]}>
                Individual Account
              </Text>
            </View>
            {selectedType === 'individual' ? <CheckCircle2 size={24} color="#3E2723" /> : <Circle size={24} color="#D1D5DB" />}
          </View>
          <Text style={styles.cardDesc}>Book rides as an Individual easily</Text>
          
          {selectedType === 'individual' && (
            <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
              <Text style={styles.continueBtnText}>Continue as Individual</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerBar: { height: 70, backgroundColor: '#0B1B2B', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  content: { padding: 24 },
  title: { fontSize: 22, fontWeight: '600', color: '#111827', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#6B7280', marginBottom: 30 },
  card: { borderRadius: 12, padding: 20, marginBottom: 16, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardUnselected: { backgroundColor: '#F9F6F0', borderColor: '#E5E7EB' },
  cardSelectedBusiness: { backgroundColor: '#F0F7FF', borderColor: '#0B1B2B' }, // Light blue tint
  cardSelectedIndividual: { backgroundColor: '#F9F6F0', borderColor: '#0B1B2B' }, // Matches unselected bg but thick dark border
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  iconRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '500', marginLeft: 10, color: '#4B5563' },
  titleSelectedBusiness: { color: '#1D4ED8' },
  titleSelectedIndividual: { color: '#974C16' },
  cardDesc: { fontSize: 12, color: '#6B7280', marginLeft: 30, marginBottom: 16 },
  continueBtn: { backgroundColor: '#E4C77B', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  continueBtnText: { fontWeight: '500', color: '#3E2723', fontSize: 12 },
});
