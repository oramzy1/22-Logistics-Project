
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const PREFS_KEY = '@22log_notif_prefs';

export type NotifPrefs = {
  trip: boolean;
  driver: boolean;
  payment: boolean;
  promos: boolean;
};

const DEFAULT_PREFS: NotifPrefs = { trip: true, driver: true, payment: true, promos: false };

const TYPE_PREF_MAP: Record<string, keyof NotifPrefs> = {
  PAYMENT_CONFIRMED:  'payment',
  DRIVER_ASSIGNED:    'driver',
  TRIP_STARTED:       'driver',
  BOOKING_COMPLETED:  'trip',
  TRIP_COMPLETED:     'trip',
  BOOKING_CANCELLED:  'trip',
  LICENSE_STATUS:     'trip',
};

export const NotificationPrefs = {
  load: async (): Promise<NotifPrefs> => {
    const stored = await AsyncStorage.getItem(PREFS_KEY);
    return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : DEFAULT_PREFS;
  },
  save: async (prefs: NotifPrefs) => {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  },
};

// Call this in _layout.tsx to suppress local display of notifications the user disabled:
export function useNotificationFilter() {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const type = notification.request.content.data?.type as string;
      const prefKey = TYPE_PREF_MAP[type];
      if (prefKey) {
        const prefs = await NotificationPrefs.load();
        if (!prefs[prefKey]) {
          // Silently receive but don't show alert
          return { shouldShowAlert: false, shouldPlaySound: false, shouldSetBadge: false };
        }
      }
      return { shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true };
    },
  });
}