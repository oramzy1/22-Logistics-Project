import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Headphones, Bell, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from './useAppTheme';

import { colors, spacing } from './theme';
import { NotificationBell } from './NotificationBell';

type Props = {
  title: string | React.ReactNode;
  showBack?: boolean;
  rightIcons?: boolean;
  leftAvatar?: boolean;
  translucent?: boolean;
};

export function AppHeader({ title, showBack, rightIcons, leftAvatar, translucent }: Props) {
  const router = useRouter();
  const {  colors: themeColors } = useAppTheme();
  const { user, isBusiness } = useAuth();
   const avatarUri = isBusiness
    ? user?.businessProfile?.logoUrl ?? null
    : user?.avatarUrl ?? null;

  return (
    <View style={[styles.root, translucent && styles.translucent, { backgroundColor: themeColors.navy }]}>
      <View>
        {showBack ? (
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.circle}>
            <ChevronLeft color="#fff" size={17} />
          </Pressable>
        ) : leftAvatar ? (
         <View style={styles.leftSection}>
           {avatarUri ? (
        <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
      ) : (
        <View style={[styles.circle, { backgroundColor: '#111827' }]}>
          <Text style={[styles.circleText, { color: '#fff' }]}>
            {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
      )}
        {typeof title === 'string' ? <Text style={styles.title}>{title}</Text> : title}
         </View>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {!leftAvatar && <View style={styles.center}>
        {typeof title === 'string' ? <Text style={styles.title}>{title}</Text> : title}
      </View>}

      <View style={styles.right}>
        {rightIcons ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={styles.circle}>
              <Text style={styles.circleText}><Headphones  color="#fff" size={18} /></Text>
            </View>
            {/* <TouchableOpacity style={styles.circle} onPress={() => router.push('/screens/notifications')}>
              <Text style={styles.circleText}><Bell color="#fff" size={16} /></Text>
            </TouchableOpacity> */}

            <View style={styles.circle}>
              <NotificationBell />
            </View>
          </View>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: 62,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.navy,
  },
  translucent: {
    backgroundColor: 'transparent',
  },
  leftSection: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  center: { flex: 1, alignItems: 'center' },
  right: { width: 80, alignItems: 'flex-end' },
  title: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  avatarImage: {
  width: 40,
  height: 40,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.2)',
},
});
