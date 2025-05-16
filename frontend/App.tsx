import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { View } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={{
        frame: { x: 0, y: 0, width: 0, height: 0 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 }
      }}>
        <RootNavigator />
      </SafeAreaProvider>
    </View>
  );
}