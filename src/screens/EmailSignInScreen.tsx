import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types'; 

type Props = NativeStackScreenProps<RootStackParamList, 'EmailSignIn'>;

export const EmailSignInScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Basic email validation regex
  const isEmailValid = (emailToTest: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToTest);
  };

  const handleSignIn = () => {
    setError(null); // Clear previous errors

    if (!email.trim() || !password.trim()) {
      setError('Email and password cannot be empty.');
      return;
    }

    if (!isEmailValid(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // --- Placeholder for actual sign-in logic ---
    // Here the backend team should typically call the authentication service
    console.log('Attempting Sign In with:', email, password);
    // If sign-in fails from the backend, you would setError here
    // e.g., setError('Invalid email or password.');

    // Alert.alert('Sign In Successful', `Email: ${email}`); // Example success feedback
    // navigation.navigate('SomeOtherScreen'); // Navigate on success
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
            style={[styles.input, error && (error.includes('email') || error.includes('Email')) && styles.inputError]}
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
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, error && (error.includes('password') || error.includes('Password')) && styles.inputError]}
            placeholder="Enter your password"
            placeholderTextColor="#A0A0A0"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (error) setError(null); // Clear error when user types
            }}
            secureTextEntry
            textContentType="password"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleSignIn}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
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
});
