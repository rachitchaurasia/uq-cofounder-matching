import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { MatchCard } from '../components/MatchCard';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { BottomTabParamList, RootStackParamList } from '../navigation/types'; // Import RootStackParamList
import { supabase } from '../supabaseClient'; // Import Supabase client

// --- Define UserProfileData interface for the matching algorithm ---
interface UserProfileData {
  id: string;
  full_name?: string | null;
  position?: string | null;
  interests?: string[] | null; // Assuming array from Supabase
  avatar_url?: string | null;
  skills?: string[] | null;      // Assuming array from Supabase
  startup_industries?: string[] | null; // Assuming array from Supabase
  offers?: string[] | null; // Assuming array from Supabase
  looking_for?: string[] | null; // Assuming array from Supabase
  role?: string | null;
  show_role_on_profile?: boolean | null;
  // Fields required by the matching algorithm from Python
  skill_categories?: string[] | null; // From python, will adapt to use 'skills' if not present
  startup_goals?: string[] | null;    // To be added to fetch
  experience_level?: string | null; // To be added to fetch
}

// --- Define MATCH_WEIGHTS (from run_matching.py) ---
const MATCH_WEIGHTS = {
  skill_complementarity: 0.30,
  shared_interests: 0.20,
  shared_industries: 0.15,
  goal_alignment: 0.25,
  experience_compatibility: 0.10
};

// --- Ported compute_match_score from Python to TypeScript ---
const computeMatchScoreTs = (
  person1Data: UserProfileData,
  person2Data: UserProfileData,
  weights: typeof MATCH_WEIGHTS
): number => {
  let score = 0.0;

  // Helper to convert null/undefined arrays to empty arrays for set operations
  const getSet = (arr?: string[] | null): Set<string> => new Set(arr || []);

  // 1. Skill Complementarity
  // Python used 'skill_categories'. We'll adapt to use 'skills' if 'skill_categories' isn't available or directly mapped.
  // For this implementation, we'll assume 'skills' field contains the relevant items for complementarity.
  const p1Skills = getSet(person1Data.skills || person1Data.skill_categories);
  const p2Skills = getSet(person2Data.skills || person2Data.skill_categories);
  const unionSkills = new Set([...p1Skills, ...p2Skills]);
  const intersectionSkills = new Set([...p1Skills].filter(skill => p2Skills.has(skill)));
  
  // The Python version had a hardcoded max_possible_categories = 4.
  // This is harder to define universally without knowing the exact nature of 'skills' or 'skill_categories' data.
  // A more general approach for complementarity: (union - intersection) / union if union > 0
  // Or, if we want to penalize for having too few distinct skills combined:
  // Let's use Jaccard distance for dissimilarity: 1 - (intersection / union)
  // Or, if we want to reward having different skills: (union.size - intersection.size) / some_max_expected_distinct_skills
  // Given the python code `len(union_categories) - len(intersection_categories)`, it was number of distinct skills.
  // Normalizing it by `max_possible_categories` is tricky.
  // Let's simplify: score more if they have skills the other doesn't, up to a point.
  // Using (union.size - intersection.size) as a raw score, then normalize based on a typical number of skills.
  // For simplicity in porting, if total distinct skills are, say, up to 10, then complementarity_score/10
  const skillComplementarityScore = unionSkills.size - intersectionSkills.size;
  // Normalize based on an assumed typical number of distinct skills a pair might have, e.g., 10.
  // This part is a bit arbitrary without deeper data understanding from python's 'max_possible_categories'.
  // Let's use a version of Jaccard index for *dissimilarity* or difference:
  const normalizedComplementarity = unionSkills.size > 0 ? (unionSkills.size - intersectionSkills.size) / unionSkills.size : 0;
  score += (weights.skill_complementarity || 0) * normalizedComplementarity;


  // 2. Shared Interests
  const p1Interests = getSet(person1Data.interests);
  const p2Interests = getSet(person2Data.interests);
  const sharedInterestsCount = [...p1Interests].filter(interest => p2Interests.has(interest)).length;
  const unionInterestsCount = new Set([...p1Interests, ...p2Interests]).size;
  const interestSimilarity = unionInterestsCount > 0 ? sharedInterestsCount / unionInterestsCount : 0;
  score += (weights.shared_interests || 0) * interestSimilarity;

  // 3. Shared Startup Industries
  const p1Industries = getSet(person1Data.startup_industries);
  const p2Industries = getSet(person2Data.startup_industries);
  const sharedIndustriesCount = [...p1Industries].filter(industry => p2Industries.has(industry)).length;
  const unionIndustriesCount = new Set([...p1Industries, ...p2Industries]).size;
  const industrySimilarity = unionIndustriesCount > 0 ? sharedIndustriesCount / unionIndustriesCount : 0;
  score += (weights.shared_industries || 0) * industrySimilarity;

  // 4. Aligned Startup Goals
  const p1Goals = getSet(person1Data.startup_goals);
  const p2Goals = getSet(person2Data.startup_goals);
  const sharedGoalsCount = [...p1Goals].filter(goal => p2Goals.has(goal)).length;
  const avgNumGoals = (p1Goals.size + p2Goals.size) / 2;
  const goalAlignment = avgNumGoals > 0 ? sharedGoalsCount / avgNumGoals : 0;
  score += (weights.goal_alignment || 0) * goalAlignment;

  // 5. Experience Level Compatibility
  const levels: { [key: string]: number } = { "Junior": 1, "Mid-level": 2, "Senior": 3 };
  
  let p1LevelVal = "";
  if (typeof person1Data.experience_level === 'string') {
    p1LevelVal = person1Data.experience_level.trim();
  }
  let p2LevelVal = "";
  if (typeof person2Data.experience_level === 'string') {
    p2LevelVal = person2Data.experience_level.trim();
  }

  const p1Level = levels[p1LevelVal] || 0;
  const p2Level = levels[p2LevelVal] || 0;
  let experienceCompatibility = 0;
  if (p1Level > 0 && p2Level > 0) {
    const levelDiff = Math.abs(p1Level - p2Level);
    experienceCompatibility = Math.max(0, 1 - levelDiff / 2.0);
  }
  score += (weights.experience_compatibility || 0) * experienceCompatibility;

  return Math.min(1, Math.max(0, score)); // Ensure score is between 0 and 1
};


