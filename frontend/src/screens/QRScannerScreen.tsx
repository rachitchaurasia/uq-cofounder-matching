import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { useNavigation } from '@react-navigation/native';

export const QRScannerScreen: React.FC = () => {
  const navigation = useNavigation();

  const onSuccess = (e: { data: string }) => {
    // Parse the scanned URL
    try {
      const url = new URL(e.data);
      const pathSegments = url.pathname.split('/');
      const userId = pathSegments[pathSegments.length - 1];
      
      // Navigate to profile screen with the scanned userId
      navigation.navigate('Profile', { userId });
    } catch (error) {
      Alert.alert('Invalid QR Code', 'This QR code does not contain a valid profile.');
    }
  };

  return (
    <QRCodeScanner
      onRead={onSuccess}
      flashMode={RNCamera.Constants.FlashMode.auto}
      topContent={
        <Text style={styles.centerText}>
          Scan a profile QR code to connect
        </Text>
      }
      bottomContent={
        <TouchableOpacity style={styles.buttonTouchable} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      }
    />
  );
};

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
});
