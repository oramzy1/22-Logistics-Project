import React from 'react';
import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { Home, CalendarRange, Calendar, MapPin, User } from 'lucide-react-native'

import { colors } from '@/src/ui/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


function TabBarIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: { [key: string]: React.ReactNode } = {
    index: <Home color={focused ? "#061A33" : "gray"} size={20} />,
    schedule: <CalendarRange color={focused ? "#061A33" : "gray"} size={20} />,
    bookings: <Calendar color={focused ? "#061A33" : "gray"} size={20} />,
    live: <MapPin color={focused ? "#061A33" : "gray"} size={20} />,
    account: <User color={focused ? "#061A33" : "gray"} size={20} />,
  };

  return icons[name] || <Home color="gray" size={20} />;
}


export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  void colorScheme;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: "shift",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          height: 52 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 5,
        },
        tabBarActiveTintColor: "#061A33",
        tabBarInactiveTintColor: "gray",
      }}>
      <Tabs.Screen
        name="index"
       options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="index" focused={focused} />
          ),
          tabBarLabel: "Home",
        }}
      />
      <Tabs.Screen
        name="schedule"
      options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="schedule" focused={focused} />
          ),
          tabBarLabel: "Schedule",
        }}
      />

      <Tabs.Screen
        name="bookings"
       options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="bookings" focused={focused} />
          ),
          tabBarLabel: "Bookings",
        }}
      />

      <Tabs.Screen
        name="live"
       options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="live" focused={focused} />
          ),
          tabBarLabel: "Live",
        }}
      />

      <Tabs.Screen
        name="account"
       options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="account" focused={focused} />
          ),
          tabBarLabel: "Account",
        }}
      />
    </Tabs>
  );
}
