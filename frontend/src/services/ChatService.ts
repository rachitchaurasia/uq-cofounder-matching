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
  isSystemMessage?: boolean; // Optional: For "User X joined the group"
}

// Define the structure for a conversation summary
interface SupabaseConversation {
  id: string; // chat_room_id
  participants: string[];
  lastMessage: string;
  lastMessageTime: string | Date; // Supabase returns ISO string for timestamps
}

// NEW: Define structure for a group conversation summary
export interface IGroupConversation {
  id: string; // group_id
  name: string; // group_name
  avatar_url?: string; // group_avatar_url
  lastMessage?: string;
  lastMessageTime?: string | Date;
  unreadCount?: number; // Optional
  event_id?: string; // Optional, if it's an event group
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

// ----- NEW GROUP CHAT FUNCTIONS -----

// Get all group conversations for a user
export async function getGroupConversations(userId: string): Promise<IGroupConversation[]> {
  console.log("Getting group conversations for user:", userId);
  try {
    // Fetch groups the user is a member of
    const { data: groupMemberships, error: membershipError } = await supabase
      .from('group_participants')
      .select('group_id, groups (id, name, avatar_url, event_id)')
      .eq('user_id', userId);

    if (membershipError) {
      console.error("Error fetching user's group memberships:", membershipError);
      throw membershipError;
    }

    if (!groupMemberships || groupMemberships.length === 0) {
      return [];
    }

    const groupConversations: IGroupConversation[] = [];

    for (const membership of groupMemberships) {
      const group = membership.groups as any; // Type assertion for simplicity
      if (!group) continue;

      // Fetch the last message for this group
      const { data: lastMsgData, error: lastMsgError } = await supabase
        .from('group_messages')
        .select('text, created_at')
        .eq('group_id', group.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(); // Fetches a single record or null

      if (lastMsgError && lastMsgError.code !== 'PGRST116') { // PGRST116: "Warning: query returned 0 rows" - this is fine
        console.warn(`Error fetching last message for group ${group.id}:`, lastMsgError);
      }
      
      groupConversations.push({
        id: group.id,
        name: group.name,
        avatar_url: group.avatar_url,
        event_id: group.event_id,
        lastMessage: lastMsgData?.text,
        lastMessageTime: lastMsgData?.created_at,
      });
    }
    
    // Sort by last message time, descending (most recent first)
    groupConversations.sort((a, b) => {
      const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
      const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
      return timeB - timeA;
    });

    console.log("Group conversations found:", groupConversations.length);
    return groupConversations;

  } catch (error) {
    console.error('Error getting group conversations:', error);
    return [];
  }
}

// Send a group message
export async function sendGroupMessage(text: string, groupId: string, senderId: string) {
  try {
    console.log("Sending group message:", text, "to group", groupId, "from", senderId);
    
    const { data, error } = await supabase.from('group_messages').insert([
      {
        group_id: groupId,
        sender_id: senderId,
        text: text,
      }
    ]);
    
    if (error) {
      console.error("Error sending group message:", error);
      throw error;
    }
    
    console.log("Group message sent successfully:", data);
    return data;
  } catch (error) {
    console.error('Error sending group message:', error);
    throw error;
  }
}

// Fetch group messages
export async function fetchGroupMessages(groupId: string): Promise<IMessage[]> {
  console.log("Fetching messages for group", groupId);
  try {
    const { data: messagesData, error } = await supabase
      .from('group_messages')
      .select(`
        id,
        text,
        created_at,
        sender_id,
        sender:profiles (full_name, avatar_url)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false }); // Fetch latest first

    if (error) {
      console.error('Error fetching group messages:', error);
      throw error;
    }

    if (!messagesData) return [];

    // Transform to IMessage format
    const formattedMessages: IMessage[] = messagesData.map((msg: any) => ({
      _id: msg.id,
      text: msg.text,
      createdAt: new Date(msg.created_at),
      user: {
        _id: msg.sender_id,
        name: msg.sender?.full_name || `User ${msg.sender_id.substring(0,6)}`,
        avatar: msg.sender?.avatar_url,
      },
    }));
    console.log("Group messages fetched for", groupId, ":", formattedMessages.length);
    return formattedMessages;

  } catch (error) {
    console.error('Error fetching group messages:', error);
    return [];
  }
}


// Subscribe to group messages
export function subscribeToGroupMessages(groupId: string, callback: (messages: IMessage[]) => void) {
  console.log("Setting up subscription for group room:", groupId);
  
  const channel = supabase
    .channel(`group:${groupId}`)
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'group_messages',
      filter: `group_id=eq.${groupId}`
    }, payload => {
      console.log("Real-time group message received:", payload);
      // When a new message is received, fetch all messages for the group
      fetchGroupMessages(groupId).then(callback);
    })
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to group ${groupId}`);
      }
      if (status === 'CHANNEL_ERROR') {
        console.error(`Subscription error for group ${groupId}:`, err);
      }
      if (status === 'TIMED_OUT') {
        console.warn(`Subscription timeout for group ${groupId}`);
      }
    });

