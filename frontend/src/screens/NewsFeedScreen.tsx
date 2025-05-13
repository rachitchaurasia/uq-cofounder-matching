import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, BottomTabParamList, NewsArticle } from '../navigation/types';
import { SAMPLE_NEWS_ARTICLES, NEWS_CATEGORIES } from '../data/sampleData';

const { width: screenWidth } = Dimensions.get('window');

// Define a composite prop type
type NewsFeedScreenNavigationProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const NewsFeedScreen: React.FC<NewsFeedScreenNavigationProps> = ({ navigation }) => {
  const tw = useTailwind();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const featuredArticles = useMemo(() => SAMPLE_NEWS_ARTICLES.slice(0, 2), []);
  const otherArticles = useMemo(() => SAMPLE_NEWS_ARTICLES.slice(featuredArticles.length), [featuredArticles.length]);

  const filteredArticles = useMemo(() => {
    return otherArticles
      .filter(article =>
        selectedCategory === 'All' ? true : article.category === selectedCategory
      )
      .filter(article =>
        article.title.toLowerCase().includes(searchText.toLowerCase()) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(searchText.toLowerCase()))
      );
  }, [searchText, selectedCategory, otherArticles]);

  const handleSearch = () => {
    console.log('Searching for:', searchText);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{"‹"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>News & Events</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Image source={require('../assets/search-button.png')} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search News..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {NEWS_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryPill,
                selectedCategory === category ? styles.categoryPillSelected : null
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text 
                style={[
                  styles.categoryText,
                  selectedCategory === category ? styles.categoryTextSelected : null
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.latestNewsHeader}>
        <Text style={styles.latestNewsTitle}>Latest News & Events</Text>
      </View>
      
      <ScrollView>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.featuredCardsContainer}
        >
          {featuredArticles.map((article, index) => (
            <TouchableOpacity
              key={`featured-${article.id}`}
              style={styles.featuredCard}
              onPress={() => {
                const parentNavigator = navigation.getParent<NativeStackScreenProps<RootStackParamList>['navigation']>();
                if (parentNavigator) {
                  parentNavigator.navigate('NewsDetail', { article });
                }
              }}
            >
              <Image 
                source={{ uri: article.thumbnailUrl }} 
                style={styles.featuredImage} 
              />
              <View style={styles.featuredCardContent}>
                <Text style={styles.featuredTitle} numberOfLines={2}>
                  {article.title}
                </Text>
                <View style={styles.authorRow}>
                  <Image 
                    source={require('../assets/profile-button.png')} 
                    style={styles.authorIcon} 
                  />
                  <Text style={styles.authorText}>
                    {article.author} • {article.date}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <View style={styles.listContainer}>
          <FlatList
            data={filteredArticles}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.articleCard}
                onPress={() => {
                  const parentNavigator = navigation.getParent<NativeStackScreenProps<RootStackParamList>['navigation']>();
                  if (parentNavigator) {
                    parentNavigator.navigate('NewsDetail', { article: item });
                  }
                }}
              >
                <View style={styles.articleCardContent}>
                  <Text style={styles.articleCategory}>{item.category}</Text>
                  <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.articleMeta}>
                    <Text style={styles.articleAuthor}>{item.author}</Text>
                    <Text style={styles.articleDate}>{item.date}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No articles found</Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  backButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#999',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#9c27b0', // Purple to match design
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonArrow: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryContainer: {
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 6,
    backgroundColor: '#eee',
  },
  categoryPillSelected: {
    backgroundColor: '#9c27b0', // Purple when selected
  },
  categoryText: {
    fontSize: 14,
    color: '#555',
  },
  categoryTextSelected: {
    color: 'white',
    fontWeight: '500',
  },
  latestNewsHeader: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  latestNewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  featuredCardsContainer: {
    paddingLeft: 15,
  },
  featuredCard: {
    width: screenWidth * 0.75,
    height: 200,
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredImage: {
    width: '100%',
    height: 120,
  },
  featuredCardContent: {
    padding: 12,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
    tintColor: '#666',
  },
  authorText: {
    fontSize: 12,
    color: '#666',
  },
  listContainer: {
    padding: 15,
  },
  articleCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  articleCardContent: {
    
  },
  articleCategory: {
    fontSize: 12,
    color: '#9c27b0',
    textTransform: 'uppercase',
    fontWeight: '500',
    marginBottom: 4,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  articleAuthor: {
    fontSize: 12,
    color: '#666',
  },
  articleDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});