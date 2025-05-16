import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { updateProfile } from '../api/profile';

type Props = NativeStackScreenProps<RootStackParamList, 'CompanyInfo'>;

export const CompanyInfoScreen: React.FC<Props> = ({ navigation }) => {
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!companyName.trim()) {
      Alert.alert('Required Field', 'Please enter your company name');
      return;
    }
    
    if (!position.trim()) {
      Alert.alert('Required Field', 'Please enter your position');
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        current_company_name: companyName.trim(),
        position: position.trim()
      };
      
      await updateProfile(payload);
      console.log('Successfully saved company info');
      // Navigate to the next screen (Welcome or another onboarding screen)
      navigation.navigate('Role');
    } catch (error) {
      console.error('Failed to save company info:', error);
      Alert.alert('Error', 'Failed to save your company information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Your Company</Text>
        <Text style={styles.subtitle}>Let others know where you work</Text>
        
        <Text style={styles.label}>Company Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your company name"
          value={companyName}
          onChangeText={setCompanyName}
          editable={!loading}
        />
        
        <Text style={styles.label}>Your Position</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your position/role"
          value={position}
          onChangeText={setPosition}
          editable={!loading}
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
}); 