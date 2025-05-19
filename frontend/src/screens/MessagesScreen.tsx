import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // No longer needed
// import { API_BASE_URL } from '../config'; // No longer needed
import { getConversations } from '../services/ChatService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from '../navigation/types';
import { supabase } from '../supabaseClient'; // Import Supabase

// Define the structure of a conversation object coming from ChatService/Supabase
interface SupabaseConversation {
  id: string; // chat_room_id
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: string | number | Date; // Can be a string, number (timestamp), or Date object
}

type ConversationUser = {
  id: string; // Supabase user ID is UUID (string)
  name: string;
  avatar?: string;
};

type Conversation = {
  id: string; // Chat room ID
  otherUser: ConversationUser;
  lastMessage: string;
  lastMessageTime: Date;
};

export const MessagesScreen: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  // const [currentUserId, setCurrentUserId] = useState<string | null>(null); // No longer needed as state
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<BottomTabNavigationProp<BottomTabParamList>>();

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        console.log('No Supabase user signed in for MessagesScreen');
        setLoading(false);
        setConversations([]); // Clear conversations if no user
        return;
      }
      const currentUserId = currentUser.id;
      
      // Get conversations from Supabase via ChatService
      const supabaseConversations: SupabaseConversation[] = await getConversations(currentUserId);
      console.log("Fetched Supabase conversations raw:", supabaseConversations);
      
      const formattedConversations: Conversation[] = [];
      
      for (const convo of supabaseConversations) {
        // convo.participants should be an array like [userId1, userId2]
        const otherUserId = convo.participants.find(
          (id: string) => id !== currentUserId
        );
        
        if (otherUserId) {
          try {
            // Fetch other user profile from Supabase 'profiles' table
            const { data: otherUserProfile, error: profileError } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', otherUserId)
              .single();
            
            if (profileError) {
              console.error(`Error fetching profile for ${otherUserId}:`, profileError);
              // Fallback if profile fetch fails
              formattedConversations.push({
                id: convo.id, // chat_room_id
                otherUser: {
                  id: otherUserId,
                  name: `User ${otherUserId.substring(0, 8)}...`,
                  avatar: undefined // Or a default avatar
                },
                lastMessage: convo.lastMessage || "No messages yet",
                lastMessageTime: new Date(convo.lastMessageTime || Date.now()),
              });
              continue; // Move to next conversation
            }
            
            if (otherUserProfile) {
              formattedConversations.push({
                id: convo.id, // chat_room_id
                otherUser: {
                  id: otherUserId,
                  name: otherUserProfile.full_name || `User ${otherUserId.substring(0,8)}...`,
                  avatar: otherUserProfile.avatar_url
                },
                lastMessage: convo.lastMessage || "No messages yet",
                lastMessageTime: new Date(convo.lastMessageTime || Date.now()),
              });
            } else {
                 // Should not happen if no error, but handle just in case
                formattedConversations.push({
                    id: convo.id,
                    otherUser: {
                        id: otherUserId,
                        name: `User ${otherUserId.substring(0,8)}...`,
                    },
                    lastMessage: convo.lastMessage || "No messages yet",
                    lastMessageTime: new Date(convo.lastMessageTime || Date.now()),
                });
            }

          } catch (error) {
            console.error(`Error processing conversation for otherUser ${otherUserId}:`, error);
            // Fallback for unexpected errors during profile processing
            formattedConversations.push({
              id: convo.id,
              otherUser: {
                id: otherUserId,
                name: `User ${otherUserId.substring(0, 8)}...`,
              },
              lastMessage: convo.lastMessage || "No messages yet",
              lastMessageTime: new Date(convo.lastMessageTime || Date.now()),
            });
          }
        }
      }
      
      formattedConversations.sort((a, b) => 
        b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
      );
      
      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error in top-level fetchConversations:', error);
      setConversations([]); // Clear conversations on top-level error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchConversations();
      return () => {}; // Optional: cleanup function
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const openConversation = (conversationId: string, otherUser: ConversationUser) => {
    // The conversationId here is the chat_room_id
    // The otherUser.id is the Supabase UUID of the other user
    navigation.navigate('MessagesTab', {
      screen: 'Conversation',
      params: {
        conversationId: conversationId, // This is used as channelId/chatRoomId contextually
        otherUser: {
          id: otherUser.id,       // Supabase UUID of the other user
          name: otherUser.name,
          imageUrl: otherUser.avatar
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      {loading && conversations.length === 0 ? (
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
          keyExtractor={(item) => item.id} // item.id is chat_room_id
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
    backgroundColor: '#F8F9FA',
    paddingTop: 20, // Add some padding at the top
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  conversationItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: '#E9ECEF', // Placeholder background for avatar
  },
  conversationDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  nameTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '500',
    color: '#212529',
  },
  time: {
    fontSize: 12,
    color: '#6c757d',
  },
  message: {
    fontSize: 14,
    color: '#495057',
  },
  emptyList: {
    flexGrow: 1, // Ensure emptyContainer styles apply when list is empty after loading
    justifyContent: 'center',
    alignItems: 'center',
  }
}); 