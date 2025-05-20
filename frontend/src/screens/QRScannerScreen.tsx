import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Linking } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { useNavigation } from '@react-navigation/native';

export const QRScannerScreen: React.FC = () => {
  const navigation = useNavigation();

  const onSuccess = async (e: { data: string }) => {
    const scannedUrl = e.data;
    // Check if the URL is a valid http/https URL
    if (scannedUrl && (scannedUrl.startsWith('http://') || scannedUrl.startsWith('https://'))) {
      try {
        // Attempt to open the URL in the system browser
        const supported = await Linking.canOpenURL(scannedUrl);
        if (supported) {
          await Linking.openURL(scannedUrl);
          // Optionally navigate back or to a different screen in the app after opening
          // navigation.goBack(); 
        } else {
          Alert.alert('Invalid URL', `Cannot open this URL: ${scannedUrl}`);
        }
      } catch (error) {
        console.error('Error opening URL:', error);
        Alert.alert('Error', 'Could not open the scanned QR code.');
      }
    } else {
      Alert.alert('Invalid QR Code', 'This QR code does not contain a valid web link.');
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
