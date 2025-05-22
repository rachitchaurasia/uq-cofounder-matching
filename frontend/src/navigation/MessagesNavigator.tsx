import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MessagesStackParamList } from './types';
import { MessagesScreen } from '../screens/MessagesScreen';
import { ConversationScreen } from '../screens/ConversationScreen';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

const Stack = createNativeStackNavigator<MessagesStackParamList>();

// Custom back button component to ensure navigation works properly
const CustomBackButton = () => {
  const navigation = useNavigation<NavigationProp<MessagesStackParamList>>();

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // If can't go back (navigated directly from another tab),
      // go to MessagesList screen
      navigation.navigate('MessagesList');
    }
  };
};

export const MessagesNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MessagesList" 
        component={MessagesScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Conversation" 
        component={ConversationScreen}
        options={({ route }) => ({
          title: 'Chat', // This will be dynamically updated with user name
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#9C27B0',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          // Always show back button, even when accessed from other tabs
          headerBackVisible: true,
        })}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  backButtonIcon: {
    width: 24,
    height: 24,
    tintColor: '#9C27B0',
  },
}); 