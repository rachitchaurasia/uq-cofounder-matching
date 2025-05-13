import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

// Only import Stream Chat on native platforms
let StreamChat: { getInstance: (apiKey: string) => any } | undefined;
if (Platform.OS !== 'web') {
  StreamChat = require('stream-chat').StreamChat;
}

type StreamChatContextType = {
  client: any | null;
  connecting: boolean;
  setUserAndConnect: (userId: string, name: string, image?: string) => Promise<void>;
  disconnectUser: () => Promise<void>;
};

const StreamChatContext = createContext<StreamChatContextType>({
  client: null,
  connecting: false,
  setUserAndConnect: async () => {},
  disconnectUser: async () => {},
});

export const useStreamChat = () => useContext(StreamChatContext);

export const StreamChatProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [client, setClient] = useState<any | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);

  // Initialize the client - skip on web
  useEffect(() => {
    // Skip initialization on web to avoid native dependencies
    if (Platform.OS === 'web') {
      console.log('Stream Chat disabled on web platform');
      return;
    }
    
    const chatClient = StreamChat.getInstance('8qb2wrp247rb');
    setClient(chatClient);

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, []);

  // Connect user to Stream Chat
  const setUserAndConnect = async (userId: string, name: string, image?: string) => {
    if (!client || Platform.OS === 'web') return;

    try {
      setConnecting(true);
      
      // Get Stream Chat token from our backend
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/chat/token/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get Stream chat token');
      }

      const data = await response.json();
      
      // Connect to Stream Chat
      await client.connectUser(
        {
          id: userId,
          name: name,
          image: image || `https://getstream.io/random_png/?id=${userId}&name=${name}`,
        },
        data.token,
      );
      
      setConnecting(false);
    } catch (error) {
      console.error('Error connecting to Stream Chat:', error);
      setConnecting(false);
    }
  };

  // Disconnect user from Stream Chat
  const disconnectUser = async () => {
    if (!client || Platform.OS === 'web') return;
    
    try {
      await client.disconnectUser();
    } catch (error) {
      console.error('Error disconnecting from Stream Chat:', error);
    }
  };

  return (
    <StreamChatContext.Provider
      value={{
        client,
        connecting,
        setUserAndConnect,
        disconnectUser,
      }}
    >
      {children}
    </StreamChatContext.Provider>
  );
}; 