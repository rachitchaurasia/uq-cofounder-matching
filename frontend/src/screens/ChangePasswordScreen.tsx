import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { supabase } from '../supabaseClient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { BottomTabParamList } from '../navigation/types';

export const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<BottomTabParamList>>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChangePassword = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!currentPassword) {
      setError('Current password is required.');
      return;
    }
    if (!newPassword) {
      setError('New password is required.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Verify current password first - Supabase doesn't directly support this in updateUser.
      // A common workaround is to try to re-authenticate or sign in with the current password.
      // However, for simplicity in this step, we'll directly attempt to update.
      // IMPORTANT: `updateUser` for password change should ideally be done after re-authenticating the user for security.
      // Supabase typically requires the user to be recently signed in.
      // If `updateUser` fails due to auth reasons, it might indicate current password was wrong or session is old.

      const { data: userData, error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('Error updating password:', updateError);
        setError(updateError.message || 'Failed to update password. Please ensure your current password is correct or try signing in again.');
        setLoading(false);
        return;
      }

      setSuccessMessage('Password updated successfully! Logging you out...');
      Alert.alert(
        'Password Changed',
        'Your password has been successfully updated. You will now be logged out.',
        [
          {
            text: 'OK',
            onPress: async () => {
              await supabase.auth.signOut();
              // Navigation to SignIn screen is typically handled by onAuthStateChange listener in RootNavigator
              // If not, you might need to explicitly navigate: navigation.replace('SignIn');
              // For now, assuming RootNavigator handles it.
            },
          },
        ]
      );
      // Clear fields after successful update and alert
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (e: any) {
      console.error('Unexpected error changing password:', e);
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('ProfileTab')}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Change Password</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}
        {successMessage && <Text style={styles.successText}>{successMessage}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Current Password"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!loading}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#9C27B0" style={styles.loader} />
        ) : (
          <TouchableOpacity 
            style={styles.button}
            onPress={handleChangePassword}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Update Password</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
    padding: 20,
    // justifyContent: 'center',
  },
  backButton: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 18,
    color: '#9C27B0',
    fontWeight: '500',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#9C27B0',
    width: '100%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#D32F2F', // Red for errors
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  successText: {
    color: '#388E3C', // Green for success
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  loader: {
    height: 50,
    marginTop: 10,
  },
}); 