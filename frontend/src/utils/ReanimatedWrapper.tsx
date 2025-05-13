import React from 'react';
import { Platform } from 'react-native';

// Conditionally wrap components that use Reanimated
export const ReanimatedSafeView: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // On web, we'll just render children directly, bypassing Reanimated
  if (Platform.OS === 'web') {
    return <>{children}</>;
  }
  
  // On mobile, we'll try to use Reanimated properly
  try {
    // Dynamically import to prevent web errors
    const Animated = require('react-native-reanimated').default;
    return <Animated.View style={{ flex: 1 }}>{children}</Animated.View>;
  } catch (e) {
    console.warn('Reanimated not available, falling back to normal rendering');
    return <>{children}</>;
  }
}; 