type MatchUser = {
  id: string;
  name: string;
  position: string;
  interests: string;
  imageUrl?: string;
  score?: number;
  // Include raw profile data for debugging or future use if needed
  profileData?: UserProfileData;
};

const PROFILE_SELECT_FIELDS = 'id, full_name, position, interests, avatar_url, skills, startup_industries, offers, looking_for, role, show_role_on_profile, startup_goals, experience_level';

export const MatchesScreen: React.FC = () => {
  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [allPotentialMatches, setAllPotentialMatches] = useState<MatchUser[]>([]); // Stores all scored and sorted MatchUser objects
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 15;
  const navigation = useNavigation<BottomTabNavigationProp<BottomTabParamList & RootStackParamList>>();

  const getCurrentUserProfile = async (): Promise<UserProfileData | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select(PROFILE_SELECT_FIELDS)
        .eq('id', user.id)
        .single();
      if (error) {
        console.error('Error fetching current user profile for matching:', error);
        return null;
      }
      return profileData as UserProfileData;
    }
    return null;
  };

  const mapProfileToMatchUser = (profile: UserProfileData, currentUserProfile: UserProfileData | null): MatchUser => {
    const score = currentUserProfile ? computeMatchScoreTs(currentUserProfile, profile, MATCH_WEIGHTS) : 0;
    let interestsString = 'Interests not specified';
    if (Array.isArray(profile.interests) && profile.interests.length > 0) {
      interestsString = profile.interests.join(', ');
    } else if (typeof profile.interests === 'string' && profile.interests !== '') {
      interestsString = profile.interests;
    }
    return {
      id: profile.id,
      name: profile.full_name || 'N/A',
      position: profile.position || (profile.role && profile.show_role_on_profile ? profile.role : 'Role not specified'),
      interests: interestsString,
      imageUrl: profile.avatar_url ?? undefined,
      score: score,
      profileData: profile
    };
  };

  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
        setLoading(true);
        setMatches([]);
        setAllPotentialMatches([]);
        setPage(1);
        setHasMore(true); // Assume has more on refresh until data is fetched
    } else {
        setLoading(true); // For initial load
    }

    const CUserProfile = await getCurrentUserProfile();
    if (!CUserProfile) {
      console.error('Failed to fetch current user profile.');
      setMatches(getMockMatches());
      setHasMore(false);
      setLoading(false);
      return;
    }

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      console.error('No Supabase authUser found during data load.');
      setMatches(getMockMatches());
      setHasMore(false);
      setLoading(false);
      return;
    }

    const { data: profilesData, error } = await supabase
      .from('profiles')
      .select(PROFILE_SELECT_FIELDS)
      .neq('id', authUser.id);

    if (error) {
      console.error('Error fetching profiles from Supabase:', error);
      setMatches(getMockMatches());
      setHasMore(false);
      setLoading(false);
      return;
    }

    if (profilesData) {
      const scoredMatches: MatchUser[] = profilesData
        .map(p => mapProfileToMatchUser(p as UserProfileData, CUserProfile))
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      
      setAllPotentialMatches(scoredMatches);
      setMatches(scoredMatches.slice(0, itemsPerPage));
      setPage(1);
      setHasMore(scoredMatches.length > itemsPerPage);
    } else {
      setMatches(getMockMatches()); // Fallback if no profiles found
      setHasMore(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData(); // Initial data load
  }, []);

  const handleRefresh = () => {
    loadData(true); // Refresh data
  };

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    const nextPage = page + 1;
    const currentLoadedCount = matches.length; // Or page * itemsPerPage
    const nextPageItems = allPotentialMatches.slice(currentLoadedCount, currentLoadedCount + itemsPerPage);

    if (nextPageItems.length > 0) {
      setMatches(prevMatches => [...prevMatches, ...nextPageItems]);
      setPage(nextPage);
    }
    setHasMore(allPotentialMatches.length > (currentLoadedCount + nextPageItems.length));
    setLoadingMore(false);
  };

  const getMockMatches = (): MatchUser[] => {
    return [
      {
        id: "mock_101",
        name: 'Jack Smith (Mock)',
        position: 'AI Developer',
        interests: 'Interested in Machine Learning and AI Development',
        score: 0.85,
        profileData: { id: "mock_101" } // Minimal profile data for mock
      },
      {
        id: "mock_102",
        name: 'Emily Johnson (Mock)',
        position: 'Product Manager',
        interests: 'Startup Growth, Product Design',
        score: 0.78,
        profileData: { id: "mock_102"}
      },
    ];
  };

  const handleViewProfile = (userId: string) => {
    navigation.navigate('UserProfileViewScreen', { userId: userId, isReadOnly: true });
  };

  const handleConnect = async (userId: string) => {
    const match = allPotentialMatches.find(m => m.id === userId);
    if (!match) {
      Alert.alert('Error', 'User not found');
      return;
    }
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      Alert.alert('Error', 'Current user not found. Cannot initiate chat.');
      return;
    }
    const chatRoomId = currentUser.id < userId ? `${currentUser.id}_${userId}` : `${userId}_${currentUser.id}`;
    navigation.navigate('MessagesTab', {
      screen: 'Conversation',
      params: {
        conversationId: match.id,
        channelId: chatRoomId,
        otherUser: {
          id: match.id,
          name: match.name,
          position: match.position,
          imageUrl: match.imageUrl
        }
      }
    });
  };

  const goBack = () => {
    navigation.navigate('ProfileTab');
  };

  if (loading && matches.length === 0) {
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
             onPress={handleRefresh}
             activeOpacity={0.7}
           >
             <Text style={styles.refreshButtonText}>Refresh Matches</Text>
           </TouchableOpacity>
         </View>
      ) : (
        <View style={styles.matchesContainer}>
          <FlatList
            data={matches}
            keyExtractor={(item) => item.id.toString()}
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
                onViewProfile={() => handleViewProfile(item.id)}
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
                  onPress={handleLoadMore}
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
    paddingTop: 50,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
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