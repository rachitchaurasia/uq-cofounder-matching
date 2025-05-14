import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import { getConversations } from '../services/ChatService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from '../navigation/types';

type Conversation = {
  id: string;
  otherUser: {
    id: number;
    name: string;
    avatar?: string;
  };
  lastMessage: string;
  lastMessageTime: Date;
};

export const MessagesScreen: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<BottomTabNavigationProp<BottomTabParamList>>();

  const fetchConversations = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }
      
      // Get current user profile
      const profileResponse = await fetch(`${API_BASE_URL}/api/profiles/me/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      
      if (!profileResponse.ok) {
        setLoading(false);
        return;
      }
      
      const profileData = await profileResponse.json();
      const userId = profileData.user.id.toString();
      setCurrentUserId(userId);
      
      // Get conversations from Supabase
      const supabaseConversations = await getConversations(userId);
      console.log("Fetched conversations:", supabaseConversations);
      
      // Transform Supabase conversations to app format
      const formattedConversations: Conversation[] = [];
      
      for (const convo of supabaseConversations) {
        // Get the other user's ID
        const otherUserId = convo.participants.find(
          (id: string) => id !== userId
        );
        
        if (otherUserId) {
          try {
            // Fetch other user profile from your Django backend
            const otherUserResponse = await fetch(`${API_BASE_URL}/api/profiles/${otherUserId}/`, {
              headers: {
                'Authorization': `Token ${token}`,
              },
            });
            
            if (otherUserResponse.ok) {
              const otherUserData = await otherUserResponse.json();
              
              formattedConversations.push({
                id: convo.id,
                otherUser: {
                  id: parseInt(otherUserId),
                  name: otherUserData.user.first_name && otherUserData.user.last_name ? 
                    `${otherUserData.user.first_name} ${otherUserData.user.last_name}` : 
                    otherUserData.user.username || `User ${otherUserId}`,
                  avatar: otherUserData.avatar
                },
                lastMessage: convo.lastMessage || "No messages yet",
                lastMessageTime: new Date(convo.lastMessageTime) || new Date(),
              });
            } else {
              console.error(`Failed to fetch user profile: ${otherUserResponse.status}`);
              console.log(`Attempting with alternative endpoint for user ${otherUserId}`);
              
              // Try alternative endpoints like /api/users/ if your Django API offers that
              try {
                const altResponse = await fetch(`${API_BASE_URL}/api/users/${otherUserId}/`, {
                  headers: { 'Authorization': `Token ${token}` },
                });
                
                if (altResponse.ok) {
                  const userData = await altResponse.json();
                  // Use whatever fields your Django user model provides
                  const fullName = userData.first_name && userData.last_name ? 
                    `${userData.first_name} ${userData.last_name}` : userData.username;
                  
                  formattedConversations.push({
                    id: convo.id,
                    otherUser: {
                      id: parseInt(otherUserId),
                      name: fullName || `User ${otherUserId}`,
                    },
                    lastMessage: convo.lastMessage || "No messages yet",
                    lastMessageTime: new Date(convo.lastMessageTime) || new Date(),
                  });
                } else {
                  // If all attempts fail, fall back to placeholder
                  formattedConversations.push({
                    id: convo.id,
                    otherUser: {
                      id: parseInt(otherUserId),
                      name: `User ${otherUserId}`,
                    },
                    lastMessage: convo.lastMessage || "No messages yet",
                    lastMessageTime: new Date(convo.lastMessageTime) || new Date(),
                  });
                }
              } catch (e) {
                console.error(`All attempts to fetch user ${otherUserId} failed:`, e);
                // Fall back to placeholder
                formattedConversations.push({
                  id: convo.id,
                  otherUser: {
                    id: parseInt(otherUserId),
                    name: `User ${otherUserId}`,
                  },
                  lastMessage: convo.lastMessage || "No messages yet",
                  lastMessageTime: new Date(convo.lastMessageTime) || new Date(),
                });
              }
            }
          } catch (error) {
            console.error(`Error fetching user ${otherUserId}:`, error);
            // Add with placeholder data
            formattedConversations.push({
              id: convo.id,
              otherUser: {
                id: parseInt(otherUserId),
                name: `User ${otherUserId}`,
              },
              lastMessage: convo.lastMessage || "No messages yet",
              lastMessageTime: new Date(convo.lastMessageTime) || new Date(),
            });
          }
        }
      }
      
      // Sort conversations by latest message
      formattedConversations.sort((a, b) => 
        b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
      );
      
      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch conversations on initial load
  useEffect(() => {
    fetchConversations();
  }, []);

  // Refresh conversations when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchConversations();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const openConversation = (conversationId: string, otherUser: any) => {
    navigation.navigate('MessagesTab', {
      screen: 'Conversation',
      params: {
        conversationId: conversationId,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          imageUrl: otherUser.avatar
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#9C27B0" />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>Connect with matches to start chatting</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.conversationItem}
              onPress={() => openConversation(item.id, item.otherUser)}
            >
              <Image 
                source={item.otherUser.avatar ? { uri: item.otherUser.avatar } : require('../assets/default-avatar.png')} 
                style={styles.avatar}
              />
              <View style={styles.conversationDetails}>
                <View style={styles.nameTimeRow}>
                  <Text style={styles.name}>{item.otherUser.name}</Text>
                  <Text style={styles.time}>
                    {item.lastMessageTime.toLocaleDateString() === new Date().toLocaleDateString() 
                      ? item.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                      : item.lastMessageTime.toLocaleDateString()}
                  </Text>
                </View>
                <Text 
                  style={styles.message}
                  numberOfLines={1}
                >
                  {item.lastMessage}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={conversations.length === 0 ? styles.emptyList : null}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginBottom: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  conversationDetails: {
    flex: 1,
  },
  nameTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  time: {
    fontSize: 14,
    color: '#999',
  },
  message: {
    fontSize: 14,
    color: '#666',
  },
  unreadMessage: {
    fontWeight: 'bold',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
}); 