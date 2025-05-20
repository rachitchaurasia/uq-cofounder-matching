import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // No longer needed for fetching matches
// import { API_BASE_URL } from '../config'; // No longer needed for fetching matches
import { MatchCard } from '../components/MatchCard';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from '../navigation/types';
import { supabase } from '../supabaseClient'; // Import Supabase client

type MatchUser = {
  id: string; // Changed from number to string for Supabase UUID
  name: string;
  position: string;
  interests: string;
  imageUrl?: string;
  score?: number; // Will be replaced by actual matching algorithm
};

export const MatchesScreen: React.FC = () => {
  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 15;
  const navigation = useNavigation<BottomTabNavigationProp<BottomTabParamList>>();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async (reset = true) => {
    if (reset) {
      setLoading(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }
    
    try {
      // Get current Supabase user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        console.error('No Supabase user found');
        setMatches(getMockMatches());
        setHasMore(false);
        return;
      }

      // Fetch all profiles from Supabase, excluding the current user
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          position,
          interests,
          avatar_url,
          skills,
          startup_industries,
          offers,
          looking_for,
          role,
          show_role_on_profile
        `) // Select specific fields needed for matching and display
        .neq('id', currentUser.id); // Exclude current user

      if (error) {
        console.error('Error fetching profiles from Supabase:', error);
        setMatches(getMockMatches()); // Fallback to mock data on error
        setHasMore(false);
        return;
      }

      if (profiles) {
        // TODO: Integrate actual matching algorithm here
        // For now, just transform and assign a random score
        let potentialMatches: MatchUser[] = profiles.map(profile => {
          let interestsString = 'Interests not specified';
          if (Array.isArray(profile.interests)) {
            interestsString = profile.interests.join(', ');
          } else if (typeof profile.interests === 'string') {
            interestsString = profile.interests;
          }

          return {
            id: profile.id,
            name: profile.full_name || 'N/A',
            position: profile.position || (profile.role && profile.show_role_on_profile ? profile.role : 'Role not specified'),
            interests: interestsString,
            imageUrl: profile.avatar_url,
            score: Math.random() // Placeholder score
            // We'll need to pass the full profile object to the matching algorithm
          };
        });
        
        // Sort by score descending
        potentialMatches = potentialMatches.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        
        // Calculate pagination
        const startIndex = 0;
        const endIndex = reset ? itemsPerPage : (page * itemsPerPage);
        const paginatedMatches = potentialMatches.slice(startIndex, endIndex);
        
        // Update state
        setMatches(paginatedMatches);
        
        // Determine if there are more items to load
        setHasMore(paginatedMatches.length < potentialMatches.length);
        
        if (!reset) {
          setPage(page + 1);
        }
        
      } else {
        setMatches(getMockMatches()); // Fallback if no profiles found
      }

    } catch (e: any) { // Catch any type of error
      console.error('Error in fetchMatches:', e);
      setMatches(getMockMatches()); // Fallback to mock data on any unexpected error
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Mock data function - keep for fallback or initial testing
  const getMockMatches = (): MatchUser[] => {
    return [
      {
        id: "mock_101", // Changed to string
        name: 'Jack Smith (Mock)',
        position: 'AI Developer',
        interests: 'Interested in Machine Learning and AI Development',
        score: 0.85
      },
      {
        id: "mock_102", // Changed to string
        name: 'Emily Johnson (Mock)',
        position: 'Product Manager',
        interests: 'Startup Growth, Product Design',
        score: 0.78
      },
    ];
  };

  const handleConnect = async (userId: string) => { // userId is now string
    // Find the match
    const match = matches.find(m => m.id === userId);
    if (!match) {
      Alert.alert('Error', 'User not found');
      return;
    }
    
    try {
      // Ensure currentUser is available for creating chat room ID
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
          Alert.alert('Error', 'Current user not found. Cannot initiate chat.');
          return;
      }

      // Generate a consistent chat room ID
      const chatRoomId = currentUser.id < userId ? `${currentUser.id}_${userId}` : `${userId}_${currentUser.id}`;
      
      navigation.navigate('MessagesTab', { 
        screen: 'Conversation',
        params: { 
          conversationId: match.id, // Kept as match.id for clarity, it's the other user's ID
          channelId: chatRoomId, // Use the generated chat room ID
          otherUser: {
            id: match.id,
            name: match.name,
            position: match.position,
            imageUrl: match.imageUrl
            // No need for score here
          }
        }
      });
    } catch (error) {
      console.error('Error connecting with match:', error);
      Alert.alert('Error', 'Failed to connect with match. Please try again.');
    }
  };

  const goBack = () => {
    // Determine the correct back navigation. If MatchesScreen is a tab, 
    // going "back" might mean navigating to a different tab or the initial screen of the current tab.
    // For now, assume it's part of AppTabs and ProfileTab is a sensible place to go back to.
    navigation.navigate('ProfileTab');
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setPage(prevPage => prevPage + 1);
      fetchMatches(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a702c8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Potential Matches</Text>
      </View>
      
      {matches.length === 0 && !loading ? (
         <View style={styles.emptyContainer}>
           <Text style={styles.emptyText}>No potential matches found at the moment.</Text>
           <Text style={styles.emptySubText}>Complete your profile to get better suggestions!</Text>
           <TouchableOpacity 
             style={styles.refreshButton}
             onPress={() => fetchMatches()}
             activeOpacity={0.7}
           >
             <Text style={styles.refreshButtonText}>Refresh</Text>
           </TouchableOpacity>
         </View>
      ) : (
        <View style={styles.matchesContainer}>
          <FlatList
            data={matches}
            keyExtractor={(item) => item.id.toString()} // id is already string
            renderItem={({ item }) => (
              <MatchCard 
                user={{
                  id: item.id,
                  name: item.name,
                  position: item.position,
                  interests: item.interests,
                  imageUrl: item.imageUrl,
                  score: item.score
                }}
                onConnect={() => handleConnect(item.id)} 
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
          
          {hasMore && (
            <View style={styles.loadMoreContainer}>
              {loadingMore ? (
                <ActivityIndicator size="large" color="#a702c8" />
              ) : (
                <TouchableOpacity 
                  style={styles.loadMoreButton} 
                  onPress={loadMore}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loadMoreText}>Load More Matches</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  matchesContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16, // Add padding top
    paddingBottom: 8, // Add padding bottom
    backgroundColor: '#FFFFFF', // White background for header
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8, // Add padding to make it easier to press
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#a702c8',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
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
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#a702c8',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    marginTop: 20,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadMoreContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  loadMoreButton: {
    backgroundColor: '#a702c8',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 4,
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadMoreText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
}); 