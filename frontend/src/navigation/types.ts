export type RootStackParamList = {
  SignIn: undefined;
  EmailSignIn: undefined;
  Name: undefined;
  Role: undefined; // Add Role screen
  TroubleSignIn: undefined;
  Welcome: undefined;
  Interests: undefined; // Add the new Interests screen here
  Expertise: undefined; // Add the new Expertise screen here
  Working: undefined;
  Looking: undefined;
  Offer: undefined;
  Registration: undefined;
  WorkingScreen: undefined;
  MainApp: undefined; // This will host the Bottom Tab Navigator
  NewsDetail: { article: NewsArticle };
  CompanyInfo: undefined;
  ChangePassword: undefined; // Added ChangePassword screen
  UserProfileViewScreen: { userId: string; isReadOnly: true }; // Screen to view other users' profiles
};

// Define params for your new screens
export type NewsArticle = {
  id: string;
  title: string;
  author?: string;
  date: string;
  category: string;
  imageUrl: string; // For the main image in detail view
  thumbnailUrl: string; // For the list view
  content: string; // Full content for detail view
  excerpt: string; // Short summary for list view
};

// Screens in your Bottom Tab Navigator
export type BottomTabParamList = {
  HomeTab: undefined; // Or NewsFeedTab if NewsFeed is the primary "home"
  EventsTab: undefined; // For NetworkingEventScreen
  ChatbotTab: undefined; // New Chatbot Tab
  DiscoverTab: undefined; // Placeholder, linked to search icon
  MessagesTab: {
    screen?: keyof MessagesStackParamList; // e.g., 'Conversation' or 'MessagesList'
    params?: MessagesStackParamList[keyof MessagesStackParamList]; // Allows params for any screen in MessagesStack
  };
  ProfileTab: undefined; // Placeholder
  MatchesTab: undefined;
};

// Props for screens
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type NewsDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'NewsDetail'>;

// Props for tab screens
export type HomeTabScreenProps = BottomTabScreenProps<BottomTabParamList, 'HomeTab'>;
export type EventsTabScreenProps = BottomTabScreenProps<BottomTabParamList, 'EventsTab'>;
export type ChatbotTabScreenProps = BottomTabScreenProps<BottomTabParamList, 'ChatbotTab'>;
export type SignInScreenProps = NativeStackScreenProps<RootStackParamList, 'SignIn'>;
export type EmailSignInScreenProps = NativeStackScreenProps<RootStackParamList, 'EmailSignIn'>;
export type RegistrationScreenProps = NativeStackScreenProps<RootStackParamList, 'Registration'>;
export type NameScreenProps = NativeStackScreenProps<RootStackParamList, 'Name'>;
export type RoleScreenProps = NativeStackScreenProps<RootStackParamList, 'Role'>;
export type InterestsScreenProps = NativeStackScreenProps<RootStackParamList, 'Interests'>;
export type ExpertiseScreenProps = NativeStackScreenProps<RootStackParamList, 'Expertise'>;
export type WorkingScreenProps = NativeStackScreenProps<RootStackParamList, 'Working'>;
export type LookingScreenProps = NativeStackScreenProps<RootStackParamList, 'Looking'>;
export type OfferScreenProps = NativeStackScreenProps<RootStackParamList, 'Offer'>;
export type WelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

// Bottom Tab Screen Props
export type DiscoverTabScreenProps = BottomTabScreenProps<BottomTabParamList, 'DiscoverTab'>;
export type MessagesTabScreenProps = BottomTabScreenProps<BottomTabParamList, 'MessagesTab'>;
export type ProfileTabScreenProps = BottomTabScreenProps<BottomTabParamList, 'ProfileTab'>;

// For the messages stack navigator
export type MessagesStackParamList = {
  MessagesList: undefined;
  Conversation: {
    // For Direct Chats
    conversationId?: string; // This is the chat_room_id for direct messages
    otherUser?: {
      id: string;
      name: string;
      position?: string;
      imageUrl?: string;
    };
    // For Group Chats
    groupId?: string;
    groupName?: string;
    isGroupChat?: boolean;
    eventId?: string; // Optional: if the group chat is linked to an event
    // Common - channelId might be deprecated or refactored based on usage
    channelId?: string; 
  };
};