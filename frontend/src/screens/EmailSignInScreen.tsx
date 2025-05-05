import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

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
    setError(null); // Clear previous errors

    if (!email.trim() || !password.trim()) {
      setError('Email and password cannot be empty.');
      return;
    }

    if (!isEmailValid(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      console.log(`Attempting login for ${email} at ${API_BASE_URL}/api/auth/login/`);
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: email,
          email: email,
          password: password
        }),
      });

      const data = await response.json();
      console.log("Login response status:", response.status);
      console.log("Login response data:", data);

      if (!response.ok) {
        let errorMessage = `Login failed (Status: ${response.status})`;
        if (data.non_field_errors && data.non_field_errors.length > 0) {
            errorMessage = data.non_field_errors[0];
            if (errorMessage.includes("Unable to log in")) {
                 errorMessage = "Invalid email or password.";
            }
        } else if (data.detail) {
            errorMessage = data.detail;
        } else if (typeof data === 'string') {
            errorMessage = data;
        }
        throw new Error(errorMessage);
      }

      const authToken = data.key;
      if (!authToken) {
        console.error("Auth token (key) not found in response data:", data);
        throw new Error('Login successful, but token was not received.');
      }

      console.log('Login successful, received token:', authToken);
      await AsyncStorage.setItem('authToken', authToken);
      console.log('Auth token stored successfully.');

      navigation.replace('Welcome');

    } catch (err: any) {
      const message = err.message || 'An unknown error occurred during login.';
      console.error("Login error:", message, err);
      setError(message);
    } finally {
      setLoading(false);
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
  }
});
