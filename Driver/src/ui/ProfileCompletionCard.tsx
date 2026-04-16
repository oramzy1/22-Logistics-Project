import { router } from 'expo-router';
import { AlertCircle, Check, ChevronRight, Shield, Car, Image, CheckCircle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../../components/AppText';

export type CompletionStep = {
  key: string;
  label: string;
  description: string;
  done: boolean;
  icon: any;
};

export function getCompletionSteps(user: any): CompletionStep[] {
  const dp = user?.driverProfile;
  return [
    {
      key: 'avatar',
      label: 'Upload Profile Photo',
      description: 'Add a clear photo so customers can identify you',
      done: !!user?.avatarUrl,
      icon: Image,
    },
    {
      key: 'vehicle',
      label: 'Add Vehicle Details',
      description: 'Vehicle type, brand/model, plate number & color',
      done: !!(dp?.vehicleType && dp?.brandModel && dp?.plateNumber && dp?.vehicleColor),
      icon: Car,
    },
    {
      key: 'license',
      label: 'Submit Driver\'s License',
      description: 'Upload a clear photo of your valid license',
      done: !!(dp?.licenseImageUrl),
      icon: Shield,
    },
    {
      key: 'approved',
      label: 'License Approved',
      description: 'Admin review typically takes 24–48 hours',
      done: dp?.licenseStatus === 'APPROVED',
      icon: CheckCircle,
    },
  ];
}

export function isProfileComplete(user: any): boolean {
  return getCompletionSteps(user).every((s) => s.done);
}

export function ProfileCompletionCard({ user, isDark }: { user: any; isDark: boolean }) {
  const steps = getCompletionSteps(user);
  const completedCount = steps.filter((s) => s.done).length;
  const percent = Math.round((completedCount / steps.length) * 100);

  const c = {
    card: isDark ? '#1a2a3a' : '#FFFFFF',
    border: isDark ? '#2D3F52' : '#E5E7EB',
    text: isDark ? '#F9FAFB' : '#111827',
    muted: isDark ? '#9CA3AF' : '#6B7280',
    track: isDark ? '#2D3F52' : '#F3F4F6',
    stepPending: isDark ? '#2D3F52' : '#E5E7EB',
    stepLabel: isDark ? '#D1D5DB' : '#374151',
  };

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.warningBadge}>
          <AlertCircle size={16} color="#F59E0B" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: c.text }]}>
            Complete Your Setup
          </Text>
          <Text style={[styles.cardSubtitle, { color: c.muted }]}>
            {4 - completedCount} step{4 - completedCount !== 1 ? 's' : ''} remaining before you can accept rides
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: c.track }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percent}%` as any,
              backgroundColor: percent === 100 ? '#10B981' : '#E4C77B',
            },
          ]}
        />
      </View>
      <Text style={[styles.progressLabel, { color: c.muted }]}>
        {percent}% complete
      </Text>

      {/* Steps */}
      <View style={styles.stepsContainer}>
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <View
              key={step.key}
              style={[
                styles.stepRow,
                { opacity: step.done ? 0.6 : 1 },
              ]}
            >
              <View
                style={[
                  styles.stepIconBox,
                  {
                    backgroundColor: step.done ? '#10B981' : c.stepPending,
                  },
                ]}
              >
                {step.done ? (
                  <Check size={12} color="#FFF" />
                ) : (
                  <Icon size={12} color={isDark ? '#9CA3AF' : '#6B7280'} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.stepLabel,
                    { color: c.stepLabel },
                    step.done && styles.doneText,
                  ]}
                >
                  {step.label}
                </Text>
                {!step.done && (
                  <Text style={[styles.stepDescription, { color: c.muted }]}>
                    {step.description}
                  </Text>
                )}
              </View>
              {step.done ? (
                <Text style={styles.doneTag}>Done</Text>
              ) : (
                <Text style={[styles.pendingTag, { color: '#F59E0B' }]}>Pending</Text>
              )}
            </View>
          );
        })}
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={styles.ctaBtn}
        onPress={() => router.push('/(tabs)/account')}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaText}>Complete Profile</Text>
        <ChevronRight size={16} color="#3E2723" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  warningBadge: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  cardSubtitle: { fontSize: 12 },
  progressTrack: { height: 8, borderRadius: 4, marginBottom: 6, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  progressLabel: { fontSize: 11, fontWeight: '600', marginBottom: 16 },
  stepsContainer: { gap: 12, marginBottom: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepIconBox: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  stepLabel: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  stepDescription: { fontSize: 11, lineHeight: 16 },
  doneText: { textDecorationLine: 'line-through' },
  doneTag: { fontSize: 11, fontWeight: '700', color: '#10B981' },
  pendingTag: { fontSize: 11, fontWeight: '600' },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#E4C77B', paddingVertical: 14,
    borderRadius: 24, gap: 6,
  },
  ctaText: { color: '#3E2723', fontWeight: '700', fontSize: 14 },
});