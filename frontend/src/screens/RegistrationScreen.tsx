import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types'; // Adjust path if needed
import { API_BASE_URL } from '../config'; // Adjust path if needed
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

type Props = NativeStackScreenProps<RootStackParamList, 'Registration'>;

export const RegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState(''); // Confirmation password
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Basic email validation (optional, enhance if needed)
  const isEmailValid = (emailToTest: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToTest);
  };

  // --- Auto-login function ---
  const attemptAutoLogin = async () => {
      console.log(`Attempting auto-login for ${email}`);
      try {
          const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify({ username: email, email: email, password: password }),
          });
          const loginData = await loginResponse.json();

          if (!loginResponse.ok) {
              console.error("Auto-login failed:", loginData);
              // Show error but let user proceed to login manually later
              Alert.alert("Registration Successful", "Account created, but auto-login failed. Please sign in manually.");
              navigation.navigate('EmailSignIn'); // Go to login screen
              return false;
          }

          const authToken = loginData.key;
          if (!authToken) {
              console.error("Auto-login successful, but token not received.");
              Alert.alert("Registration Successful", "Account created, but failed to retrieve session. Please sign in manually.");
              navigation.navigate('EmailSignIn');
              return false;
          }

          await AsyncStorage.setItem('authToken', authToken);
          console.log('Auto-login successful, token stored.');
          return true; // Indicate success

      } catch (loginErr: any) {
          console.error("Error during auto-login fetch:", loginErr);
          Alert.alert("Registration Successful", "Account created, but a network error occurred during auto-login. Please sign in manually.");
          navigation.navigate('EmailSignIn');
          return false;
      }
  }

  const handleRegister = async () => {
    setError(null);

    if (!email.trim() || !password.trim() || !password2.trim()) {
      setError("All fields are required.");
      return;
    }
    if (!isEmailValid(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      console.log(`Attempting registration for ${email} at ${API_BASE_URL}/api/auth/registration/`);
      const response = await fetch(`${API_BASE_URL}/api/auth/registration/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            username: email,      // Send email as username
            password1: password,  // Send password as password1
            password2: password2  // Keep password2 for confirmation
        }),
      });

      const data = await response.json();
      console.log("Registration response status:", response.status);
      console.log("Registration response data:", data);

      if (!response.ok) {
        let errorMessage = `Registration failed (Status: ${response.status})`;
         if (data.email && data.email.length > 0) {
            errorMessage = `Email: ${data.email[0]}`;
        } else if (data.username && data.username.length > 0) { // Check for username errors too
            errorMessage = `Username: ${data.username[0]}`;
        } else if (data.password1 && data.password1.length > 0) { // Check password1 errors
             errorMessage = `Password: ${data.password1[0]}`;
        } else if (data.password && data.password.length > 0) { // Fallback check for general password errors
             errorMessage = `Password: ${data.password[0]}`;
        } else if (data.detail) {
            errorMessage = data.detail;
        } else {
             const errors = Object.entries(data).map(([key, value]) =>
                `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
             ).join('\n');
             if (errors) errorMessage = errors;
        }
        throw new Error(errorMessage);
      }

      console.log('Registration successful:', data);

      // --- Step 2: Auto-Login ---
      const loginSuccess = await attemptAutoLogin();

      if (loginSuccess) {
          // Navigate to the FIRST screen of the onboarding flow
          // Use replace to prevent going back to registration
          navigation.replace('Name'); // <<< Navigate to Name screen first
      }
      // If login failed, attemptAutoLogin already handled navigation/alert

    } catch (err: any) {
      const message = err.message || 'An unknown error occurred during registration.';
      console.error("Registration error:", message, err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <LinearGradient
      colors={['#000000', '#D400FF']} // Consistent gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Add Back Button if desired */}
         <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Image
            source={require('../assets/back-button.png')} // Make sure asset exists
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <View style={styles.content}>
           <Text style={styles.title}>Create Account</Text>

           <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, error && (error.includes('email') || error.includes('Email')) && styles.inputError]}
            placeholder="Enter your email"
            placeholderTextColor="#A0A0A0"
            value={email}
            onChangeText={(text) => { setEmail(text); setError(null); }}
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
             editable={!loading}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, error && (error.includes('password') || error.includes('Password')) && styles.inputError]}
            placeholder="Enter password (min 8 chars)"
            placeholderTextColor="#A0A0A0"
            value={password}
            onChangeText={(text) => { setPassword(text); setError(null); }}
            secureTextEntry
            textContentType="newPassword" // Help password managers
             editable={!loading}
          />

          <Text style={styles.label}>Confirm Password</Text>
           <TextInput
            style={[styles.input, error && error.includes('match') && styles.inputError]} // Highlight if passwords don't match
            placeholder="Confirm your password"
            placeholderTextColor="#A0A0A0"
            value={password2}
            onChangeText={(text) => { setPassword2(text); setError(null); }}
            secureTextEntry
            textContentType="newPassword"
             editable={!loading}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          {loading ? (
            <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader}/>
          ) : (
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
          )}

           {/* Link back to Sign In */}
           <TouchableOpacity
             style={styles.signInLink}
             onPress={() => !loading && navigation.navigate('EmailSignIn')}
             disabled={loading}
           >
             <Text style={styles.signInLinkText}>Already have an account? Sign In</Text>
           </TouchableOpacity>

        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

// --- Styles (adapt from EmailSignInScreen) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
   backButton: { // Added back button style
    padding: 20,
    alignSelf: 'flex-start',
  },
  backIcon: { // Added back icon style
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: 'center', // Center content vertically
    paddingBottom: 30, // Add some padding at the bottom
  },
   title: { // Added title style
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30, // Space below title
    textAlign: 'center',
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'white',
    marginBottom: 15, // Reduced bottom margin slightly
    paddingHorizontal: 20,
    fontSize: 16,
    color: 'white',
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 1.5,
  },
  registerButton: { // Renamed from signInButton
    backgroundColor: '#2B95D6',
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15, // Adjusted margin
  },
  registerButtonText: { // Renamed from signInButtonText
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#FFADAD',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10, // Space below error
  },
  loader: {
      height: 50, // Match button height
      marginTop: 15,
      marginBottom: 15, // Add margin below loader
  },
  signInLink: { // Renamed from registerLink
    marginTop: 25,
    alignItems: 'center',
  },
  signInLinkText: { // Renamed from registerLinkText
      color: '#FFFFFF',
      fontSize: 14,
      textDecorationLine: 'underline',
  }
});

// Default export if needed
// export default RegistrationScreen;
