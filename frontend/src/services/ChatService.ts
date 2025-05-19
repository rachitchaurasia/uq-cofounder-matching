import { supabase, getChatRoomId, getMessages } from '../supabaseClient';

// Define message interface
export interface IMessage {
  _id: string;
  text: string;
  createdAt: Date;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

// Define the structure for a conversation summary
interface SupabaseConversation {
  id: string; // chat_room_id
  participants: string[];
  lastMessage: string;
  lastMessageTime: string | Date; // Supabase returns ISO string for timestamps
}

// Send a message
export async function sendMessage(text: string, sender: any, receiverId: string) {
  try {
    console.log("Sending message:", text, "from", sender._id, "to", receiverId);
    
    // Insert message in Supabase
    const { data, error } = await supabase.from('messages').insert([
      {
        sender_id: sender._id,
        receiver_id: receiverId,
        content: text,
        chat_room_id: getChatRoomId(sender._id, receiverId)
      }
    ]);
    
    if (error) {
      console.error("Error sending message:", error);
      throw error;
    }
    
    console.log("Message sent successfully:", data);
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

// Subscribe to messages in a chat
export function subscribeToMessages(userId: string, otherUserId: string, callback: (messages: IMessage[]) => void) {
  // Get the chat room ID
  const roomId = getChatRoomId(userId, otherUserId);
  console.log("Setting up subscription for chat room:", roomId);
  
  // Subscribe to real-time changes for this chat room
  const channel = supabase
    .channel(`room:${roomId}`)
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'messages',
      filter: `chat_room_id=eq.${roomId}`
    }, payload => {
      console.log("Real-time message received:", payload);
      // When a new message is received, fetch all messages
      fetchMessages(userId, otherUserId).then(callback);
    })
    .subscribe();

  console.log("Subscription channel created:", channel);

  // Initial fetch of messages
  fetchMessages(userId, otherUserId).then(messages => {
    console.log("Initial messages loaded:", messages.length);
    callback(messages);
  });

  // Return unsubscribe function
  return () => {
    console.log("Unsubscribing from channel");
    supabase.removeChannel(channel);
  };
}

// Fetch messages between two users
export async function fetchMessages(userId: string, otherUserId: string): Promise<IMessage[]> {
  console.log("Fetching messages between", userId, "and", otherUserId);
  try {
    // Use direct getMessages helper from supabaseClient
    const messages = await getMessages(userId, otherUserId);
    console.log("Messages fetched:", messages.length);
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

// Get all conversations for a user
export async function getConversations(userId: string): Promise<SupabaseConversation[]> {
  console.log("Getting conversations for user:", userId);
  try {
    // Find all chat rooms where this user is a participant
    // Fetching relevant fields to determine participants and last message.
    const { data, error } = await supabase
      .from('messages')
      .select('chat_room_id, sender_id, receiver_id, content, created_at')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false }); // Important to get the latest message for grouping
    
    if (error) {
      console.error("Error getting conversations:", error);
      throw error; // Or return [] depending on desired error handling
    }

    if (!data) {
      return [];
    }
    
    // Group messages by chat room and get the last message for each room
    const conversationsMap: { [roomId: string]: SupabaseConversation } = {};
    
    data.forEach(msg => {
      // Ensure msg.created_at is valid before creating a Date object
      const currentMessageTime = msg.created_at ? new Date(msg.created_at) : new Date(0);
      const existingConversation = conversationsMap[msg.chat_room_id];

      if (!existingConversation || (existingConversation.lastMessageTime && currentMessageTime > new Date(existingConversation.lastMessageTime))) {
        const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        
        // Ensure participants are unique and correctly ordered if necessary, though for this purpose, just listing them is fine.
        // Supabase typically returns ISO strings for timestamps.
        conversationsMap[msg.chat_room_id] = {
          id: msg.chat_room_id,
          participants: [userId, otherUserId].filter(id => id != null) as string[], // Filter out nulls and assert as string[]
          lastMessage: msg.content,
          lastMessageTime: msg.created_at, // Keep as ISO string or convert to Date as needed by consuming component
        };
      }
    });
    
    console.log("Conversations found:", Object.keys(conversationsMap).length);
    return Object.values(conversationsMap);
  } catch (error) {
    console.error('Error getting conversations:', error);
    // Depending on requirements, you might want to return an empty array or re-throw
    return []; // Return empty array on error to prevent app crash
  }
}
