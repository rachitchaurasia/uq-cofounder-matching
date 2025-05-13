import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from './types'; // Your type definitions
import CustomBottomTabBar from './BottomTabBar'; // Your custom tab bar

import { NewsFeedScreen } from '../screens/NewsFeedScreen';
import { NetworkingEventScreen } from '../screens/NetworkingEventScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MatchesScreen } from '../screens/MatchesScreen';
import { MessagesNavigator } from './MessagesNavigator';
// Placeholder screens for other tabs
const PlaceholderScreen = ({ route }: any) => {
  const { View, Text } = require('react-native');
  return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><Text>Screen for: {route.name}</Text></View>;
}

const Tab = createBottomTabNavigator<BottomTabParamList>();

const AppTabs = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomBottomTabBar {...props} />}
      screenOptions={{ headerShown: false }} // Hide default header for tab screens
    >
      <Tab.Screen name="HomeTab" component={NewsFeedScreen} />
      <Tab.Screen name="EventsTab" component={NetworkingEventScreen} />
      <Tab.Screen name="MatchesTab" component={MatchesScreen} />
      <Tab.Screen name="ChatbotTab" component={PlaceholderScreen} />
      <Tab.Screen name="MessagesTab" component={MessagesNavigator} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default AppTabs;
