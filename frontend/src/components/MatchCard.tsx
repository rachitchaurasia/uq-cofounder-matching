import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

type MatchCardProps = {
  user: {
    id: number;
    name: string;
    position: string;
    interests: string;
    imageUrl?: string;
    score?: number;
  };
  onConnect: () => void;
};

export const MatchCard: React.FC<MatchCardProps> = ({ user, onConnect }) => {
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
      
      <TouchableOpacity 
        style={styles.connectButton}
        onPress={onConnect}
      >
        <Text style={styles.connectButtonText}>Connect</Text>
      </TouchableOpacity>
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
  connectButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 30,
    backgroundColor: '#F5F5F5',
  },
  connectButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
}); 