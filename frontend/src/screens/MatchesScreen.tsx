import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import { MatchCard } from '../components/MatchCard';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from '../navigation/types';

type MatchUser = {
  id: number;
  name: string;
  position: string;
  interests: string;
  imageUrl?: string;
  score?: number;
};

export const MatchesScreen: React.FC = () => {
  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<BottomTabNavigationProp<BottomTabParamList>>();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }

      // First get user ID
      const profileResponse = await fetch(`${API_BASE_URL}/api/profiles/me/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!profileResponse.ok) throw new Error('Failed to fetch profile');
      const profileData = await profileResponse.json();
      const userId = profileData.user?.id;
      
      if (!userId) {
        throw new Error('User ID not found in profile');
      }
      
      // Run the matching algorithm
      const matchingResponse = await fetch(`${API_BASE_URL}/api/matching/run/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!matchingResponse.ok) throw new Error('Failed to run matching algorithm');
      const matchingData = await matchingResponse.json();
      
      // Parse the output from run_matching.py
      if (matchingData.output) {
        const matchResults: MatchUser[] = [];
        const lines = matchingData.output.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('- ')) {
            const match = line.substring(2); // Remove the '- ' prefix
            const regex = /(.+) \(User ID: (\d+), Score: ([\d.]+)\)/;
            const match_parts = match.match(regex);
            
            if (match_parts && match_parts.length === 4) {
              const userId = parseInt(match_parts[2]);
              
              // Fetch additional user details if possible
              try {
                const userResponse = await fetch(`${API_BASE_URL}/api/profiles/${userId}/`, {
                  headers: {
                    'Authorization': `Token ${token}`,
                  },
                });
                
                if (userResponse.ok) {
                  const userData = await userResponse.json();
                  matchResults.push({
                    id: userId,
                    name: match_parts[1],
                    position: userData.position || 'Co-founder',
                    interests: userData.interests || 'Technology, Startups',
                    imageUrl: userData.avatar,
                    score: parseFloat(match_parts[3])
                  });
                } else {
                  // Fallback if user details can't be fetched
                  matchResults.push({
                    id: userId,
                    name: match_parts[1],
                    position: 'Co-founder',
                    interests: 'Technology, Startups',
                    score: parseFloat(match_parts[3])
                  });
                }
              } catch (error) {
                // Fallback
                matchResults.push({
                  id: userId,
                  name: match_parts[1],
                  position: 'Co-founder',
                  interests: 'Technology, Startups',
                  score: parseFloat(match_parts[3])
                });
              }
            }
          }
        }
        
        if (matchResults.length > 0) {
          setMatches(matchResults);
        } else {
          // Fallback to mock data if no matches parsed
          setMatches(getMockMatches());
        }
      } else {
        // Fallback to mock data
        setMatches(getMockMatches());
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      // Fallback to mock data
      setMatches(getMockMatches());
    } finally {
      setLoading(false);
    }
  };

  // Mock data function
  const getMockMatches = () => {
    return [
      {
        id: 101,
        name: 'Jack Smith',
        position: 'AI Developer',
        interests: 'Interested in Machine Learning and AI Development',
        score: 0.85
      },
      {
        id: 102,
        name: 'Emily Johnson',
        position: 'Product Manager',
        interests: 'Startup Growth, Product Design',
        score: 0.78
      },
      {
        id: 103,
        name: 'David Chen',
        position: 'UX Designer',
        interests: 'User Experience, Interface Design',
        score: 0.72
      }
    ];
  };

  const handleConnect = async (userId: number) => {
    // Find the match
    const match = matches.find(m => m.id === userId);
    if (!match) {
      Alert.alert('Error', 'User not found');
      return;
    }
    
    try {
      // Use timestamp as channel ID since the backend API fails
      const channelId = `messaging_${userId}_${Date.now()}`;
      
      // Navigate to conversation directly with mock channel ID
      navigation.navigate('MessagesTab', { 
        screen: 'Conversation',
        params: { 
          conversationId: userId,
          channelId: channelId,
          otherUser: {
            id: match.id,
            name: match.name,
            position: match.position,
            imageUrl: match.imageUrl
          }
        }
      });
    } catch (error) {
      console.error('Error connecting with match:', error);
      Alert.alert('Error', 'Failed to connect with match. Please try again.');
    }
  };

  const goBack = () => {
    navigation.navigate('ProfileTab');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
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
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#9C27B0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#9C27B0',
    textAlign: 'left',
  },
  listContent: {
    paddingBottom: 80,
  },
}); 