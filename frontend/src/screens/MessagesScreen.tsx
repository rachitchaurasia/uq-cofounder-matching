import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Dimensions } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // No longer needed
// import { API_BASE_URL } from '../config'; // No longer needed
import { getConversations, getGroupConversations, IGroupConversation } from '../services/ChatService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from '../navigation/types';
import { supabase } from '../supabaseClient'; // Import Supabase
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

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

// Placeholder for Group Conversations
const GroupConversationsScreen: React.FC = () => {
  const [groupConversations, setGroupConversations] = useState<IGroupConversation[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [refreshingGroups, setRefreshingGroups] = useState(false);
  const navigation = useNavigation<BottomTabNavigationProp<BottomTabParamList>>();

  const fetchGroupConvos = async () => {
    setLoadingGroups(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        console.log('No Supabase user signed in for GroupMessagesScreen');
        setLoadingGroups(false);
        setGroupConversations([]);
        return;
      }
      const groups = await getGroupConversations(currentUser.id);
      setGroupConversations(groups);
    } catch (error) {
      console.error("Error fetching group conversations:", error);
      setGroupConversations([]);
    } finally {
      setLoadingGroups(false);
      setRefreshingGroups(false);
    }
  };

  useEffect(() => {
    fetchGroupConvos();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchGroupConvos();
      return () => {}; 
    }, [])
  );

  const handleRefreshGroups = () => {
    setRefreshingGroups(true);
    fetchGroupConvos();
  };

  const openGroupConversation = (groupId: string, groupName?: string, eventId?: string) => {
    navigation.navigate('MessagesTab', {
      screen: 'Conversation',
      params: {
        groupId: groupId, 
        groupName: groupName || 'Group Chat',
        isGroupChat: true,
        eventId: eventId,
      }
    });
  };

  if (loadingGroups && groupConversations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
        <Text style={styles.loadingText}>Loading group chats...</Text>
      </View>
    );
  }

  if (groupConversations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No group chats yet.</Text>
        <Text style={styles.emptySubtext}>Join event chats or create new groups.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={groupConversations}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.conversationItem}
          onPress={() => openGroupConversation(item.id, item.name, item.event_id)}
        >
          <Image 
            source={item.avatar_url ? { uri: item.avatar_url } : require('../assets/default-group-avatar.png')}
            style={styles.avatar}
          />
          <View style={styles.conversationDetails}>
            <View style={styles.nameTimeRow}>
              <Text style={styles.name}>{item.name}</Text>
              {item.lastMessageTime && (
                <Text style={styles.time}>
                  {new Date(item.lastMessageTime).toLocaleDateString() === new Date().toLocaleDateString() 
                    ? new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                    : new Date(item.lastMessageTime).toLocaleDateString()}
                </Text>
              )}
            </View>
            <Text 
              style={styles.message}
              numberOfLines={1}
            >
              {item.lastMessage || (item.event_id ? 'Event chat created' : 'No messages yet')}
            </Text>
          </View>
        </TouchableOpacity>
      )}
      refreshing={refreshingGroups}
      onRefresh={handleRefreshGroups}
      contentContainerStyle={groupConversations.length === 0 ? styles.emptyList : null}
    />
  );
};

export const MessagesScreen: React.FC = () => {
  const [directConversations, setDirectConversations] = useState<Conversation[]>([]);
  const [loadingDirect, setLoadingDirect] = useState(true);
  const [refreshingDirect, setRefreshingDirect] = useState(false);
  const navigation = useNavigation<BottomTabNavigationProp<BottomTabParamList>>();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'direct', title: 'Direct' },
    { key: 'groups', title: 'Groups' },
  ]);

  const fetchDirectConversations = async () => {
    setLoadingDirect(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        console.log('No Supabase user signed in for MessagesScreen');
        setLoadingDirect(false);
        setDirectConversations([]); // Clear conversations if no user
        return;
      }
      const currentUserId = currentUser.id;
      
      // Get conversations from Supabase via ChatService
      const supabaseConversations: SupabaseConversation[] = await getConversations(currentUserId);
      console.log("Fetched Supabase direct conversations raw:", supabaseConversations);
      
      // Filter for actual direct conversations (exactly 2 participants)
      const filteredDirectConversations = supabaseConversations.filter(
        convo => convo.participants && convo.participants.length === 2
      );
      
      const formattedConversations: Conversation[] = [];
      
      for (const convo of filteredDirectConversations) {
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
            console.error(`Error processing direct conversation for otherUser ${otherUserId}:`, error);
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
      
      setDirectConversations(formattedConversations);
    } catch (error) {
      console.error('Error in top-level fetchDirectConversations:', error);
      setDirectConversations([]); // Clear conversations on top-level error
    } finally {
      setLoadingDirect(false);
      setRefreshingDirect(false);
    }
  };

  useEffect(() => {
    fetchDirectConversations();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (index === 0) { // Only fetch direct messages if on the Direct tab
        fetchDirectConversations();
      } else if (index === 1) {
        // The GroupConversationsScreen component has its own useEffect and useFocusEffect
        // for fetching its data. We could also trigger it from here if preferred.
      }
      return () => {}; 
    }, [index]) 
  );

  const handleRefreshDirect = () => {
    setRefreshingDirect(true);
    fetchDirectConversations();
  };

  const openDirectConversation = (conversationId: string, otherUser: ConversationUser) => {
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

  const DirectMessagesList: React.FC = () => {
    if (loadingDirect && directConversations.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#9C27B0" />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      );
    }
    if (directConversations.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No direct messages yet</Text>
          <Text style={styles.emptySubtext}>Connect with matches to start chatting</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={directConversations}
        keyExtractor={(item) => item.id} // item.id is chat_room_id
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.conversationItem}
            onPress={() => openDirectConversation(item.id, item.otherUser)}
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
        refreshing={refreshingDirect}
        onRefresh={handleRefreshDirect}
        contentContainerStyle={directConversations.length === 0 ? styles.emptyList : null}
      />
    );
  };

  const renderScene = SceneMap({
    direct: DirectMessagesList,
    groups: GroupConversationsScreen,
  });

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor="#9C27B0"
      inactiveColor="#555"
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={renderTabBar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 40, // Increased padding for potential iOS status bar/notch and to prevent overlap
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
  },
  // Styles for TabView
  tabBar: {
    backgroundColor: '#F8F9FA', // Match container background or choose a distinct color
    elevation: 0, // Remove shadow on Android
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0', // Light border for separation
  },
  tabIndicator: {
    backgroundColor: '#9C27B0', // Purple accent color
    height: 3,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize', // Keep it simple, or use 'uppercase' if preferred
  }
}); 