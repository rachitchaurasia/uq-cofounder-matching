import React from 'react';
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
} from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { EventsTabScreenProps } from '../navigation/types';

export const NetworkingEventScreen: React.FC<EventsTabScreenProps> = ({ navigation }) => {
  const tw = useTailwind();

  const eventDetails = {
    title: 'UQ Ventures Networking Night',
    date: 'Thursday, 25th July 2024',
    time: '6:00 PM - 8:00 PM',
    address: 'GCI Building 20, University of Queensland, St Lucia, QLD 4067',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=GCI+Building+20+University+of+Queensland+St+Lucia',
    description:
      "Join us for an exciting evening of networking with fellow innovators, entrepreneurs, mentors, and investors from the UQ Ventures community. This is a fantastic opportunity to connect, share ideas, and potentially find your next collaborator or co-founder. Refreshments will be provided.",
  };

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

  // Simplified rendering to match the minimalist design in the image
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
          
          <TouchableOpacity onPress={handleRegister} style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Register for Event</Text>
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
  registerButton: {
    backgroundColor: '#9C27B0', // Purple to match design
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