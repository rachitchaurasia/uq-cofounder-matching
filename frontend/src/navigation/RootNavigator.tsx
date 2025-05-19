import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { supabase } from '../supabaseClient'; // Import Supabase client
import { Session } from '@supabase/supabase-js'; // Import Session type
import { View, Text, ActivityIndicator } from 'react-native'; // Added for loading indicator

import { SignInScreen } from '../screens/SignInScreen';
import { NameScreen } from '../screens/NameScreen';
import { Role } from '../screens/Role';
import { EmailSignInScreen } from '../screens/EmailSignInScreen';
import { Interests } from '../screens/Interests';
import { Expertise } from '../screens/Expertise';
import { WorkingScreen } from '../screens/WorkingScreen';
import { LookingScreen } from '../screens/LookingScreen';
import { OfferScreen } from '../screens/OfferScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { RegistrationScreen } from '../screens/RegistrationScreen';
import AppTabs from './AppTabs';
import { NewsDetailScreen } from '../screens/NewsDetailScreen';
import { CompanyInfoScreen } from '../screens/CompanyInfoScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingInit, setLoadingInit] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false); // New loading state for profile fetch

  useEffect(() => {
    const fetchSessionAndProfile = async (currentSession: Session) => {
      if (currentSession && onboardingComplete === null && !loadingProfile) {
        setLoadingProfile(true);
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', currentSession.user.id)
            .single();

          if (error && error.code !== 'PGRST116') { // PGRST116: 0 rows
            console.error("Error fetching profile for onboarding status:", error);
          }
          setOnboardingComplete(profile?.onboarding_completed || false);
        } catch (e) {
          console.error("Exception fetching profile:", e);
          setOnboardingComplete(false); // Default to false if error
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setLoadingInit(false);
      if (initialSession) {
        fetchSessionAndProfile(initialSession);
      }
    }).catch(() => {
      setLoadingInit(false);
    });

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      console.log("Auth event:", _event, "Session:", currentSession ? currentSession.user.id : null);
      setSession(currentSession);
      if (loadingInit) setLoadingInit(false);

      if (_event === 'SIGNED_IN' && currentSession) {
        setOnboardingComplete(null); // Reset onboarding status to re-fetch
        fetchSessionAndProfile(currentSession);
      } else if (_event === 'SIGNED_OUT') {
        setOnboardingComplete(null); // Reset on sign out
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removed onboardingComplete from deps to avoid loops, manage inside effect

  if (loadingInit || (session && loadingProfile)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  // Determine initial route for authenticated stack
  let authenticatedInitialRoute: keyof RootStackParamList = "Welcome"; // Default to Welcome
  if (session && onboardingComplete === false) {
    authenticatedInitialRoute = "Name"; // Start onboarding
  } else if (session && onboardingComplete === true) {
    authenticatedInitialRoute = "MainApp"; // Go to main app
  }

  console.log("RootNavigator Decision:", {
    hasSession: !!session,
    onboardingCompleteStatus: onboardingComplete,
    profileLoading: loadingProfile,
    initialRoute: session ? authenticatedInitialRoute : "SignIn"
  });

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
        initialRouteName={session ? authenticatedInitialRoute : "SignIn"}
      >
        {session ? (
          // User is signed in - stack order might matter less if initialRouteName is solid
          <>
            {/* Onboarding Screens */}
            <Stack.Screen name="Name" component={NameScreen} />
            <Stack.Screen name="CompanyInfo" component={CompanyInfoScreen} />
            <Stack.Screen name="Role" component={Role} />
            <Stack.Screen name="Interests" component={Interests} />
            <Stack.Screen name="Expertise" component={Expertise} />
            <Stack.Screen name="Working" component={WorkingScreen} />
            <Stack.Screen name="Looking" component={LookingScreen} />
            <Stack.Screen name="Offer" component={OfferScreen} />
            
            {/* Post-Onboarding / Main App Screens */}
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="MainApp" component={AppTabs} />
            
            {/* Other top-level screens */}
            <Stack.Screen 
                name="NewsDetail" 
                component={NewsDetailScreen}
                options={{ headerShown: true, title: 'Article Details' }}
            />
          </>
        ) : (
          // No user is signed in
          <>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="EmailSignIn" component={EmailSignInScreen} />
            <Stack.Screen name="Registration" component={RegistrationScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};