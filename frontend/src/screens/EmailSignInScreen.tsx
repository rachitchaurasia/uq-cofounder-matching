import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types'; 
import { supabase } from '../supabaseClient';

type Props = NativeStackScreenProps<RootStackParamList, 'EmailSignIn'>;

export const EmailSignInScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Basic email validation regex
  const isEmailValid = (emailToTest: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToTest);
  };

  const handleSignIn = async () => {
      setError(null);
      setLoading(true);
      
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
        password: password,
      });

      if (signInError) {
        console.error("Supabase Sign-In error:", signInError.message);
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Please confirm your email before logging in.");
          Alert.alert("Email Not Confirmed", "Please check your email to confirm your account first.");
        } else {
          setError(signInError.message || "An error occurred during sign-in.");
        }
        setLoading(false);
        return;
      }
      
      console.log("Supabase Sign-In successful:", data);
      // Session is now handled by Supabase client and onAuthStateChange listener.
      // The global listener in RootNavigator.tsx should navigate the user appropriately.
      // No explicit navigation.reset() needed here.

    } catch (e: any) {
      console.error("Unexpected error in sign-in flow:", e);
      setError(e.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Input Required", "Please enter your email address to reset your password.");
      return;
    }
    if (!isEmailValid(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'yourapp://reset-password-callback' // Replace with your app's deep link for password reset callback if any
      });
      setLoading(false);
      if (resetError) {
        console.error("Password reset error:", resetError);
        Alert.alert("Error Sending Reset Email", resetError.message || "Could not send password reset email. Please try again.");
      } else {
        Alert.alert("Password Reset Email Sent", "If an account exists for this email, a password reset link has been sent. Please check your inbox (and spam folder).");
      }
    } catch (e: any) {
      setLoading(false);
      console.error("Forgot password unexpected error:", e);
      Alert.alert("Error", e.message || "An unexpected error occurred.");
    }
  };

  return (
    <LinearGradient
      colors={['#000000', '#D400FF']} // Same gradient as SignInScreen
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require('../assets/back-button.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, error && (error.includes('email') || error.includes('Email') || error.includes('Invalid')) && styles.inputError]}
            placeholder="Enter your email"
            placeholderTextColor="#A0A0A0"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError(null); // Clear error when user types
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
            editable={!loading}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, error && (error.includes('password') || error.includes('Password') || error.includes('Invalid')) && styles.inputError]}
            placeholder="Enter your password"
            placeholderTextColor="#A0A0A0"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (error) setError(null); // Clear error when user types
            }}
            secureTextEntry
            textContentType="password"
            editable={!loading}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          {loading ? (
            <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
          ) : (
            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.forgotPasswordLink}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => !loading && navigation.navigate('Registration')}
            disabled={loading}
          >
            <Text style={styles.registerLinkText}>Don't have an account? Join now!</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  backButton: {
    padding: 20,
    alignSelf: 'flex-start', // Position back button correctly
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 40, // Adjusted padding for content
    justifyContent: 'center',
    // alignItems: 'center', // Removed align items center to allow labels to align left
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
    alignSelf: 'flex-start', // Align labels to the left
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Slightly transparent white background
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'white',
    marginBottom: 20,
    paddingHorizontal: 20,
    fontSize: 16,
    color: 'white',
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 1.5,
  },
  signInButton: {
    backgroundColor: '#2B95D6', // Blue background like the design has from figma
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20, // Add some space above the button
  },
  signInButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#FFADAD',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    marginHorizontal: 10,
  },
  loader: {
    height: 50,
    marginTop: 10,
    marginBottom: 20,
  },
  registerLink: {
    marginTop: 25,
    alignItems: 'center',
  },
  registerLinkText: {
    color: '#FFFFFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  forgotPasswordLink: {
    marginTop: 15,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#B0B0B0', // Lighter color for less emphasis
    fontSize: 14,
    textDecorationLine: 'underline',
  }
});
