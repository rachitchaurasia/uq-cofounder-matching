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
  Dimensions,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { useTailwind } from 'tailwind-rn';
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

// Define resource interface
interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: any;
  animation?: Animated.Value;
  color: string;
}

// Sample startup resources
const STARTUP_RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'UQ Ventures',
    description: 'Official programs and resources hub',
    url: 'https://ventures.uq.edu.au/',
    icon: require('../assets/chatbot-button.png'),
    animation: new Animated.Value(0),
    color: '#7C3AED',
  },
  {
    id: '2',
    title: 'Startup Guide',
    description: 'First steps for entrepreneurs',
    url: 'https://ventures.uq.edu.au/programs',
    icon: require('../assets/chatbot-button.png'),
    animation: new Animated.Value(0),
    color: '#8B5CF6',
  },
  {
    id: '3',
    title: 'Founders Course',
    description: 'Essential entrepreneurship skills',
    url: 'https://ventures.uq.edu.au/programs/founders-course',
    icon: require('../assets/chatbot-button.png'),
    animation: new Animated.Value(0),
    color: '#A78BFA',
  },
  {
    id: '4',
    title: 'Startup Academy',
    description: 'Intensive founder program',
    url: 'https://ventures.uq.edu.au/programs/startup-academy',
    icon: require('../assets/chatbot-button.png'),
    animation: new Animated.Value(0),
    color: '#C4B5FD',
  },
  {
    id: '5',
    title: 'ilab Accelerator',
    description: 'For startups with traction',
    url: 'https://ventures.uq.edu.au/programs/ilab-accelerator',
    icon: require('../assets/chatbot-button.png'),
    animation: new Animated.Value(0),
    color: '#7C3AED',
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
  const inputContainerAnimation = useRef(new Animated.Value(0)).current;
  
  // Typing indicator dots animation
  const dotOneAnimation = useRef(new Animated.Value(0)).current;
  const dotTwoAnimation = useRef(new Animated.Value(0)).current;
  const dotThreeAnimation = useRef(new Animated.Value(0)).current;

  // Initialize with welcome message on mount with animation
  useEffect(() => {
    // Animate the header
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
      easing: Easing.out(Easing.back(1.5)),
    }).start();

    // Animate input container
    Animated.timing(inputContainerAnimation, {
      toValue: 1,
      duration: 700,
      delay: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.back(1)),
    }).start();

    // Start resource card animations sequentially
    STARTUP_RESOURCES.forEach((resource, index) => {
      if (resource.animation) {
        Animated.timing(resource.animation, {
          toValue: 1,
          duration: 600,
          delay: 500 + (index * 120),
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }).start();
      }
    });

    // Add the welcome message with animation after a short delay
    setTimeout(() => {
      const welcomeMessage: Message = {
        id: '1',
        text: 'Hi there! I\'m your UQ Ventures assistant. I can help you find co-founders, explore entrepreneurship resources, and guide your startup journey. How can I help you today?',
        sender: 'bot',
        timestamp: new Date(),
        animation: new Animated.Value(0),
      };
      
      setMessages([welcomeMessage]);
      
      // Animate the welcome message
      if (welcomeMessage.animation) {
        Animated.timing(welcomeMessage.animation, {
          toValue: 1,
          duration: 600,
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
    }, 400);
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
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1)),
      }).start();
    }

    // Show typing indicator
    setIsTyping(true);

    // Simulate bot response after a short delay
    setTimeout(() => {
      setIsTyping(false);
      
      let responseText = "";
      
      // Create personalized responses based on user input
      const lowercaseInput = inputText.toLowerCase();
      if (lowercaseInput.includes("co-founder") || lowercaseInput.includes("cofounder") || lowercaseInput.includes("find partner")) {
        responseText = "Finding the right co-founder is crucial! With UQ's co-founder matching platform, you can connect with potential partners based on complementary skills and shared vision. Check out our Founders Course for more on building effective teams.";
      } else if (lowercaseInput.includes("startup") || lowercaseInput.includes("business") || lowercaseInput.includes("venture")) {
        responseText = "Starting a business is exciting! UQ Ventures offers multiple pathways to help you develop your startup idea. I recommend exploring the Startup Academy program - it's designed to help early-stage founders validate their ideas and build initial prototypes.";
      } else if (lowercaseInput.includes("funding") || lowercaseInput.includes("invest") || lowercaseInput.includes("money")) {
        responseText = "Funding is a key challenge for startups! The ilab Accelerator program can help connect you with potential investors. Also, don't miss UQ Ventures' regular pitch events where you can showcase your idea to angel investors and VCs.";
      } else {
        responseText = "Thanks for your message! I'm still learning, but I can help you explore UQ's startup resources and programs. Check out the options below to find what best matches your entrepreneurial journey.";
      }
      
      // Create bot response with animation
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
        animation: new Animated.Value(0),
      };
      
      setMessages((prevMessages) => [...prevMessages, botResponse]);

      // Animate the bot response
      if (botResponse.animation) {
        Animated.timing(botResponse.animation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1)),
        }).start();
      }

      // Pulse the resource cards to draw attention
      STARTUP_RESOURCES.forEach((resource, index) => {
        if (resource.animation) {
          Animated.sequence([
            Animated.timing(resource.animation, {
              toValue: 1.05,
              duration: 300,
              delay: index * 100,
              useNativeDriver: true,
              easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(resource.animation, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
              easing: Easing.in(Easing.cubic),
            }),
          ]).start();
        }
      });

      // Scroll to the bottom after bot response
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 1800);
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
        <View style={styles.botAvatarContainer}>
          <Image
            source={require('../assets/chatbot-button.png')}
            style={styles.botAvatar}
          />
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
        
        {/* Header with gradient background */}
        <Animated.View 
          style={[
            styles.header,
            {
              transform: [
                {
                  translateY: headerAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-60, 0],
                  }),
                },
              ],
              opacity: headerAnimation,
            },
          ]}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>UQ Ventures Assistant</Text>
            <View style={styles.headerIconContainer}>
              <Image 
                source={require('../assets/chatbot-button.png')} 
                style={styles.headerIcon} 
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          {/* Main chat area */}
          <View style={styles.chatContainer}>
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
                          translateY: message.animation
                            ? message.animation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0],
                              })
                            : 0,
                        },
                        {
                          scale: message.animation
                            ? message.animation.interpolate({
                                inputRange: [0, 0.7, 1],
                                outputRange: [0.9, 1.03, 1],
                              })
                            : 1,
                        },
                      ],
                    },
                  ]}
                >
                  {message.sender === 'bot' && (
                    <View style={styles.botAvatarContainer}>
                      <Image
                        source={require('../assets/chatbot-button.png')}
                        style={styles.botAvatar}
                      />
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

          {/* Resources section */}
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
                              outputRange: [50, 0, -3],
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
                    style={[styles.resourceCard, { backgroundColor: item.color }]}
                    onPress={() => handleResourcePress(item.url)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.resourceIconContainer}>
                      <Image source={item.icon} style={styles.resourceIcon} />
                    </View>
                    <Text style={styles.resourceTitle}>{item.title}</Text>
                    <Text style={styles.resourceDescription}>{item.description}</Text>
                    <View style={styles.resourceLinkContainer}>
                      <Text style={styles.resourceLink}>Explore</Text>
                      <Text style={styles.resourceLinkArrow}>→</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              )}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.resourcesList}
            />
          </View>

          {/* Input area */}
          <Animated.View 
            style={[
              styles.inputWrapper,
              {
                transform: [
                  {
                    translateY: inputContainerAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Ask me about startups..."
                placeholderTextColor="#9CA3AF"
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
    backgroundColor: '#7C3AED',
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
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#7C3AED',
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
    padding: 14,
    minWidth: 60,
    maxWidth: '100%',
    flexShrink: 1,
  },
  userMessageBubble: {
    backgroundColor: '#7C3AED',
    borderTopRightRadius: 3,
    shadowColor: '#7C3AED',
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
    padding: 12,
    width: 70,
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
    backgroundColor: '#7C3AED',
    marginHorizontal: 3,
  },
  resourcesContainer: {
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: '#F5F3FF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  resourcesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 12,
    marginLeft: 16,
  },
  resourcesList: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 5,
  },
  resourceCard: {
    padding: 16,
    borderRadius: 16,
    width: 160,
    marginRight: 12,
    height: 170,
    justifyContent: 'space-between',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  resourceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  resourceIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  resourceTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
  },
  resourceDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
    flexGrow: 1,
  },
  resourceLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  resourceLink: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  resourceLinkArrow: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  inputWrapper: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginBottom: 92,
    borderRadius: 25,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#4B5563',
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#C4B5FD',
    shadowOpacity: 0.1,
  },
  sendIcon: {
    width: 22,
    height: 22,
    tintColor: 'white',
  },
});

export default ChatbotScreen; 