import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Linking,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { ChatbotTabScreenProps } from '../navigation/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define the message interface
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  animation?: Animated.Value;
}

const GEMINI_API_KEY = 'Your API Key';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are an AI-Powered Chatbot for Startup Guidance, specifically for users associated with UQ (University of Queensland) Ventures.
Your primary goal is to provide helpful and concise information related to:
1.  UQ Ventures resources (e.g., programs like ilab Accelerator, Startup Academy, Founders Course, events, mentorship).
2.  Funding opportunities relevant to startups (e.g., grants, angel investors, VCs, pitch competitions).
3.  Business planning support (e.g., advice on market research, MVP development, team building, legal basics for startups).

Politely decline to answer questions that are clearly outside of these topics.
Do not engage in general conversation, provide opinions, or discuss sensitive personal information.
If a user asks for a resource that UQ Ventures offers (like a specific program or a type of support), provide a brief description and, if readily available and appropriate, a conceptual link or a suggestion to search the UQ Ventures website.
Keep your answers informative and actionable.
`;

const ChatbotScreen: React.FC<ChatbotTabScreenProps> = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const inputContainerAnimation = useRef(new Animated.Value(0)).current;
  
  const dotOneAnimation = useRef(new Animated.Value(0)).current;
  const dotTwoAnimation = useRef(new Animated.Value(0)).current;
  const dotThreeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
      easing: Easing.out(Easing.back(1.5)),
    }).start();

    Animated.timing(inputContainerAnimation, {
      toValue: 1,
      duration: 700,
      delay: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.back(1)),
    }).start();

    setTimeout(() => {
      const welcomeMessage: Message = {
        id: '1',
        text: 'Hi there! I\'m your UQ Ventures assistant. I can help you with UQ Ventures resources, funding opportunities, and business planning. How can I assist you today?',
        sender: 'bot',
        timestamp: new Date(),
        animation: new Animated.Value(0),
      };
      
      setMessages([welcomeMessage]);
      
      if (welcomeMessage.animation) {
        Animated.timing(welcomeMessage.animation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }).start();
      }

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 400);
  }, []);

  useEffect(() => {
    if (isTyping) {
      const animateDots = () => {
        Animated.sequence([
          Animated.timing(dotOneAnimation, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dotTwoAnimation, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dotThreeAnimation, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.parallel([
            Animated.timing(dotOneAnimation, { toValue: 0, duration: 400, useNativeDriver: true }),
            Animated.timing(dotTwoAnimation, { toValue: 0, duration: 400, useNativeDriver: true }),
            Animated.timing(dotThreeAnimation, { toValue: 0, duration: 400, useNativeDriver: true }),
          ]),
        ]).start(() => { if (isTyping) animateDots(); });
      };
      animateDots();
    } else {
      dotOneAnimation.setValue(0);
      dotTwoAnimation.setValue(0);
      dotThreeAnimation.setValue(0);
    }
    return () => {
      dotOneAnimation.setValue(0);
      dotTwoAnimation.setValue(0);
      dotThreeAnimation.setValue(0);
    };
  }, [isTyping]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      animation: new Animated.Value(0),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const currentInput = inputText;
    setInputText('');
    Keyboard.dismiss();

    if (userMessage.animation) {
      Animated.timing(userMessage.animation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1)),
      }).start();
    }

    setIsTyping(true);

    try {
      if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_PLACEHOLDER') {
        throw new Error("Gemini API key is a placeholder. Please replace it with your actual key.");
      }
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: SYSTEM_PROMPT }, 
                { text: `User query: ${currentInput}` }
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 300, // Increased token limit slightly
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API Error Full Response:', errorData);
        const detail = errorData?.error?.message || 'Unknown API error';
        throw new Error(`API Error: ${response.status} - ${detail}`);
      }

      const data = await response.json();
      let botResponseText = "Sorry, I couldn't get a response. Please try again.";

      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
        botResponseText = data.candidates[0].content.parts[0].text;
      } else {
        console.warn("Gemini API response format unexpected:", data);
         if (data.promptFeedback && data.promptFeedback.blockReason) {
          botResponseText = `Blocked: ${data.promptFeedback.blockReason}. Details: ${data.promptFeedback.safetyRatings ? JSON.stringify(data.promptFeedback.safetyRatings) : ''}`;
        }
      }
      
      if (botResponseText.toLowerCase().startsWith("output:")) {
        botResponseText = botResponseText.substring("output:".length).trim();
      }


      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
        animation: new Animated.Value(0),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);

      if (botMessage.animation) {
        Animated.timing(botMessage.animation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1)),
        }).start();
      }

    } catch (error: any) {
      console.error('Failed to send message or get response:', error);
      const errorMessageText = error.message.includes('YOUR_GEMINI_API_KEY_PLACEHOLDER')
        ? "Please configure the Gemini API key to use the chatbot."
        : `Sorry, I encountered an error: ${error.message}. Please try again later.`;

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMessageText,
        sender: 'bot',
        timestamp: new Date(),
        animation: new Animated.Value(0),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      if (errorMessage.animation) {
        Animated.timing(errorMessage.animation, {
              toValue: 1,
          duration: 500,
              useNativeDriver: true,
          easing: Easing.out(Easing.back(1)),
        }).start();
        }
    } finally {
      setIsTyping(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    const dotStyle = (animation: Animated.Value) => ({
      opacity: animation,
      transform: [{ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }],
    });
    return (
      <View style={styles.typingContainer}>
        <View style={styles.botAvatarContainer}>
          <Image source={require('../assets/chatbot-button.png')} style={styles.botAvatar} />
        </View>
        <View style={styles.typingBubble}>
          <Animated.View style={[styles.typingDot, dotStyle(dotOneAnimation)]} />
          <Animated.View style={[styles.typingDot, dotStyle(dotTwoAnimation)]} />
          <Animated.View style={[styles.typingDot, dotStyle(dotThreeAnimation)]} />
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} 
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#a702c8" />
        
        <Animated.View 
          style={[
            styles.header,
            {
              transform: [{ translateY: headerAnimation.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] })}],
              opacity: headerAnimation,
            },
          ]}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>UQ Ventures Assistant</Text>
            <View style={styles.headerIconContainer}>
              <Image source={require('../assets/chatbot-button.png')} style={styles.headerIcon} />
            </View>
          </View>
        </Animated.View>

        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <View style={styles.chatContainer}>
            <ScrollView
              style={styles.messagesContainer}
              ref={scrollViewRef}
              contentContainerStyle={styles.messageContent}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((message) => (
                <Animated.View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    message.sender === 'user' ? styles.userMessage : styles.botMessage,
                    {
                      opacity: message.animation || 1,
                      transform: [
                        {
                          translateY: message.animation
                            ? message.animation.interpolate({ inputRange: [0, 1], outputRange: [20, 0] })
                            : 0,
                        },
                        {
                          scale: message.animation
                            ? message.animation.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.9, 1.03, 1] })
                            : 1,
                        },
                      ],
                    },
                  ]}
                >
                  {message.sender === 'bot' && (
                    <View style={styles.botAvatarContainer}>
                      <Image source={require('../assets/chatbot-button.png')} style={styles.botAvatar} />
                    </View>
                  )}
                  <View 
                    style={[
                      styles.messageTextContainer,
                      message.sender === 'user' ? styles.userMessageBubble : styles.botMessageBubble
                    ]}
                  >
                    <Text style={[
                      styles.messageText,
                      message.sender === 'user' ? styles.userMessageText : styles.botMessageText
                    ]}>
                      {message.text}
                    </Text>
                    <Text style={[
                      styles.timestamp,
                      message.sender === 'user' ? styles.userTimestamp : styles.botTimestamp
                    ]}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </Animated.View>
              ))}
              {renderTypingIndicator()}
            </ScrollView>
          </View>

          <Animated.View 
            style={[
              styles.inputWrapper,
              {
                transform: [{ translateY: inputContainerAnimation.interpolate({ inputRange: [0, 1], outputRange: [100, 0] })}],
              },
            ]}
          >
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Ask about UQ Ventures, funding..."
                placeholderTextColor="#9CA3AF"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSend}
                returnKeyType="send"
                blurOnSubmit={false} 
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !inputText.trim() && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!inputText.trim()}
                activeOpacity={0.7}
              >
                <Image 
                  source={require('../assets/chatbot-button.png')} 
                  style={styles.sendIcon} 
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#a702c8', 
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerIconContainer: {
    position: 'absolute',
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  messagesContainer: {
    flex: 1,
  },
  messageContent: {
    padding: 16,
    paddingBottom: 30,
  },
  messageBubble: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    marginLeft: 50,
  },
  botMessage: {
    alignSelf: 'flex-start',
    marginRight: 50,
  },
  botAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#a702c8', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#a702c8', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  botAvatar: {
    width: 22,
    height: 22,
    tintColor: 'white',
  },
  messageTextContainer: {
    borderRadius: 20,
    paddingHorizontal: 14, // Horizontal padding
    paddingVertical: 10, // Vertical padding
    minWidth: 60,
    maxWidth: '100%',
    flexShrink: 1,
  },
  userMessageBubble: {
    backgroundColor: '#a702c8', 
    borderTopRightRadius: 3,
    shadowColor: '#a702c8', 
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  botMessageBubble: {
    backgroundColor: 'white',
    borderTopLeftRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    flexWrap: 'wrap',
  },
  userMessageText: {
    color: 'white',
    flexShrink: 1,
  },
  botMessageText: {
    color: '#374151',
    flexShrink: 1,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  botTimestamp: {
    color: '#9CA3AF',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 12, // Adjusted padding
    paddingHorizontal: 15, // Adjusted padding
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#a702c8', 
    marginHorizontal: 3,
  },
  inputWrapper: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10, 
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05, 
    shadowRadius: 5,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 25,
    paddingLeft: 5,
    paddingRight: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: Platform.OS === 'ios' ? 60 : 70,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8, 
    fontSize: 16,
    color: '#4B5563',
    maxHeight: 80,
  },
  sendButton: {
    width: 44, // Slightly adjusted size
    height: 44, // Slightly adjusted size
    borderRadius: 22, 
    backgroundColor: '#a702c8', 
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5, // Space between input and button
    shadowColor: '#a702c8', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#C4B5FD', // Lighter purple when disabled
    shadowOpacity: 0.1,
  },
  sendIcon: {
    width: 22,
    height: 22,
    tintColor: 'white',
  },
});

export default ChatbotScreen; 
