import React from 'react';
import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { Home, CalendarRange, Calendar, MapPin, User, Car, CarFront } from 'lucide-react-native'

import { colors } from '@/src/ui/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/src/ui/useAppTheme';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const GOLD = '#F5C84C';
const GOLD_DEEP = '#D9A21B';
const BAR = 56;      // visible bar height
const LIFT = 32;     // headroom above the bar for the raised button
const BUTTON = 56;   // center circle diameter
const HUMP = 52;     // half-width of the bump

function TabBarBackground() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors: themeColors } = useAppTheme();
  const height = LIFT + BAR + Math.max(insets.bottom, 10);
  const cx = width / 2;

  const edge =
    `M0 ${LIFT} H${cx - HUMP} ` +
    `C${cx - HUMP * 0.62} ${LIFT} ${cx - HUMP * 0.7} 0 ${cx} 0 ` +
    `C${cx + HUMP * 0.7} 0 ${cx + HUMP * 0.62} ${LIFT} ${cx + HUMP} ${LIFT} H${width}`;

  return (
    <Svg width={width} height={height}>
      <Path d={`${edge} V${height} H0 Z`} fill={themeColors.background} />
      <Path d={edge} fill="none" stroke={themeColors.background} strokeWidth={1} />
    </Svg>
  );
}



function TabBarIcon({ name, focused }: { name: string; focused: boolean }) {
  const { colors: themeColors } = useAppTheme();
  const tint = focused ? GOLD : "gray";
  const icons: { [key: string]: React.ReactNode } = {
    // index: <Home color={focused ? themeColors.text : "gray"} size={20} />,
    // schedule: <CalendarRange color={focused ? themeColors.text : "gray"} size={20} />,
    // bookings: <Calendar color={focused ? themeColors.text : "gray"} size={20} />,
    // live: <MapPin color={focused ? themeColors.text : "gray"} size={20} />,
    // account: <User color={focused ? themeColors.text : "gray"} size={20} />,
    index: <Home color={tint} size={20} />,
    bookings: <CalendarRange color={tint} size={20} />,
    live: <MapPin color={tint} size={20} />,
    account: <User color={tint} size={20} />,
  };

  //   if (name === 'schedule') {
  //   return (
  //     <View style={{ width: BUTTON, height: 20, alignItems: 'center' }}>
  //       <View
  //         style={{
  //           position: 'absolute',
  //           top: -(LIFT + 9), // tweak if the circle sits a few px off the hump
  //           width: BUTTON,
  //           height: BUTTON,
  //           borderRadius: BUTTON / 2,
  //           backgroundColor: GOLD_DEEP,
  //           shadowColor: GOLD,
  //           shadowOpacity: 0.45,
  //           shadowRadius: 12,
  //           shadowOffset: { width: 0, height: 4 },
  //           elevation: 8,
  //         }}>
  //         <LinearGradient
  //           colors={['#F9DE8B', GOLD_DEEP]}
  //           start={{ x: 0.2, y: 0 }}
  //           end={{ x: 0.8, y: 1 }}
  //           style={{ flex: 1, borderRadius: BUTTON / 2, alignItems: 'center', justifyContent: 'center' }}>
  //           <CarFront color="#1A1408" size={26} />
  //         </LinearGradient>
  //       </View>
  //     </View>
  //   );
  // }
  if (name === 'schedule') {
  return (
    <View
      style={{
        width: BUTTON + 2,
        height: BUTTON + 2,
        alignItems: 'center',
      }}
    >
      {/* White border ring */}
      <View
        style={{
          position: 'absolute',
          top: -(LIFT - 6),
          width: BUTTON + 2,
          height: BUTTON + 2,
          borderRadius: (BUTTON + 2) / 2,
          backgroundColor: themeColors.softBorder,
          alignItems: 'center',
          justifyContent: 'center',

          shadowColor: GOLD,
          shadowOpacity: 0.45,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        }}
      >
        {/* Actual gold button */}
        <View
          style={{
            width: BUTTON,
            height: BUTTON,
            borderRadius: BUTTON / 2,
            overflow: 'hidden',
          }}
        >
          <LinearGradient
            colors={['#F9DE8B', GOLD_DEEP]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={{
              flex: 1,
              borderRadius: BUTTON / 2,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CarFront
              color="#1A1408"
              size={26}
            />
          </LinearGradient>
        </View>
      </View>
    </View>
  );
}


  return icons[name] || <Home color="gray" size={20} />;
}


export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colors: themeColors } = useAppTheme();
  const colorScheme = useColorScheme();

  void colorScheme;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: "shift",
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          backgroundColor: themeColors.background,
          borderTopWidth: 1,
          borderTopColor: themeColors.softBorder,
          height: 55 + insets.bottom,
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
        name="bookings"
       options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="bookings" focused={focused} />
          ),
          tabBarLabel: "Bookings",
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
        name="live"
       options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="live" focused={focused} />
          ),
          tabBarLabel: "Trip",
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
