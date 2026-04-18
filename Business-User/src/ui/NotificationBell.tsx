
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../../components/AppText';
import { NotificationService } from '@/api/notification.service';
 
export function NotificationBell({ color = '#fff', size = 22 }: { color?: string; size?: number }) {
  const [count, setCount] = useState(0);
  const router = useRouter();
  const { user } = useAuth();
  const appState = useRef(AppState.currentState);
 
  const fetchUnread = useCallback(async () => {
    if (!user) return;
    try {
      const data = await NotificationService.getUnreadCount();
      setCount(data.count ?? 0);
    } catch {
      // fail silently — don't block UI
    }
  }, [user]);
 
  // Fetch on mount
  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);
 
  // Refetch when app comes back to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        fetchUnread();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [fetchUnread]);
 
  // Poll every 60 seconds while app is open
  useEffect(() => {
    const interval = setInterval(fetchUnread, 60_000);
    return () => clearInterval(interval);
  }, [fetchUnread]);
 
  return (
    <TouchableOpacity
      style={s.wrapper}
      onPress={() => {
        setCount(0); // optimistic clear
        router.push('/screens/notifications');
      }}
      activeOpacity={0.75}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Bell size={size} color={color} />
      {count > 0 && (
        <View style={s.badge}>
          <Text style={s.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
 
const s = StyleSheet.create({
  wrapper: { position: 'relative', padding: 4 },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#0B1B2B',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 12,
  },
});
 