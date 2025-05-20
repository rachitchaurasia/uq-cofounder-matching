import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, SafeAreaView } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTailwind } from 'tailwind-rn'; // Or your preferred Tailwind setup
import { BottomTabParamList } from './types'; // Ensure this path is correct

// Import your icons
const homeIcon = require('../assets/home-button.png');
const eventsIcon = require('../assets/events-button.png');
const chatbotIcon = require('../assets/chatbot-button.png'); // New chatbot icon
const searchIcon = require('../assets/search-button.png');
const messageIcon = require('../assets/message-button.png');
const profileIcon = require('../assets/profile-button.png');

// Define the types for our tab items
interface TabItem {
  routeName: keyof BottomTabParamList;
  icon: any; // Source for Image
  label: string; // Used for accessibility and optional display
  badgeCount?: number;
}

const TAB_ITEMS: TabItem[] = [
  { routeName: 'HomeTab', icon: homeIcon, label: 'Home' },
  { routeName: 'EventsTab', icon: eventsIcon, label: 'Events' },
  { routeName: 'ChatbotTab', icon: chatbotIcon, label: 'Chatbot' }, // New Chatbot Tab
  { routeName: 'DiscoverTab', icon: searchIcon, label: 'Discover' },
  { routeName: 'MessagesTab', icon: messageIcon, label: 'Messages' }, // Example badge
  { routeName: 'ProfileTab', icon: profileIcon, label: 'Profile' },
];

const SELECTED_COLOR = '#6D28D9'; // A purple color, adjust as needed (e.g., from Tailwind theme)
const DEFAULT_COLOR = '#6B7280'; // A gray color

const CustomBottomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const tw = useTailwind();
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);

  // Map route names to their index in TAB_ITEMS to handle arbitrary order in navigator
  const routeNameToTabIndex = useMemo(() => {
    const map = new Map<string, number>();
    TAB_ITEMS.forEach((item, index) => {
        map.set(item.routeName, index);
    });
    return map;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.tabBar]}>
        {state.routes.map((
          route, // Type will be inferred from state.routes
          navigatorIndex: number
        ) => {
          // Ensure route.name is treated as a key of BottomTabParamList for type safety
          const currentRouteName = route.name as keyof BottomTabParamList;
          const tabItemIndex = routeNameToTabIndex.get(currentRouteName);
          
          if (tabItemIndex === undefined) return null;

          const item = TAB_ITEMS[tabItemIndex];
          const isFocused = state.index === navigatorIndex;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // Use the type-asserted currentRouteName for navigation
              navigation.navigate(currentRouteName, route.params as any); // Cast params if necessary or ensure they are compatible
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const iconStyle = [
            styles.icon,
            { tintColor: isFocused ? SELECTED_COLOR : DEFAULT_COLOR },
            pressedIndex === tabItemIndex && styles.iconPressed,
          ];

          return (
            <TouchableOpacity
              key={route.key} // Use route.key for key
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              onLongPress={onLongPress}
              onPressIn={() => setPressedIndex(tabItemIndex)}
              onPressOut={() => setPressedIndex(null)}
              style={styles.tabButton}
            >
              <View style={styles.iconContainer}>
                <Image source={item.icon} style={iconStyle} resizeMode="contain" />
                {item.badgeCount && item.badgeCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badgeCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBar: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e2e2',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 28,
    height: 28,
  },
  iconPressed: {
    transform: [{ scale: 0.85 }],
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    backgroundColor: 'red', // Or SELECTED_COLOR
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default CustomBottomTabBar;
