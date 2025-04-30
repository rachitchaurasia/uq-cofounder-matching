import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export const SignInScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <LinearGradient
      colors={['#000000', '#D400FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>

        <View style={styles.content}>
          <Text style={styles.title}>CO-FOUNDER MATCHER</Text>
          
          <TouchableOpacity 
            style={styles.signInButton}
            onPress={() => console.log('Apple Sign In')}
          >
            <Text style={styles.buttonText}>SIGN IN WITH APPLE</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.signInButton}
            onPress={() => console.log('Facebook Sign In')}
          >
            <Text style={styles.buttonText}>SIGN IN WITH FACEBOOK</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.signInButton}
            onPress={() => navigation.navigate('EmailSignIn')}
          >
            <Text style={styles.buttonText}>SIGN IN</Text>
          </TouchableOpacity>

          {/* 🔥 Modified Join Now Button */}
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => navigation.navigate('Name')} // Navigate to Name screen
          >
            <Text style={styles.joinButtonText}>Not a member? Join now!</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By tapping Create Account or Sign In, you agree to our Terms. Learn how we process your data in our Privacy Policy and Cookies Policy.
          </Text>

          <TouchableOpacity onPress={() => navigation.navigate('TroubleSignIn')}>
            <Text style={styles.troubleText}>Trouble Signing In?</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  signInButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: '#2B95D6',
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
    opacity: 0.8,
  },
  troubleText: {
    color: 'white',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
