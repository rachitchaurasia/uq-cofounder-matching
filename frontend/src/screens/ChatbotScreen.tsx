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
  FlatList,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { ChatbotTabScreenProps } from '../navigation/types';

// Define the message interface
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  animation?: Animated.Value;
}

// Define resource interface
interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  animation?: Animated.Value;
}

// Sample startup resources
const STARTUP_RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'UQ Ventures',
    description: 'Official UQ Ventures homepage with programs and resources',
    url: 'https://ventures.uq.edu.au/',
    animation: new Animated.Value(0),
  },
  {
    id: '2',
    title: 'Startup Guide',
    description: 'Comprehensive guide to starting your first venture',
    url: 'https://ventures.uq.edu.au/programs',
    animation: new Animated.Value(0),
  },
  {
    id: '3',
    title: 'Founders Course',
    description: 'Learn essential entrepreneurship skills',
    url: 'https://ventures.uq.edu.au/programs/founders-course',
    animation: new Animated.Value(0),
  },
  {
    id: '4',
    title: 'Startup Academy',
    description: 'Intensive program for founders',
    url: 'https://ventures.uq.edu.au/programs/startup-academy',
    animation: new Animated.Value(0),
  },
  {
    id: '5',
    title: 'ilab Accelerator',
    description: 'Accelerator program for startups with traction',
    url: 'https://ventures.uq.edu.au/programs/ilab-accelerator',
    animation: new Animated.Value(0),
  },
];

