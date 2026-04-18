import React from 'react';
import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { Home, CalendarRange, Calendar, MapPin, User, Clock } from 'lucide-react-native'

import { colors } from '@/src/ui/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/src/ui/useAppTheme';


function TabBarIcon({ name, focused }: { name: string; focused: boolean }) {
  const { colors: themeColors } = useAppTheme();

  const icons: { [key: string]: React.ReactNode } = {
    index: <Home color={focused ? themeColors.text : "gray"} size={20} />,
    activeTrip: <MapPin color={focused ? themeColors.text : "gray"} size={20} />,
    history: <Clock color={focused ? themeColors.text : "gray"} size={20} />,
    live: <MapPin color={focused ? themeColors.text : "gray"} size={20} />,
    account: <User color={focused ? themeColors.text : "gray"} size={20} />,
  };

  return icons[name] || <Home color="gray" size={20} />;
}


export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { colors: themeColors } = useAppTheme();

  void colorScheme;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: "shift",
        tabBarStyle: {
          backgroundColor: themeColors.card,
          borderTopWidth: 1,
          borderTopColor: themeColors.border,
          height: 52 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 5,
        },
        tabBarActiveTintColor: themeColors.text,
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
        name="active-trip"
      options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="activeTrip" focused={focused} />
          ),
          tabBarLabel: "Active Trip",
        }}
      />

      <Tabs.Screen
        name="history"
       options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="history" focused={focused} />
          ),
          tabBarLabel: "History",
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
