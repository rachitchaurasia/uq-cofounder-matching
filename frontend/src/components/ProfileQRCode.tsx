import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface ProfileQRCodeProps {
  userId: string;
  size?: number;
}

export const ProfileQRCode: React.FC<ProfileQRCodeProps> = ({ userId, size = 200 }) => {
  // Create a URL to your profile
  const profileUrl = `https://your-app-domain.com/profile/${userId}`;
  
  return (
    <View style={styles.container}>
      <QRCode
        value={profileUrl}
        size={size}
        color="#000"
        backgroundColor="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});
