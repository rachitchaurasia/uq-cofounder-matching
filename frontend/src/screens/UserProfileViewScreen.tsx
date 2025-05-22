import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { supabase } from '../supabaseClient';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const defaultLogo = require('../assets/company-logo.png'); // Ensure this path is correct

// Define the type for our profile data - Align with Supabase 'profiles' table
interface ProfileData {
  id: string;
  updated_at?: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  city?: string;
  country_code?: string;
  region?: string;
  about?: string;
  url?: string; 
  position?: string;
  current_company_name?: string;
  current_company_id?: string;
  experience_details?: string;
  experience_level?: string;
  education_summary?: string;
  education_details?: string;
  skills?: any; 
  skill_categories?: any; 
  languages?: string;
  interests?: any; 
  startup_industries?: any;
  startup_goals?: string;
  certifications?: string;
  courses?: string;
  recommendations_count?: number;
  volunteer_experience?: string;
  role?: string;
  show_role_on_profile?: boolean;
  looking_for?: string;
  offers?: string;
  phone?: string;
  created_at?: string;
}

type UserProfileViewScreenRouteProp = RouteProp<RootStackParamList, 'UserProfileViewScreen'>;
type UserProfileViewScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'UserProfileViewScreen'>;

export const UserProfileViewScreen: React.FC = () => {
  const route = useRoute<UserProfileViewScreenRouteProp>();
  const navigation = useNavigation<UserProfileViewScreenNavigationProp>();
  const { userId, isReadOnly } = route.params; // isReadOnly is available if needed, but functionality is inherently read-only

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        Alert.alert('Error', 'User ID not provided.');
        setLoading(false);
        navigation.goBack();
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching user profile from Supabase:', error);
          Alert.alert('Error', 'Could not load user profile.');
          navigation.goBack();
          return;
        }

        if (data) {
          setProfileData(data as ProfileData);
        } else {
          Alert.alert('Profile Not Found', 'This user\'s profile could not be loaded.');
          navigation.goBack();
        }
      } catch (error: any) {
        console.error('Error fetching user profile:', error);
        Alert.alert('Error', error.message || 'Failed to load profile data');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a702c8" />
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
            <Text style={styles.headerBackButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>User profile not available.</Text>
        </View>
      </View>
    );
  }
  
  const renderArrayToString = (data: any, defaultText = 'Not specified') => {
    if (Array.isArray(data)) {
      return data.join(', ');
    }
    if (typeof data === 'string' && data.trim() !== '') {
      return data;
    }
    return defaultText;
  };


  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
          <Text style={styles.headerBackButtonText}>← Back to Matches</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profileData.full_name || 'User Profile'}</Text>
      </View>

      <View style={styles.profileCard}>
        <Image 
          source={profileData.avatar_url ? { uri: profileData.avatar_url } : defaultLogo} 
          style={styles.profileImage} 
          resizeMode="cover" // Changed to cover for better image display
        />
        <Text style={styles.fullName}>{profileData.full_name || 'N/A'}</Text>
        <Text style={styles.position}>
            {profileData.position || (profileData.role && profileData.show_role_on_profile ? profileData.role : 'Role not specified')}
        </Text>
        {(profileData.city || profileData.region) && (
            <Text style={styles.location}>{`${profileData.city || ''}${profileData.city && profileData.region ? ', ' : ''}${profileData.region || ''}`}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.sectionContent}>{profileData.about || 'No information provided.'}</Text>
      </View>
      
      {profileData.skills && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text style={styles.sectionContent}>{renderArrayToString(profileData.skills)}</Text>
        </View>
      )}

      {profileData.interests && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <Text style={styles.sectionContent}>{renderArrayToString(profileData.interests)}</Text>
        </View>
      )}
      
      {profileData.startup_industries && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Startup Industries</Text>
          <Text style={styles.sectionContent}>{renderArrayToString(profileData.startup_industries)}</Text>
        </View>
      )}

      {profileData.looking_for && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Looking For</Text>
          <Text style={styles.sectionContent}>{profileData.looking_for}</Text>
        </View>
      )}

      {profileData.offers && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offers</Text>
          <Text style={styles.sectionContent}>{profileData.offers}</Text>
        </View>
      )}

      {/* Add more sections as needed, e.g., Experience, Education, etc. */}
      {/* Ensure all displayed data is handled for null/undefined cases */}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerBackButton: {
    marginRight: 15,
    padding: 5,
  },
  headerBackButtonText: {
    fontSize: 16,
    color: '#a702c8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    margin: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60, // Make it circular
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#a702c8',
  },
  fullName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  position: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
    textAlign: 'center',
  },
  location: {
      fontSize: 14,
      color: '#777',
      marginBottom: 10,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
}); 