  console.log("Group subscription channel created:", channel);

  // Initial fetch of messages
  fetchGroupMessages(groupId).then(messages => {
    console.log("Initial group messages loaded for", groupId, ":", messages.length);
    callback(messages);
  });

  return () => {
    console.log("Unsubscribing from group channel", groupId);
    supabase.removeChannel(channel);
  };
}

// ----- EVENT GROUP FUNCTIONS -----

// Check event group membership
export async function getEventGroupMembership(eventId: string, userId: string): Promise<{ isMember: boolean, groupId: string | null, groupName: string | null }> {
  try {
    // Find the group associated with the event
    const { data: eventGroup, error: groupError } = await supabase
      .from('groups')
      .select('id, name')
      .eq('event_id', eventId)
      .maybeSingle(); // Use maybeSingle as an event might not have a group yet

    if (groupError) {
      console.error(`Error finding group for event ${eventId}:`, groupError);
      throw groupError;
    }

    if (!eventGroup) {
      return { isMember: false, groupId: null, groupName: null };
    }

    // Check if the user is a participant in this group
    const { data: participant, error: participantError } = await supabase
      .from('group_participants')
      .select('user_id')
      .eq('group_id', eventGroup.id)
      .eq('user_id', userId)
      .maybeSingle();

    if (participantError) {
      console.error(`Error checking participation for user ${userId} in group ${eventGroup.id}:`, participantError);
      throw participantError;
    }
    
    return { isMember: !!participant, groupId: eventGroup.id, groupName: eventGroup.name };

  } catch (error) {
    console.error(`Error checking event group membership for event ${eventId}:`, error);
    return { isMember: false, groupId: null, groupName: null };
  }
}

// Join an event's chat group (creates group if not exists)
export async function joinEventGroup(eventId: string, userId: string, eventTitle: string): Promise<{ groupId: string, groupName: string, justCreated: boolean }> {
  try {
    // 1. Check if a group for this event already exists
    let { data: existingGroup, error: findError } = await supabase
      .from('groups')
      .select('id, name')
      .eq('event_id', eventId)
      .maybeSingle();

    if (findError) {
      console.error(`Error finding group for event ${eventId}:`, findError);
      throw findError;
    }
    
    let groupId: string;
    let groupName: string = existingGroup?.name || `${eventTitle} Attendees`;
    let justCreated = false;

    if (existingGroup) {
      groupId = existingGroup.id;
      console.log(`Group for event ${eventId} already exists: ${groupId}`);
    } else {
      // 2. If not, create the group
      console.log(`No group for event ${eventId}. Creating one...`);
      const { data: newGroup, error: createError } = await supabase
        .from('groups')
        .insert({
          name: groupName,
          event_id: eventId,
          created_by: userId, // Or a system ID if preferred
          // avatar_url can be set later or based on event image
        })
        .select('id, name')
        .single();
      
      if (createError || !newGroup) {
        console.error(`Error creating group for event ${eventId}:`, createError);
        throw createError || new Error('Failed to create group');
      }
      groupId = newGroup.id;
      groupName = newGroup.name; // Update name in case it was modified by DB
      justCreated = true;
      console.log(`Group created for event ${eventId}: ${groupId}`);
    }

    // 3. Add user to group_participants if not already there
    const { error: participationError } = await supabase
      .from('group_participants')
      .upsert({ group_id: groupId, user_id: userId }, { onConflict: 'group_id,user_id' }); // Ignores if already a member

    if (participationError) {
      console.error(`Error adding user ${userId} to group ${groupId}:`, participationError);
      throw participationError;
    }
    
    console.log(`User ${userId} successfully joined/confirmed in group ${groupId} for event ${eventId}`);
    return { groupId, groupName, justCreated };

  } catch (error) {
    console.error(`Error joining event group for event ${eventId}:`, error);
    throw error; // Re-throw to be handled by caller
  }
}

// Optional: Function to leave an event group (or any group)
export async function leaveGroup(groupId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('group_participants')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) {
      console.error(`Error removing user ${userId} from group ${groupId}:`, error);
      throw error;
    }
    console.log(`User ${userId} left group ${groupId}`);
  } catch (error) {
    console.error('Error in leaveGroup:', error);
    throw error;
  }
}

// Potentially a function to get group members
export async function getGroupMembers(groupId: string): Promise<Array<{ id: string, name: string, avatar_url?: string }>> {
    try {
        const { data, error } = await supabase
            .from('group_participants')
            .select(`
                user_id,
                profiles (full_name, avatar_url)
            `)
            .eq('group_id', groupId);

        if (error) {
            console.error("Error fetching group members:", error);
            throw error;
        }
        if (!data) return [];

        return data.map((gm: any) => ({
            id: gm.user_id,
            name: gm.profiles?.full_name || `User ${gm.user_id.substring(0,6)}`,
            avatar_url: gm.profiles?.avatar_url
        }));
    } catch (error) {
        console.error('Error in getGroupMembers:', error);
        return [];
    }
}
