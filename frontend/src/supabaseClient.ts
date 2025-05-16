import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oebbdjlfnnjivqsspcuf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lYmJkamxmbm5qaXZxc3NwY3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMTQ1NTEsImV4cCI6MjA2Mjc5MDU1MX0.ek52B8QGGXyz1JqubR80eGq2eKWKK9UVcBkHvXDYqxc';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This is a direct database access helper for messages
// It doesn't rely on authentication but uses your app's service role
export const getMessages = async (userId1: string, userId2: string) => {
  const chatRoomId = getChatRoomId(userId1, userId2);
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_room_id', chatRoomId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  
  return transformMessages(data || []);
};

// Helper to get chat room ID (consistent regardless of who initiates)
export const getChatRoomId = (uid1: string, uid2: string): string => {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

// Transform messages from DB format to app format
const transformMessages = (messages: any[]): any[] => {
  return messages.map(msg => ({
    _id: msg.id,
    text: msg.content,
    createdAt: new Date(msg.created_at),
    user: {
      _id: msg.sender_id,
      name: '',
    }
  }));
};
