import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface ProfileQRCodeProps {
  userId: string;
  size?: number;
}

export const ProfileQRCode: React.FC<ProfileQRCodeProps> = ({ userId, size = 200 }) => {
  // IMPORTANT: Replace this with your actual deployed GitHub Pages URL or custom domain
  // Example for GitHub Pages: const profileUrl = `https://your-username.github.io/your-repository-name/profile.html?userId=${userId}`;
  // Example for custom domain: const profileUrl = `https://yourcustomdomain.com/profile.html?userId=${userId}`;
  const profileUrl = `https://your-username.github.io/your-repo/profile.html?userId=${userId}`;
  
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
