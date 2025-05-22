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
  KeyboardAvoidingView,
  Image
} from 'react-native';
import { useRoute, useNavigation, RouteProp, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MessagesStackParamList, BottomTabParamList } from '../navigation/types';
import { 
  sendMessage, 
  subscribeToMessages, 
  IMessage, 
  sendGroupMessage, 
  subscribeToGroupMessages, 
  fetchGroupMessages 
} from '../services/ChatService';
import { supabase } from '../supabaseClient';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// Add composite navigation type to handle navigation from both stack and tab navigators
type ConversationScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MessagesStackParamList, 'Conversation'>,
  BottomTabNavigationProp<BottomTabParamList>
>;

type ConversationScreenRouteProp = RouteProp<MessagesStackParamList, 'Conversation'>;

interface ChatCurrentUser {
  _id: string; // Supabase user ID (UUID)
  name: string;
  avatar?: string;
}

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
  const navigation = useNavigation<ConversationScreenNavigationProp>();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<ChatCurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const { conversationId, otherUser, groupId, groupName, isGroupChat, eventId } = route.params || {};
  const isFocused = useIsFocused();

  // Custom back handler
  const handleBackNavigation = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // If can't go back (accessed directly from another tab), navigate to messages list
      navigation.navigate('MessagesTab', {
        screen: 'MessagesList'
      });
    }
  };

  // Set title and custom back button
  useEffect(() => {
    if (!isFocused) return;
    
    // Set the title
    if (isGroupChat && groupName) {
      navigation.setOptions({ title: groupName });
    } else if (otherUser?.name) {
      navigation.setOptions({ title: otherUser.name });
    }
  }, [isFocused, isGroupChat, groupName, otherUser, navigation]);

  // Load current user data from Supabase
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          console.error('Error fetching Supabase user or no user logged in:', authError);
          throw new Error(authError?.message || 'No authenticated Supabase user found.');
        }

        // Fetch profile details from Supabase 'profiles' table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', authUser.id)
          .single();

        if (profileError) {
          console.error('Error fetching Supabase profile:', profileError);
          // Fallback if profile fetch fails but auth user exists
          setCurrentUser({
            _id: authUser.id,
            name: 'User ' + authUser.id.substring(0, 6), // Fallback name
            avatar: undefined // Or a default avatar
          });
        } else if (profileData) {
          setCurrentUser({
            _id: authUser.id,
            name: profileData.full_name || 'User ' + authUser.id.substring(0, 6),
            avatar: profileData.avatar_url
          });
        } else {
            // Should not happen if no error, but handle just in case
        setCurrentUser({
                _id: authUser.id,
                name: 'User ' + authUser.id.substring(0, 6),
                avatar: undefined
            });
        }
        
      } catch (error: any) {
        console.error('Error loading user data for chat:', error.message);
        // Potentially navigate away or show a persistent error
        // For now, we just log and loading stops, which might show an error message
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  // For testing: add a sample message if none exist - REMOVE OR ADJUST THIS
  useEffect(() => {
    if (!loading && currentUser && messages.length === 0 && Platform.OS !== 'web') { 
      // console.log("Current user for sample messages:", currentUser);
      // Sample message logic (currently commented out) - adjust if needed for groups
    }
  }, [loading, currentUser, messages.length, otherUser, isGroupChat, groupId]);

  // Subscribe to messages (Direct or Group)
  useEffect(() => {
    if (!currentUser) return;

    let unsubscribe: (() => void) | undefined;

    if (isGroupChat && groupId) {
      console.log("Subscribing to group messages for group:", groupId);
      unsubscribe = subscribeToGroupMessages(groupId, (fetchedMessages) => {
        console.log("Received group messages:", fetchedMessages.length);
        setMessages(fetchedMessages);
      });
      // Optionally, fetch initial messages if subscribeToGroupMessages doesn't do it
      // fetchGroupMessages(groupId).then(setMessages);
    } else if (!isGroupChat && conversationId && otherUser) {
      console.log("Subscribing to direct messages between", currentUser._id, "and", otherUser.id.toString());
      unsubscribe = subscribeToMessages(
        currentUser._id,
        otherUser.id.toString(),
        (fetchedMessages) => {
          console.log("Received direct messages:", fetchedMessages.length);
          setMessages(fetchedMessages);
        }
      );
    }
    
    return () => {
      if (unsubscribe) {
        console.log(isGroupChat ? "Unsubscribing from group" : "Unsubscribing from direct chat");
        unsubscribe();
      }
    };
  }, [currentUser, conversationId, otherUser, groupId, isGroupChat]);

  // Send message handler
  const handleSend = async () => {
    if (!inputText.trim() || !currentUser) return;
    if (!isGroupChat && !otherUser) return; // Need otherUser for direct
    if (isGroupChat && !groupId) return; // Need groupId for group
    
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
      if (isGroupChat && groupId) {
        await sendGroupMessage(
          messageToSend,
          groupId,
          currentUser._id // senderId for group messages
        );
      } else if (!isGroupChat && otherUser) {
        await sendMessage(
          messageToSend,
          currentUser, // Old sendMessage expects the full currentUser object
          otherUser.id.toString()
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // You could add error handling UI here
    }
  };

  const createTestMessage = async () => {
    if (!currentUser) return;

    if (isGroupChat && groupId) {
      const testMessage = `Test group message ${new Date().toLocaleTimeString()}`;
      try {
        await sendGroupMessage(testMessage, groupId, currentUser._id);
        console.log("Test group message sent!");
      } catch (error) {
        console.error("Error sending test group message:", error);
      }
    } else if (!isGroupChat && otherUser) {
      const testMessage = `Test direct message ${new Date().toLocaleTimeString()}`;
      try {
        await sendMessage(
          testMessage,
          currentUser,
          otherUser.id.toString()
        );
        console.log("Test direct message sent!");
      } catch (error) {
        console.error("Error sending test direct message:", error);
      }
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

  if (!currentUser || (!isGroupChat && !otherUser) || (isGroupChat && !groupId) ) {
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
              isOwnMessage={item.user._id === currentUser?._id}
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
            multiline={false}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
            accessibilityLabel="Send message"
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
    paddingVertical: 8,
    marginBottom: Platform.OS === 'ios' ? 60 : 70,
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
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    marginRight: 10,
    backgroundColor: 'white',
    color: '#333',
    fontSize: 16,
    maxHeight: 80,
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
  customBackButton: {
    padding: 10,
    marginLeft: 5,
  },
  backButtonIcon: {
    width: 24, 
    height: 24,
    tintColor: '#9C27B0',
  },
});