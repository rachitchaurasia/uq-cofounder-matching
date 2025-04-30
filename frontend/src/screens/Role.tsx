import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import CheckBox from 'expo-checkbox'; // Using expo-checkbox

const backIcon = require("../assets/back-button.png");

// Define the roles and their emojis
const ROLES_WITH_EMOJIS = [
  { name: "CO-FOUNDER", emoji: "🧱" },
  { name: "INVESTOR", emoji: "💼" },
  { name: "ENTREPRENEUR", emoji: "🧠" },
  { name: "DEVELOPER", emoji: "👨‍💻" }, // Using person coder emoji
  { name: "STARTUP", emoji: "🚀" }, // Added STARTUP
];

export const Role = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  // Default to first role's name
  const [selectedRole, setSelectedRole] = useState<string | null>(ROLES_WITH_EMOJIS[0].name);
  const [showRoleOnProfile, setShowRoleOnProfile] = useState<boolean>(false);

  const handleContinue = () => {
    console.log("Selected Role:", selectedRole);
    console.log("Show on Profile:", showRoleOnProfile);
    if (selectedRole === "STARTUP") {
      // Navigate directly to the 'Working' screen if STARTUP is selected
      navigation.navigate('Working'); // Ensure 'Working' is defined in RootStackParamList later
    } else {
      // Otherwise, navigate to the 'Expertise' screen
      navigation.navigate('Expertise');
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressFill} />
      </View>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Image source={backIcon} style={styles.backIcon} />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>I am a ....</Text>

      {/* Role Buttons */}
      <View style={styles.roleButtonsContainer}>
        {ROLES_WITH_EMOJIS.map(({ name, emoji }) => ( // Destructure name and emoji
          <TouchableOpacity
            key={name}
            style={[
              styles.roleButton,
              selectedRole === name ? styles.roleButtonSelected : styles.roleButtonUnselected,
            ]}
            onPress={() => setSelectedRole(name)}
          >
            {/* Container for Text and Emoji */}
            <View style={styles.roleButtonContent}>
               <Text style={[
                styles.roleButtonText,
                selectedRole === name ? styles.roleButtonTextSelected : styles.roleButtonTextUnselected,
               ]}>{name}</Text>
               {/* Emoji */}
               <Text style={styles.emojiText}>{emoji}</Text>
            </View>

            {/* Help Icon */}
            {name === ROLES_WITH_EMOJIS[0].name && (
              <View style={styles.helpIconContainer}>
                <TouchableOpacity style={styles.helpIcon}>
                  <Text style={styles.helpText}>?</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Checkbox */}
      <View style={styles.checkboxContainer}>
        <CheckBox
          value={showRoleOnProfile}
          onValueChange={setShowRoleOnProfile}
          style={styles.checkbox}
          color={showRoleOnProfile ? '#A702C8' : undefined}
        />
        <Text style={styles.checkboxLabel}>Show my role on my profile</Text>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleContinue}
      >
        <Text style={styles.continueText}>CONTINUE</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center"
  },
  progressBarContainer: {
    position: "absolute",
    top: 46,
    width: "100%",
    height: 5,
    backgroundColor: "#d9d9d9",
  },
  progressFill: {
    width: "50%",
    height: "100%",
    backgroundColor: "#a702c8",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    padding: 5,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 34,
    fontWeight: "600",
    textAlign: "center",
    color: "#010001",
    marginBottom: 30,
  },
  roleButtonsContainer: {
    width: 312,
    marginBottom: 15,
  },
  roleButton: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    marginBottom: 15,
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
    borderWidth: 1,
    position: "relative",
  },
  // New style for the inner View containing text and emoji
  roleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleButtonUnselected: {
    borderColor: "#d9d9d9",
    backgroundColor: 'white',
  },
  roleButtonSelected: {
    borderColor: "#a702c8",
    backgroundColor: 'rgba(167, 2, 200, 0.05)',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8, // Add space between text and emoji
  },
  // New style for the emoji text
  emojiText: {
    fontSize: 16, // Match text size or adjust as needed
  },
  roleButtonTextUnselected: {
    color: "#828693",
  },
  roleButtonTextSelected: {
    color: "#a702c8",
  },
  helpIconContainer: {
    position: 'absolute',
    right: 7,
    top: '50%',
    transform: [{ translateY: -53 }], // Adjust this value if vertical alignment is off
  },
  helpIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D3D3D3",
  },
  helpText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#808080",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 312,
    marginBottom: 15,
    marginTop: 5,
  },
  checkbox: {
    width: 18,
    height: 18,
    marginRight: 10,
    borderRadius: 3,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#010001",
  },
  continueButton: {
    width: 312,
    height: 50,
    backgroundColor: "#a702c8",
    borderRadius: 67,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  continueText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});