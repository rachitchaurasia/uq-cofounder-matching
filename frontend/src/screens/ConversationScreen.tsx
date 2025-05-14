import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, ActivityIndicator, View, Text, Platform } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MessagesStackParamList } from '../navigation/types';
import { useStreamChat } from '../context/StreamChatContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

// Import directly rather than dynamically
import {
  Chat,
  Channel,
  MessageList,
  MessageInput,
  OverlayProvider,
} from 'stream-chat-react-native';

type ConversationScreenRouteProp = RouteProp<MessagesStackParamList, 'Conversation'>;

export const ConversationScreen: React.FC = () => {
  // For web platform, show a placeholder
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <Text style={styles.errorText}>
          Chat functionality is only available in the mobile app.
        </Text>
        <Text style={styles.loadingText}>
          Please use our mobile app to access the complete chat experience.
        </Text>
      </View>
    );
  }

  const route = useRoute<ConversationScreenRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<MessagesStackParamList>>();
  const { client, setUserAndConnect, connecting } = useStreamChat();
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { conversationId, channelId, otherUser } = route.params || {};

  // Set title
  useEffect(() => {
    if (otherUser?.name) {
      navigation.setOptions({ title: otherUser.name });
    }
  }, [otherUser, navigation]);

  // Try to initialize the channel
  useEffect(() => {
    const setupChannel = async () => {
      try {
        if (Platform.OS === 'web') {
          console.log('Chat is not available on web');
          setLoading(false);
          return;
        }

        if (!client) {
          console.error('Stream Chat client not initialized');
          setLoading(false);
          return;
        }

        // Only try to connect if the user isn't already connected
        if (!client.userID) {
          console.log('User not connected, attempting to connect...');
          // Get user profile
          const token = await AsyncStorage.getItem('authToken');
          if (!token) {
            throw new Error('No auth token found');
          }
          
          try {
            const profileResponse = await fetch(`${API_BASE_URL}/api/profiles/me/`, {
              headers: {
                'Authorization': `Token ${token}`,
              },
            });
            
            if (!profileResponse.ok) throw new Error('Failed to fetch profile');
            const profileData = await profileResponse.json();
            
            // Connect user to Stream Chat
            await setUserAndConnect(
              profileData.user.id.toString(),
              `${profileData.user.first_name} ${profileData.user.last_name}`,
              profileData.avatar
            );
          } catch (e) {
            console.error('Failed to connect user:', e);
          }
        } else {
          console.log('User already connected:', client.userID);
        }

        // Now create/get the channel
        try {
          // We need a channel ID to proceed
          const tempChannelId = channelId || `chat-${conversationId}-${Date.now()}`;
          const channelClient = client.channel('messaging', tempChannelId);
          
          // Initialize with other user - Fix the members format
          if (otherUser) {
            await channelClient.create({
              members: { [client.userID]: {}, [otherUser.id.toString()]: {} }
            });
          }
          
          await channelClient.watch();
          setChannel(channelClient);
        } catch (error) {
          console.error('Error creating channel:', error);
        }
      } catch (error) {
        console.error('Error setting up chat:', error);
      } finally {
        setLoading(false);
      }
    };

    setupChannel();
  }, [client, conversationId, channelId, otherUser, setUserAndConnect]);

  if (loading || connecting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
        <Text style={styles.loadingText}>Setting up conversation...</Text>
      </View>
    );
  }

  // Missing components check
  if (!Chat || !Channel || !MessageList || !MessageInput || !OverlayProvider) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Unable to load chat components. Please restart the app.
        </Text>
      </View>
    );
  }

  // Client or channel not available
  if (!client || !channel) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Unable to connect to chat. Please try again later.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <OverlayProvider>
        <Chat client={client}>
          <Channel channel={channel}>
            <View style={styles.chatContainer}>
              <MessageList />
              <MessageInput />
            </View>
          </Channel>
        </Chat>
      </OverlayProvider>
    </SafeAreaView>
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
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  errorText: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
}); 