const ChatbotScreen: React.FC<ChatbotTabScreenProps> = () => {
  const tw = useTailwind();
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnimation = useRef(new Animated.Value(0)).current;
  
  // Typing indicator dots animation
  const dotOneAnimation = useRef(new Animated.Value(0)).current;
  const dotTwoAnimation = useRef(new Animated.Value(0)).current;
  const dotThreeAnimation = useRef(new Animated.Value(0)).current;

  // Initialize with welcome message on mount with animation
  useEffect(() => {
    // Animate the header
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();

    // Start resource card animations sequentially
    STARTUP_RESOURCES.forEach((resource, index) => {
      if (resource.animation) {
        Animated.timing(resource.animation, {
          toValue: 1,
          duration: 400,
          delay: 300 + (index * 100),
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }).start();
      }
    });

    // Add the welcome message with animation after a short delay
    setTimeout(() => {
      const welcomeMessage: Message = {
        id: '1',
        text: 'Hi there! I\'m your UQ Ventures assistant. I can help you with information about entrepreneurship resources, co-founder matching, and startup guidance. How can I help you today?',
        sender: 'bot',
        timestamp: new Date(),
        animation: new Animated.Value(0),
      };
      
      setMessages([welcomeMessage]);
      
      // Animate the welcome message
      if (welcomeMessage.animation) {
        Animated.timing(welcomeMessage.animation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }).start();
      }

      // Animate the fade-in of the UI
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 300);
  }, []);

  // Animate typing indicator
  useEffect(() => {
    if (isTyping) {
      const animateDots = () => {
        Animated.sequence([
          Animated.timing(dotOneAnimation, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dotTwoAnimation, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dotThreeAnimation, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(dotOneAnimation, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dotTwoAnimation, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dotThreeAnimation, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          if (isTyping) {
            animateDots();
          }
        });
      };

      animateDots();
    } else {
      // Reset animations when not typing
      dotOneAnimation.setValue(0);
      dotTwoAnimation.setValue(0);
      dotThreeAnimation.setValue(0);
    }

    return () => {
      // Cleanup animations
      dotOneAnimation.setValue(0);
      dotTwoAnimation.setValue(0);
      dotThreeAnimation.setValue(0);
    };
  }, [isTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    // Create user message with animation
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      animation: new Animated.Value(0),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText('');
    Keyboard.dismiss();

    // Animate the user message
    if (userMessage.animation) {
      Animated.timing(userMessage.animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    }

    // Show typing indicator
    setIsTyping(true);

    // Simulate bot response after a short delay
    setTimeout(() => {
      setIsTyping(false);
      
      // Create bot response with animation
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm still in development, but I can show you some helpful resources for UQ startup founders. Check out the resources section below!",
        sender: 'bot',
        timestamp: new Date(),
        animation: new Animated.Value(0),
      };
      
      setMessages((prevMessages) => [...prevMessages, botResponse]);

      // Animate the bot response
      if (botResponse.animation) {
        Animated.timing(botResponse.animation, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }).start();
      }

      // Pulse the resource cards to draw attention
      STARTUP_RESOURCES.forEach((resource, index) => {
        if (resource.animation) {
          Animated.sequence([
            Animated.timing(resource.animation, {
              toValue: 1.05,
              duration: 200,
              delay: index * 100,
              useNativeDriver: true,
              easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(resource.animation, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
              easing: Easing.in(Easing.cubic),
            }),
          ]).start();
        }
      });

      // Scroll to the bottom after bot response
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 1500);
  };

  const handleResourcePress = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Error opening URL:', err));
  };

  // Scroll to bottom whenever messages change
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
      transform: [
        {
          translateY: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -10],
          }),
        },
      ],
    });

    return (
      <View style={styles.typingContainer}>
        <Image
          source={require('../assets/chatbot-button.png')}
          style={styles.botAvatar}
        />
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <SafeAreaView style={styles.container}>
        <Animated.View 
          style={[
            styles.header,
            {
              transform: [
                {
                  translateY: headerAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
              ],
              opacity: headerAnimation,
            },
          ]}
        >
          <Text style={styles.headerTitle}>UQ Ventures Assistant</Text>
        </Animated.View>

        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView
            style={styles.messagesContainer}
            ref={scrollViewRef}
            contentContainerStyle={styles.messageContent}
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
                        translateX: message.animation
                          ? message.animation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [message.sender === 'user' ? 50 : -50, 0],
                            })
                          : 0,
                      },
                      {
                        scale: message.animation
                          ? message.animation.interpolate({
                              inputRange: [0, 0.7, 1],
                              outputRange: [0.6, 1.05, 1],
                            })
                          : 1,
                      },
                    ],
                  },
                ]}
              >
                {message.sender === 'bot' && (
                  <Image
                    source={require('../assets/chatbot-button.png')}
                    style={styles.botAvatar}
                  />
                )}
                <View style={styles.messageTextContainer}>
                  <Text style={styles.messageText}>{message.text}</Text>
                  <Text style={styles.timestamp}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </Animated.View>
            ))}
            {renderTypingIndicator()}
          </ScrollView>

          <View style={styles.resourcesContainer}>
            <Text style={styles.resourcesTitle}>Startup Resources</Text>
            <FlatList
              horizontal
              data={STARTUP_RESOURCES}
              renderItem={({ item, index }) => (
                <Animated.View
                  style={{
                    opacity: item.animation || 1,
                    transform: [
                      {
                        translateY: item.animation
                          ? item.animation.interpolate({
                              inputRange: [0, 1, 1.05],
                              outputRange: [50, 0, -5],
                            })
                          : 0,
                      },
                      {
                        scale: item.animation || 1,
                      },
                    ],
                  }}
                >
                  <TouchableOpacity
                    style={styles.resourceCard}
                    onPress={() => handleResourcePress(item.url)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.resourceTitle}>{item.title}</Text>
                    <Text style={styles.resourceDescription}>{item.description}</Text>
                    <View style={styles.resourceLinkContainer}>
                      <Text style={styles.resourceLink}>Learn more</Text>
                      <Text style={styles.resourceLinkArrow}>→</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              )}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Type a message..."
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
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
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6D28D9', // Purple color from the app's theme
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e2e2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messageContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  botMessage: {
    alignSelf: 'flex-start',
  },
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  messageTextContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    padding: 12,
    width: 70,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#888',
    marginHorizontal: 3,
  },
  resourcesContainer: {
    backgroundColor: '#f0ebfa', // Light purple
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e2e2',
  },
  resourcesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6D28D9',
    marginBottom: 12,
  },
  resourceCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    width: 250,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    height: 150,
    justifyContent: 'space-between',
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6D28D9',
    marginBottom: 6,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    flexGrow: 1,
  },
  resourceLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceLink: {
    fontSize: 14,
    color: '#6D28D9',
    fontWeight: 'bold',
  },
  resourceLinkArrow: {
    color: '#6D28D9',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e2e2',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: '#6D28D9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#a78bcc',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatbotScreen; 