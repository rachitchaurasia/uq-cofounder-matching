import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, ActivityIndicator, View, Platform, Text } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MessagesStackParamList } from '../navigation/types';
import { useStreamChat } from '../context/StreamChatContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

type ConversationScreenRouteProp = RouteProp<MessagesStackParamList, 'Conversation'>;

export const ConversationScreen: React.FC = () => {
  const route = useRoute<ConversationScreenRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<MessagesStackParamList>>();
  const { client } = useStreamChat();
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { conversationId, channelId, otherUser } = route.params;

  useEffect(() => {
    const setupChannel = async () => {
      try {
        if (!client || Platform.OS === 'web') {
          console.error('Stream Chat client not initialized or on web');
          setLoading(false);
          return;
        }

        // Set screen title with the other user's name
        if (otherUser) {
          navigation.setOptions({ title: otherUser.name });
        }

        try {
          // Create or get the channel
          const channelClient = client.channel('messaging', channelId || `chat-${conversationId}`);
          await channelClient.watch();
          setChannel(channelClient);
        } catch (error) {
          console.error('Error watching channel:', error);
          // Create a new channel as fallback
          const fallbackChannel = client.channel('messaging', `fallback-${Date.now()}`);
          await fallbackChannel.create();
          setChannel(fallbackChannel);
        }
      } catch (error) {
        console.error('Error setting up Stream Chat channel:', error);
      } finally {
        setLoading(false);
      }
    };

    setupChannel();
  }, [client, conversationId, channelId, navigation, otherUser]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <Text>Chat is available only in the mobile app</Text>
      </View>
    );
  }

  // Only import Stream Chat components on mobile
  const { Chat, Channel, MessageList, MessageInput, OverlayProvider } = require('stream-chat-react-native');

  return (
    <SafeAreaView style={styles.container}>
      {channel && client ? (
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
      ) : (
        <View style={styles.webContainer}>
          <Text>Failed to load chat. Please try again later.</Text>
        </View>
      )}
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
  chatContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  }
}); 