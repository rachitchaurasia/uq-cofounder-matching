import React, { useState, useEffect, useCallback } from 'react';
import { 
  SafeAreaView, 
  StyleSheet, 
  ActivityIndicator, 
  View, 
  Text, 
  Platform, 
  FlatList, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MessagesStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import { sendMessage, subscribeToMessages, IMessage } from '../services/ChatService';

type ConversationScreenRouteProp = RouteProp<MessagesStackParamList, 'Conversation'>;

// Simple message component
const MessageBubble = ({ message, isOwnMessage }: { message: IMessage, isOwnMessage: boolean }) => {
  return (
    <View style={[
      styles.messageBubble,
      isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
    ]}>
      <Text style={[
        styles.messageText,
        isOwnMessage ? styles.ownMessageText : styles.otherMessageText
      ]}>
        {message.text}
      </Text>
      <Text style={[
        styles.messageTime,
        isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
      ]}>
        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
};

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
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const { conversationId, otherUser } = route.params || {};

  // Set title
  useEffect(() => {
    if (otherUser?.name) {
      navigation.setOptions({ title: otherUser.name });
    }
  }, [otherUser, navigation]);

  // Load current user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          throw new Error('No auth token found');
        }
        
        const profileResponse = await fetch(`${API_BASE_URL}/api/profiles/me/`, {
          headers: {
            'Authorization': `Token ${token}`,
          },
        });
        
        if (!profileResponse.ok) throw new Error('Failed to fetch profile');
        const profileData = await profileResponse.json();
        
        setCurrentUser({
          _id: profileData.user.id.toString(),
          name: `${profileData.user.first_name} ${profileData.user.last_name}`,
          avatar: profileData.avatar || `https://ui-avatars.com/api/?name=${profileData.user.first_name}+${profileData.user.last_name}`
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  // For testing: add a sample message if none exist
  useEffect(() => {
    if (!loading && messages.length === 0) {
      const sampleMessages: IMessage[] = [
        {
          _id: '1',
          text: 'Hello! Welcome to the chat. This is a sample message to show how the chat will look.',
          createdAt: new Date(),
          user: {
            _id: currentUser ? 'other' : 'self',
            name: 'Sample User',
          }
        },
        {
          _id: '2',
          text: 'Hi there! This is what your messages will look like.',
          createdAt: new Date(Date.now() - 1000 * 60), // 1 minute ago
          user: {
            _id: currentUser ? currentUser._id : 'self',
            name: currentUser ? currentUser.name : 'You',
          }
        }
      ];
      setMessages(sampleMessages);
    }
  }, [loading, currentUser, messages.length]);

  // Subscribe to messages
  useEffect(() => {
    if (!currentUser || !otherUser) return;
    
    console.log("Subscribing to messages between", currentUser._id, "and", otherUser.id.toString());
    const unsubscribe = subscribeToMessages(
      currentUser._id,
      otherUser.id.toString(),
      (fetchedMessages) => {
        console.log("Received messages:", fetchedMessages.length);
        setMessages(fetchedMessages);
      }
    );
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser, otherUser]);

  // Send message handler
  const handleSend = async () => {
    if (!inputText.trim() || !currentUser || !otherUser) return;
    
    // Create a temporary message to show immediately
    const tempMessage: IMessage = {
      _id: Date.now().toString(),
      text: inputText.trim(),
      createdAt: new Date(),
      user: {
        _id: currentUser._id,
        name: currentUser.name,
      }
    };
    
    // Update UI immediately
    setMessages(prevMessages => [tempMessage, ...prevMessages]);
    
    // Clear input
    const messageToSend = inputText.trim();
    setInputText('');
    
    try {
      await sendMessage(
        messageToSend,
        currentUser,
        otherUser.id.toString()
      );
    } catch (error) {
      console.error('Error sending message:', error);
      // You could add error handling UI here
    }
  };

  const createTestMessage = async () => {
    if (!currentUser || !otherUser) return;
    
    const testMessage = `Test message ${new Date().toLocaleTimeString()}`;
    
    try {
      await sendMessage(
        testMessage,
        currentUser,
        otherUser.id.toString()
      );
      console.log("Test message sent!");
    } catch (error) {
      console.error("Error sending test message:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
        <Text style={styles.loadingText}>Setting up conversation...</Text>
      </View>
    );
  }

  if (!currentUser || !otherUser) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Unable to set up chat. Please try again later.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          style={{ flex: 1 }}
          data={messages}
          inverted
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isOwnMessage={item.user._id === currentUser._id}
            />
          )}
          contentContainerStyle={styles.messagesContainer}
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginVertical: 5,
  },
  ownMessageBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#9C27B0',
    borderBottomRightRadius: 0,
  },
  otherMessageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0E0E0',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#333333',
  },
  messageTime: {
    fontSize: 12,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: '#888888',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 62,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#F5F7FA',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: 'white',
    color: '#333',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D8B5E5',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  testButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: '#666',
    padding: 10,
    borderRadius: 10,
    zIndex: 10,
  },
  testButtonText: {
    color: 'white',
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
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20,
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