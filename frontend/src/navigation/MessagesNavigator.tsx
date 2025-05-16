import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MessagesStackParamList } from './types';
import { MessagesScreen } from '../screens/MessagesScreen';
import { ConversationScreen } from '../screens/ConversationScreen';

const Stack = createNativeStackNavigator<MessagesStackParamList>();

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
        })}
      />
    </Stack.Navigator>
  );
}; 