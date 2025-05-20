import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { EventsTabScreenProps } from '../navigation/types';
import { supabase } from '../supabaseClient';
import { getEventGroupMembership, joinEventGroup } from '../services/ChatService';
import { useFocusEffect } from '@react-navigation/native';

interface EventDetail {
  id: string;
  title: string;
  date: string;
  time: string;
  address: string;
  mapLink: string;
  description: string;
  image?: any;
  imageUrl?: string;
}

const eventDetailsList: EventDetail[] = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    title: 'UQ Ventures Networking Night',
    date: 'Thursday, 25th July 2024',
    time: '6:00 PM - 8:00 PM',
    address: 'GCI Building 20, University of Queensland, St Lucia, QLD 4067',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=GCI+Building+20+University+of+Queensland+St+Lucia',
    description:
      "Join us for an exciting evening of networking with fellow innovators, entrepreneurs, mentors, and investors from the UQ Ventures community. This is a fantastic opportunity to connect, share ideas, and potentially find your next collaborator or co-founder. Refreshments will be provided.",
  },
  {
    id: '79c3a099-7491-491e-b391-9ea02368321a',
    title: 'Tech Innovators Meetup Aug 2024',
    date: 'Tuesday, 15th August 2024',
    time: '7:00 PM - 9:00 PM',
    address: 'The Precinct, Fortitude Valley, Brisbane, QLD 4006',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=The+Precinct+Fortitude+Valley+Brisbane',
    description:
      "A casual meetup for tech enthusiasts, developers, designers, and startup founders. Share what you're working on, learn from others, and enjoy some pizza. All welcome!",
    imageUrl: 'https://example.com/images/tech-meetup.jpg'
  }
];

export const NetworkingEventScreen: React.FC<EventsTabScreenProps> = ({ navigation }) => {
  const tw = useTailwind();
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [eventGroupInfo, setEventGroupInfo] = React.useState<{ isMember: boolean, groupId: string | null, groupName: string | null }>({ isMember: false, groupId: null, groupName: null });
  const [isLoadingMembership, setIsLoadingMembership] = React.useState(true);

  const eventDetails = eventDetailsList[0];

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const checkEventMembership = async () => {
    if (!currentUserId || !eventDetails.id) return;
    setIsLoadingMembership(true);
    try {
      const membership = await getEventGroupMembership(eventDetails.id, currentUserId);
      setEventGroupInfo(membership);
    } catch (error) {
      console.error("Error checking event membership:", error);
      setEventGroupInfo({ isMember: false, groupId: null, groupName: null });
    } finally {
      setIsLoadingMembership(false);
    }
  };

  useEffect(() => {
    checkEventMembership();
  }, [currentUserId, eventDetails.id]);

  useFocusEffect(
    React.useCallback(() => {
      checkEventMembership();
      return () => {};
    }, [currentUserId, eventDetails.id])
  );

  const handleRegister = () => {
    Alert.alert(
      "Registration",
      "You will be redirected to an external site to register for this event. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Continue", onPress: () => console.log("Redirect to registration page") }
      ]
    );
  };

  const openMap = () => {
    Linking.openURL(eventDetails.mapLink).catch(err => console.error("Couldn't load page", err));
  };

  const handleJoinEventChat = async () => {
    if (!currentUserId || !eventDetails.id) {
      Alert.alert("Error", "Could not identify user or event.");
      return;
    }
    setIsLoadingMembership(true);
    try {
      const { groupId, groupName } = await joinEventGroup(eventDetails.id, currentUserId, eventDetails.title);
      setEventGroupInfo({ isMember: true, groupId, groupName });
      navigation.navigate('MessagesTab', {
        screen: 'Conversation',
        params: {
          groupId: groupId,
          groupName: groupName,
          isGroupChat: true,
          eventId: eventDetails.id
        }
      });
    } catch (error: any) {
      Alert.alert("Error Joining Chat", error.message || "Could not join the event chat.");
      console.error("Error joining event chat:", error);
      checkEventMembership();
    } finally {
      setIsLoadingMembership(false);
    }
  };

  const handleViewEventChat = () => {
    if (eventGroupInfo.groupId && eventGroupInfo.groupName) {
      navigation.navigate('MessagesTab', {
        screen: 'Conversation',
        params: {
          groupId: eventGroupInfo.groupId,
          groupName: eventGroupInfo.groupName,
          isGroupChat: true,
          eventId: eventDetails.id
        }
      });
    } else {
      Alert.alert("Error", "Group chat details not found. Try rejoining.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>{"‹"}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>{eventDetails.title}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.emoji}>📅</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{eventDetails.date}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.emoji}>🕒</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Time:</Text>
              <Text style={styles.infoValue}>{eventDetails.time}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.emoji}>📍</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text 
                style={[styles.infoValue, styles.linkText]}
                onPress={openMap}
              >
                {eventDetails.address}
              </Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About the Event</Text>
            <Text style={styles.description}>{eventDetails.description}</Text>
          </View>
          
          {isLoadingMembership ? (
            <ActivityIndicator color="#9C27B0" style={{ marginVertical: 10 }} />
          ) : eventGroupInfo.isMember ? (
            <TouchableOpacity onPress={handleViewEventChat} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>View Event Chat</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleJoinEventChat} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Join Event Chat</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={handleRegister} style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Register for Event (External)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButtonText: {
    fontSize: 28,
    color: '#333',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  emoji: {
    fontSize: 24,
    marginRight: 10,
    width: 30,
    textAlign: 'center',
  },
  infoTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    marginTop: 3,
  },
  linkText: {
    color: '#3366BB',
    textDecorationLine: 'underline',
  },
  section: {
    marginTop: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  actionButton: {
    backgroundColor: '#8E44AD',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});