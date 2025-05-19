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
import { supabase } from '../supabaseClient';

type Props = NativeStackScreenProps<RootStackParamList, 'Registration'>;

export const RegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState(''); // Confirmation password
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // const [firstName, setFirstName] = useState(''); // Example if collecting name here
  // const [lastName, setLastName] = useState('');   // Example if collecting name here

  // Basic email validation (optional, enhance if needed)
  const isEmailValid = (emailToTest: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToTest);
  };

  // Connect to Supabase with user ID - NO LONGER NEEDED, REMOVE THIS FUNCTION
  /*
  const connectToSupabase = async (userId: string) => {
    try {
      // Sign up user in Supabase
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            user_id: userId, // This was linking to Django user ID, not needed with pure Supabase auth
          }
        }
      });
      
      if (error) {
        console.error("Supabase auth error:", error);
        return false;
      }
      
      console.log("Supabase connection established");
      return true;
    } catch (error) {
      console.error("Error connecting to Supabase:", error);
      return false;
    }
  };
  */

  // --- Auto-login function --- - NO LONGER NEEDED, REMOVE THIS FUNCTION
  /*
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
        Alert.alert("Registration Successful", "Account created, but auto-login failed. Please sign in manually.");
        navigation.navigate('EmailSignIn');
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
      
      // Add this section - Fetch user profile and connect to Supabase
      try {
        const profileResponse = await fetch(`${API_BASE_URL}/api/profiles/me/`, {
          headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (profileResponse.ok) {
          const userData = await profileResponse.json();
          
          // Connect to Supabase with user data
          // await connectToSupabase(userData.user.id.toString()); // Old logic
        }
      } catch (profileErr) {
        console.error("Error fetching profile after registration:", profileErr);
        // Continue anyway since registration and login were successful
      }
      
      return true;

    } catch (loginErr) {
      console.error("Error during auto-login fetch:", loginErr);
      Alert.alert("Registration Successful", "Account created, but a network error occurred during auto-login. Please sign in manually.");
      navigation.navigate('EmailSignIn');
      return false;
    }
  }
  */

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
      // Directly sign up with Supabase
      // If you collect first name / last name on this screen, pass them in options.data
      // e.g., data: { full_name: `${firstName} ${lastName}` }
      // Our DB trigger will pick up 'email', 'full_name', 'avatar_url' from raw_user_meta_data
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: email,
        password: password,
        options: {
          data: {
            // If you have full_name or other initial data from this screen, add it here.
            // For example, if you have a 'fullName' state:
            // full_name: fullName 
          }
        }
      });

      if (signUpError) {
        console.error("Supabase Registration error:", signUpError.message);
        // Consider mapping common Supabase errors to user-friendly messages
        if (signUpError.message.includes("User already registered")) {
             setError("This email is already registered. Please try logging in.");
        } else if (signUpError.message.includes("Password should be at least 6 characters")) {
            setError("Password is too short. It must be at least 6 characters."); // Supabase default is 6
        } else {
            setError(signUpError.message || "An error occurred during registration.");
        }
        setLoading(false);
        return;
      }

      // According to Supabase docs, if signUp is successful and email confirmation is OFF,
      // data.user will contain the user and data.session the session.
      // If email confirmation is ON, data.user will contain the user, but data.session will be null.
      // The user will need to confirm their email before they can log in.
      // The onAuthStateChange listener should handle the session establishment.

      console.log('Supabase Registration successful:', signUpData);

      // If user creation was successful, navigate to NameScreen to start onboarding.
      // The onAuthStateChange listener in RootNavigator will manage the session state.
      // If email confirmation is required, the user won't be able to fully use the app 
      // (e.g. sign in again after logout) until confirmed, but can proceed with initial profile setup.
      if (signUpData.user) {
        // navigation.replace('Name');  // REMOVE THIS: RootNavigator now handles initial route based on onboarding status
        // The onAuthStateChange will trigger, RootNavigator will fetch profile,
        // see onboarding_completed is false, and set initial route to Name.
        console.log("User signed up. RootNavigator will handle navigation.");
      } else {
        // This case should ideally not be reached if signUpError is null,
        // but as a fallback if user is somehow not created without an error.
        setError("Could not create user. Please try again.");
      }

    } catch (err: any) { // Catch any other unexpected errors
      const message = err.message || 'An unknown error occurred during registration.';
      console.error("Unexpected Registration error:", message, err);
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
