import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { NewsDetailScreenProps } from '../navigation/types';

export const NewsDetailScreen: React.FC<NewsDetailScreenProps> = ({ route, navigation }) => {
  const { article } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>{"‹"}</Text>
          </TouchableOpacity>
        </View>
      
        <Image 
          source={{ uri: article.imageUrl }} 
          style={styles.heroImage} 
          resizeMode="cover"
        />
        
        <View style={styles.content}>
          <Text style={styles.title}>{article.title}</Text>
          
          <Text style={styles.articleBody}>
            {article.content.split('\n\n').map((paragraph, index) => (
              <Text key={index} style={styles.paragraph}>
                {paragraph}
                {index < article.content.split('\n\n').length - 1 ? '\n\n' : ''}
              </Text>
            ))}
          </Text>
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
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#333',
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  articleBody: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  paragraph: {
    marginBottom: 15,
  },
});
