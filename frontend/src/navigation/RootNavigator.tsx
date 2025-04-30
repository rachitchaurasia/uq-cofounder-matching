import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { SignInScreen } from '../screens/SignInScreen';
import { NameScreen } from '../screens/NameScreen';
import { Role } from '../screens/Role';
import { EmailSignInScreen } from '../screens/EmailSignInScreen';
import { Interests } from '../screens/Interests';
import { Expertise } from '../screens/Expertise';
import { WorkingScreen } from '../screens/WorkingScreen';

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
          name="EmailSignIn"
          component={EmailSignInScreen}
        />
        <Stack.Screen 
          name="Name" 
          component={NameScreen}
        />
        <Stack.Screen 
          name="Role" 
          component={Role}
        />
        <Stack.Screen 
          name="Interests"
          component={Interests}
        />
        <Stack.Screen 
          name="Expertise"
          component={Expertise}
        />
        <Stack.Screen name="Working" 
        component={WorkingScreen} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};