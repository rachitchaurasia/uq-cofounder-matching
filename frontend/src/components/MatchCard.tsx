import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

type MatchCardProps = {
  user: {
    id: string;
    name: string;
    position: string;
    interests: string;
    imageUrl?: string;
    score?: number;
  };
  onConnect: () => void;
  onViewProfile: () => void;
};

export const MatchCard: React.FC<MatchCardProps> = ({ user, onConnect, onViewProfile }) => {
  // Display score as percentage if available
  const matchScore = user.score ? Math.round(user.score * 100) : null;
  
  return (
    <View style={styles.card}>
      <Image 
        source={user.imageUrl ? { uri: user.imageUrl } : require('../assets/default-avatar.png')} 
        style={styles.profileImage}
        resizeMode="cover"
      />
      
      <View style={styles.header}>
        <Text style={styles.name}>{user.name}</Text>
        {matchScore && (
          <Text style={styles.score}>{matchScore}% Match</Text>
        )}
      </View>
      
      <Text style={styles.position}>Looking for a {user.position}</Text>
      <Text style={styles.interests}>{user.interests}</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.connectButton]}
          onPress={onConnect}
        >
          <Text style={styles.connectButtonText}>Connect</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.viewProfileButton]}
          onPress={onViewProfile}
        >
          <Text style={styles.viewProfileButtonText}>View Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImage: {
    width: 160,
    height: 160,
    borderRadius: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    width: '100%',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  position: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  interests: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  button: {
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    minWidth: 120,
    marginHorizontal: 5,
  },
  connectButton: {
    backgroundColor: '#a702c8',
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  viewProfileButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  viewProfileButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
}); 