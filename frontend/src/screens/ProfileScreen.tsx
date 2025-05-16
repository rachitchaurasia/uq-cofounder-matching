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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import { updateProfile } from '../api/profile';
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

// Define the type for our profile data
interface ProfileData {
  user?: {
    email: string;
    first_name: string;
    last_name: string;
    id?: number;
  };
  about?: string;
  city?: string;
  region?: string;
  created_at?: string;
  current_company_name?: string;
  position?: string;
  url?: string;
  phone?: string;
  skills?: string;
  interests?: string;
  startup_industries?: string;
}

export const ProfileScreen: React.FC<ProfileTabScreenProps> = ({ navigation }) => {
const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [runningMatch, setRunningMatch] = useState(false);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [showMatchModal, setShowMatchModal] = useState(false);

  // Fetch profile data
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'You need to be logged in');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/profiles/me/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfileData(data);
      setBio(data.about || '');
      setWebsite(data.url || '');
      setPhone(data.phone || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Save edited fields
  const saveChanges = async () => {
    try {
      const payload = {
        about: bio,
        url: website,
        // The phone field might not be directly in the model, may need adjustment
        phone: phone
      };

      await updateProfile(payload);
      setEditing(false);
      fetchProfile(); // Refresh data
    } catch (error) {
      console.error('Error saving changes:', error);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  // Run matching algorithm
  const runMatching = async () => {
    if (!profileData?.user?.id) {
      Alert.alert('Error', 'Profile data not loaded');
      return;
    }

    setRunningMatch(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'You need to be logged in');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/matching/run/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to run matching');
      }

      // Navigate to the matches screen instead of showing modal
      navigation.getParent()?.navigate('MatchesTab');
    } catch (error) {
      console.error('Error running matching:', error);
      Alert.alert('Error', 'Failed to run matching algorithm');
    } finally {
      setRunningMatch(false);
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
      profileData.user?.first_name,
      profileData.user?.last_name,
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

  const completion = calculateCompletion();

  // Add this function to handle connecting with a match
  const handleConnect = async (userId: number) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'You need to be logged in');
        return;
      }
      
      // First navigate to the MessageTab
      navigation.getParent()?.navigate('MessagesTab');
      
      // Create or open chat with this user
      // In a real implementation, you would call your backend to start a conversation
      Alert.alert('Success', 'Connection request sent!');
    } catch (error) {
      console.error('Error connecting with user:', error);
      Alert.alert('Error', 'Failed to connect with user');
    }
  };

  // Update the renderMatchItem function to include a Connect button
  const renderMatchItem = ({ item }: { item: MatchResult }) => (
    <View style={styles.matchItem}>
      <View style={styles.matchInfo}>
        <Text style={styles.matchName}>{item.name}</Text>
        <Text style={styles.matchScore}>{Math.round(item.score * 100)}% Match</Text>
      </View>
      <TouchableOpacity 
        style={styles.connectButton}
        onPress={() => handleConnect(item.user_id)}
      >
        <Text style={styles.connectButtonText}>Connect</Text>
      </TouchableOpacity>
    </View>
  );

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
          <Text style={styles.name}>{profileData?.user?.first_name + ' ' + profileData?.user?.last_name || 'Your Name'}</Text>

          <Text style={styles.name}>{profileData?.current_company_name || 'Your Company'}</Text>
          <Text style={styles.tagline}>{profileData?.position || 'Your Position'}</Text>
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profileData?.user?.email || 'No email provided'}</Text>
            
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
          style={styles.matchButton}
          onPress={runMatching}
          disabled={runningMatch}
        >
          {runningMatch ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.matchButtonText}>MATCH</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.newsletterBanner}
          onPress={() => nav.navigate("SignIn")}
        >
          <Text style={styles.newsletterText}>LOGOUT</Text>
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
      
      {/* Match Results Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showMatchModal}
        onRequestClose={() => setShowMatchModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Your Matches</Text>
            
            {matchResults.length > 0 ? (
              <FlatList
                data={matchResults}
                renderItem={renderMatchItem}
                keyExtractor={(item) => item.user_id.toString()}
                style={styles.matchList}
              />
            ) : (
              <Text style={styles.noMatchesText}>No matches found</Text>
            )}
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowMatchModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
