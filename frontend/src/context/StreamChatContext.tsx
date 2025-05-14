import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

import { StreamChat } from 'stream-chat';


// if (Platform.OS !== 'web') {
//   StreamChat = require('stream-chat').StreamChat;
// }

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

  // Initialize the client only on native platforms
  useEffect(() => {
    if (Platform.OS === 'web') {
      return; // Don't initialize on web
    }
    
    // Only use API key for client initialization (no secret on client-side)
    const chatClient = StreamChat.getInstance('6wdyjtcp4ssp');
    setClient(chatClient);

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, []);

  // Connect user to Stream Chat
  const setUserAndConnect = async (userId: string, name: string, image?: string) => {
    if (!client) return;

    try {
      setConnecting(true);
      console.log('Attempting to connect user:', userId);
      
      // Get Django auth token
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      try {
        // Get Stream Chat token from server
        const response = await fetch(`${API_BASE_URL}/api/chat/token/`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${await response.text()}`);
        }

        // Server returned a token successfully
        const data = await response.json();
        
        // Connect to Stream Chat with the server-generated token
        await client.connectUser(
          {
            id: userId,
            name: name,
            image: image || `https://getstream.io/random_png/?id=${userId}&name=${name}`,
          },
          data.token
        );
        
        console.log('Successfully connected user with server token');
      } catch (error) {
        console.error('Error getting token or connecting:', error);
        throw error;
      }
      
      setConnecting(false);
    } catch (error) {
      console.error('Error connecting to Stream Chat:', error);
      setConnecting(false);
      throw error;
    }
  };

  // Disconnect user from Stream Chat
  const disconnectUser = async () => {
    if (!client) return;
    
    try {
      await client.disconnectUser();
      console.log('Successfully disconnected user');
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