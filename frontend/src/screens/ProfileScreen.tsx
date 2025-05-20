import React, { useState, useEffect, useMemo } from 'react';
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
import { ProfileQRCode } from '../components/ProfileQRCode';
import * as ImagePicker from 'expo-image-picker';
const defaultLogo = require('../assets/default-avatar.png');


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
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);

  // Calculate profile completion percentage - Moved before useMemo and early returns
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
    
    const filledFields = fields.filter(field => {
        if (field === null || typeof field === 'undefined') return false;
        if (typeof field === 'string') return field.trim() !== '';
        if (Array.isArray(field)) return field.length > 0;
        // Check if object is not empty
        if (typeof field === 'object' && field !== null) return Object.keys(field).length > 0; 
        return !!field; // boolean check for other non-empty values like numbers
    }).length;

    return fields.length > 0 ? Math.round((filledFields / fields.length) * 100) : 0;
  };
  
  // useMemo for completion, called unconditionally at the top level of the component body
  const completion = useMemo(() => calculateCompletion(), [profileData]);

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
        setFullName(data.full_name || '');
        setCity(data.city || '');
        setRegion(data.region || '');
        setCompanyName(data.current_company_name || '');
        setPosition(data.position || '');
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
        full_name: fullName,
        city: city,
        region: region,
        current_company_name: companyName,
        position: position,
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

  const handleImagePick = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for avatars
      quality: 0.8, // Compress image slightly
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      uploadAvatar(asset.uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    if (!profileData?.id) {
      Alert.alert('Error', 'Profile not loaded, cannot upload image.');
      return;
    }
    setUploading(true);
    try {
      const fileExt = uri.split('.').pop();
      const fileName = `${profileData.id}.${Date.now()}.${fileExt}`;
      const filePath = `${profileData.id}/${fileName}`;

      // React Native needs a different way to get the blob for FormData
      const response = await fetch(uri);
      const blob = await response.blob();

      const { data, error: uploadError } = await supabase.storage
        .from('avatars') // Make sure 'avatars' bucket exists and has correct policies
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true, // Overwrite if file with same name exists
          contentType: blob.type // Pass content type
        });

      if (uploadError) {
        console.error('Error uploading avatar to Supabase Storage:', uploadError);
        throw uploadError;
      }

      if (data) {
        // Get public URL for the uploaded file
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        const newAvatarUrl = urlData.publicUrl;

        // Update profile with the new avatar URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: newAvatarUrl, updated_at: new Date().toISOString() })
          .eq('id', profileData.id);

        if (updateError) {
          console.error('Error updating profile with new avatar URL:', updateError);
          throw updateError;
        }

        // Refresh profile data to show new image
        await fetchProfile(); 
        Alert.alert('Success', 'Profile picture updated!');
      }
    } catch (error: any) {
      console.error('Error uploading image or updating profile:', error);
      Alert.alert('Upload Failed', error.message || 'Could not upload image.');
    } finally {
      setUploading(false);
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
            <TouchableOpacity onPress={handleImagePick} disabled={uploading || editing}> 
              <Image 
                source={profileData?.avatar_url ? { uri: profileData.avatar_url } : defaultLogo} 
                style={styles.profileImage} 
                resizeMode="cover"
              />
              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              )}
              {!uploading && !editing && (
                <View style={styles.editImageButton}>
                  <Text style={styles.editImageText}>EDIT</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.completionBadge}>
              <Text style={styles.completionText}>{completion}% COMPLETE</Text>
            </View>
          </View>
          {editing ? (
            <TextInput
              style={styles.detailInput} 
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
              placeholderTextColor="#999"
            />
          ) : (
            <Text style={styles.name}>{profileData?.full_name || 'Your Name'}</Text>
          )}

          {editing ? (
            <TextInput
              style={styles.detailInput}
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="Your company name"
              placeholderTextColor="#999"
            />
          ) : (
            <Text style={styles.name}>{profileData?.current_company_name || 'Your Company'}</Text>
          )}
          
          {editing ? (
            <TextInput
              style={styles.detailInput}
              value={position}
              onChangeText={setPosition}
              placeholder="Your position/role"
              placeholderTextColor="#999"
            />
          ) : (
            <Text style={styles.tagline}>{profileData?.position || 'Your Position'}</Text>
          )}
          
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
            {editing ? (
              <>
                <TextInput
                  style={styles.detailInput}
                  value={city}
                  onChangeText={setCity}
                  placeholder="City"
                  placeholderTextColor="#999"
                />
                <TextInput
                  style={[styles.detailInput, { marginTop: 10 }]}
                  value={region}
                  onChangeText={setRegion}
                  placeholder="State/Region"
                  placeholderTextColor="#999"
                />
              </>
            ) : (
              <Text style={styles.infoValue}>
                {[profileData?.city, profileData?.region].filter(Boolean).join(', ') || 'Not specified'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Safety Info", "Safety features coming soon!")}>
            <Text style={styles.actionButtonIcon}>🔒</Text>
            <Text style={styles.actionButtonText}>SAFETY</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Saved Contacts", "Saved contacts feature coming soon!")}>
            <Text style={styles.actionButtonIcon}>♡</Text>
            <Text style={styles.actionButtonText}>SAVED</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setEditing(!editing)}
          >
            <Text style={styles.actionButtonIcon}>⚙️</Text>
            <Text style={styles.actionButtonText}>EDIT</Text>
          </TouchableOpacity>
        </View>

        {/* New row for Matches and QR Code buttons */}
        <View style={[styles.buttonsContainer, { marginTop: 10 }]}> 
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('MatchesTab')}
          >
            <Text style={styles.actionButtonIcon}>🤝</Text> 
            <Text style={styles.actionButtonText}>MATCHES</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowQRModal(true)}
          >
            <Text style={styles.actionButtonIcon}>📱</Text> 
            <Text style={styles.actionButtonText}>SHARE</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => nav.navigate('ChangePassword')}
          >
            <Text style={styles.actionButtonIcon}>🔑</Text> 
            <Text style={styles.actionButtonText}>PASSWORD</Text>
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

      {/* QR Code Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showQRModal}
        onRequestClose={() => {
          setShowQRModal(!showQRModal);
        }}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Scan to connect!</Text>
            {profileData?.id && <ProfileQRCode userId={profileData.id} size={250} />}
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setShowQRModal(!showQRModal)}
            >
              <Text style={styles.textStyle}>Hide QR Code</Text>
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
  modalCenteredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  buttonClose: {
    backgroundColor: "#9C27B0",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: '500'
  },
  nameDisplay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 5,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  editImageText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  }
});
