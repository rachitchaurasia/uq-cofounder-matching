import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// Assuming RootStackParamList is defined correctly elsewhere
import { RootStackParamList } from '../navigation/types'; // Adjust path if needed

const welcomeImage = require('../assets/Saly-1.png'); // Ensure this path is correct

const { width, height } = Dimensions.get('window');

// --- Image Dimensions ---
// Use Figma dimensions to get aspect ratio
const FIGMA_IMAGE_WIDTH = 465.04;
const FIGMA_IMAGE_HEIGHT = 328.7;
const IMAGE_ASPECT_RATIO = FIGMA_IMAGE_WIDTH / FIGMA_IMAGE_HEIGHT; // ~1.4148

// Define image width relative to screen width
const IMAGE_WIDTH = width * 1.35; // Let image take up 90% of screen width
// Calculate height based on aspect ratio
const IMAGE_HEIGHT = IMAGE_WIDTH / IMAGE_ASPECT_RATIO;

// --- Image Position & Rotation ---
// Use Figma values for rotation
const IMAGE_ROTATION = '15.51deg';

// Approximate vertical positioning. Figma Y=293.34 might be too specific.
const IMAGE_TOP_OFFSET = height * 0.35;

export const WelcomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleContinue = () => {
    console.log('Navigate to Welcome screen');
    navigation.navigate('MainApp'); // Example navigation target
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Welcome Text */}
      <Animated.Text
        style={[
          styles.title,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        Welcome To{'\n'}CO-FOUNDER{'\n'}MATCHER
      </Animated.Text>

      {/* Image - Positioned absolutely, centered, and rotated */}
      {/* Apply styles directly combining static and dynamic values */}
      <Image
        source={welcomeImage}
        style={[ // Use array style notation for easier combination
          styles.imageBasic, // Basic styles like position, resizeMode
          { // Apply calculated/fixed values
            width: IMAGE_WIDTH,
            height: IMAGE_HEIGHT,
            top: IMAGE_TOP_OFFSET, // Use calculated top offset
            // Centering technique for absolute position:
            left: '50%',             // Position left edge at the center
            marginLeft: -(IMAGE_WIDTH / 2), // Shift left by half its width
            transform: [             // Apply rotation
              { rotate: IMAGE_ROTATION }
            ]
          }
        ]}
      />

      {/* Continue Button */}
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>CONTINUE</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A702C8', // Purple background
    alignItems: 'center',      // Centers non-absolutely positioned children (like Button)
    justifyContent: 'space-between', // Push title up, button down
    paddingBottom: 50,         // Padding at the bottom
    paddingTop: height * 0.1,  // Push title down slightly
  },
  title: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 44,
    marginTop: 20, // Add some top margin if needed below the safe area/paddingTop
  },
  // Split image styles for clarity
  imageBasic: {
    position: 'absolute',    // Essential for top/left positioning
    resizeMode: 'contain',
    // width, height, top, left, marginLeft, transform are applied inline above
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    marginBottom: 20, // Add some margin if needed above paddingBottom
  },
  buttonText: {
    color: '#A702C8',
    fontSize: 18,
    fontWeight: 'bold',
  },
});