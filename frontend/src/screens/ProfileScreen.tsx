import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import { supabase } from '../supabaseClient';
import { ProfileTabScreenProps } from '../navigation/types';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
const defaultLogo = require('../assets/company-logo.png');


// Define the type for match results
interface MatchResult {
  user_id: number;
  name: string;
  score: number;
}

// Define the type for our profile data - Align with Supabase 'profiles' table
interface ProfileData {
  id: string; // UUID from auth.users
  updated_at?: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  city?: string;
  country_code?: string;
  region?: string;
  about?: string;
  url?: string; // LinkedIn URL?
  position?: string;
  current_company_name?: string;
  current_company_id?: string;
  experience_details?: string;
  experience_level?: string;
  education_summary?: string;
  education_details?: string;
  skills?: any; // JSONB, could be string[] or object, handle accordingly
  skill_categories?: any; // JSONB
  languages?: string;
  interests?: any; // JSONB
  startup_industries?: any; // JSONB
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

export const ProfileScreen: React.FC<ProfileTabScreenProps> = ({ navigation }) => {
const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');

  // Fetch profile data
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You need to be logged in to view your profile.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching Supabase profile:', error);
        if (error.code === 'PGRST116' || error.message.includes('JSON object requested, multiple (or no) rows returned')) {
          Alert.alert('Profile Not Found', 'Could not find your profile. It might still be setting up if you just registered.');
        } else {
          throw error;
        }
      }

      if (data) {
        setProfileData(data as ProfileData);
      setBio(data.about || '');
      setWebsite(data.url || '');
      setPhone(data.phone || '');
      } else if (!error) {
         Alert.alert('Profile Not Found', 'Your profile data could not be loaded.');
      }

    } catch (error: any) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', error.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    } else {
      // navigation.reset or navigate to SignIn is typically handled by onAuthStateChange listener
      // If not, you can explicitly navigate here:
      // nav.reset({ index: 0, routes: [{ name: 'SignIn' }] }); 
      // For now, we assume onAuthStateChange will handle it.
      console.log('User logged out');
    }
  };

  // Save edited fields
  const saveChanges = async () => {
    if (!profileData?.id) {
        Alert.alert('Error', 'Profile not loaded, cannot save changes.');
        return;
    }
    setLoading(true);
    try {
      const updates: Partial<ProfileData> = {
        about: bio,
        url: website,
        phone: phone,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profileData.id);

      if (error) {
        throw error;
      }

      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
      await fetchProfile();
    } catch (error: any) {
      console.error('Error saving changes:', error);
      Alert.alert('Error', error.message || 'Failed to save changes');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6D28D9" />
      </View>
    );
  }

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    if (!profileData) return 0;
    
    const fields = [
      profileData.full_name,
      profileData.about,
      profileData.city,
      profileData.region,
      profileData.current_company_name,
      profileData.url,
      profileData.skills,
      profileData.interests,
      profileData.startup_industries
    ];
    
    const filledFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completion = React.useMemo(() => calculateCompletion(), [profileData]);

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PROFILE</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={defaultLogo} 
              style={styles.profileImage} 
              resizeMode="contain"
            />
            <View style={styles.completionBadge}>
              <Text style={styles.completionText}>{completion}% COMPLETE</Text>
            </View>
          </View>
          <Text style={styles.name}>{profileData?.full_name || 'Your Name'}</Text>

          <Text style={styles.name}>{profileData?.current_company_name || 'Your Company'}</Text>
          <Text style={styles.tagline}>{profileData?.position || 'Your Position'}</Text>
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profileData?.email || 'No email provided'}</Text>
            
            <Text style={styles.infoLabel}>When did you start building this project?</Text>
            <Text style={styles.infoValue}>
              {profileData?.created_at 
                ? new Date(profileData.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: '2-digit' 
                  }) 
                : 'Not specified'}
            </Text>
            
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>
              {[profileData?.city, profileData?.region].filter(Boolean).join(', ') || 'Not specified'}
            </Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonIcon}>🔒</Text>
            <Text style={styles.actionButtonText}>SAFETY</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonIcon}>♡</Text>
            <Text style={styles.actionButtonText}>Saved Contact</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setEditing(!editing)}
          >
            <Text style={styles.actionButtonIcon}>⚙️</Text>
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bioSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>BIO</Text>
            {editing && (
              <TouchableOpacity onPress={() => setBio(profileData?.about || '')}>
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            )}
          </View>
          {editing ? (
            <TextInput
              style={styles.bioInput}
              multiline
              value={bio}
              onChangeText={setBio}
              placeholder="Add a bio..."
            />
          ) : (
            <Text style={styles.bioText}>
              {profileData?.about || 'No bio added yet.'}
            </Text>
          )}
        </View>

        <View style={styles.detailSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>WEBSITE</Text>
            {editing && (
              <TouchableOpacity onPress={() => setWebsite(profileData?.url || '')}>
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            )}
          </View>
          {editing ? (
            <TextInput
              style={styles.detailInput}
              value={website}
              onChangeText={setWebsite}
              placeholder="Add website URL..."
              keyboardType="url"
            />
          ) : (
            <Text style={styles.detailText}>
              {profileData?.url || 'No website added yet.'}
            </Text>
          )}
        </View>

        <View style={styles.detailSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PHONE</Text>
            {editing && (
              <TouchableOpacity onPress={() => setPhone('')}>
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            )}
          </View>
          {editing ? (
            <TextInput
              style={styles.detailInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="Add phone number..."
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.detailText}>
              {phone || 'No phone number added yet.'}
            </Text>
          )}
        </View>

        {editing && (
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={saveChanges}
          >
            <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.newsletterBanner}
          onPress={handleLogout}
          disabled={loading}
        >
          <Text style={styles.newsletterText}>LOGOUT</Text>
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </>
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
    justifyContent: 'center',
    height: 60,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#9C27B0',
  },
  completionBadge: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#9C27B0',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  completionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  infoContainer: {
    width: '100%',
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginHorizontal: 20,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  bioSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  editIcon: {
    fontSize: 18,
  },
  bioText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  bioInput: {
    fontSize: 14,
    color: '#555',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5,
    padding: 10,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  detailSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
  },
  detailInput: {
    fontSize: 14,
    color: '#555',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5,
    padding: 10,
  },
  saveButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  newsletterBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    marginHorizontal: 20,
    marginTop: 25,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  newsletterText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  badgeContainer: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#9C27B0',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  matchButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 25,
  },
  matchButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  matchList: {
    width: '100%',
    marginBottom: 15,
  },
  matchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    width: '100%',
  },
  matchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  matchScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  connectButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noMatchesText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 20,
  },
  closeButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
