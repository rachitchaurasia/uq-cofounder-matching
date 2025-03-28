import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { SignInScreen } from '../screens/SignInScreen';
import { NameScreen } from '../screens/NameScreen';
import { Role } from '../screens/Role'; // Import the new Role component

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: 'transparent'
          }
        }}
      >
        <Stack.Screen 
          name="SignIn" 
          component={SignInScreen}
        />
        <Stack.Screen 
          name="Name" 
          component={NameScreen}
        />
        <Stack.Screen 
          name="Role" 
          component={Role} // Add the new Role screen
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};