import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import CheckBox from 'expo-checkbox'; // Using expo-checkbox

const backIcon = require("../assets/back-button.png"); 

// Define the roles
const ROLES = ["CO-FOUNDER", "INVESTOR", "ENTREPRENEUR", "DEVELOPER"];

export const Role = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedRole, setSelectedRole] = useState<string | null>(ROLES[0]); // Default to CO-FOUNDER selected
  const [showRoleOnProfile, setShowRoleOnProfile] = useState<boolean>(false);

  const handleContinue = () => {
    // Add navigation logic or data saving here based on selectedRole and showRoleOnProfile
    console.log("Selected Role:", selectedRole);
    console.log("Show on Profile:", showRoleOnProfile);
    // navigation.navigate('NextScreen'); // Navigate to the next screen in the flow
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar - Styled like NameScreen */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressFill} />
      </View>

      {/* Back Button - Positioned like the cross in NameScreen */}
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
        {ROLES.map((role) => (
          <TouchableOpacity
            key={role}
            style={[
              styles.roleButton,
              selectedRole === role ? styles.roleButtonSelected : styles.roleButtonUnselected,
            ]}
            onPress={() => setSelectedRole(role)}
          >
            <Text style={[
              styles.roleButtonText,
              selectedRole === role ? styles.roleButtonTextSelected : styles.roleButtonTextUnselected,
            ]}>{role}</Text>
            
            {/* Help Icon - Only appears next to the first button */}
            {role === ROLES[0] && (
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
          color={showRoleOnProfile ? '#A702C8' : undefined} // Purple when checked
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
    width: "50%", // 50% for second screen in the flow (as NameScreen was 25%)
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
    width: 312, // Matching input width from NameScreen
    marginBottom: 15,
  },
  roleButton: {
    width: "100%",
    height: 50, // Match input height from NameScreen
    borderRadius: 25,
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    position: "relative", // For absolute positioning of help icon
  },
  roleButtonUnselected: {
    borderColor: "#d9d9d9", // Match border color from NameScreen inputs
    backgroundColor: 'white',
  },
  roleButtonSelected: {
    borderColor: "#a702c8", // Match purple color
    backgroundColor: 'rgba(167, 2, 200, 0.05)',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  roleButtonTextUnselected: {
    color: "#828693", // Matching placeholder color from NameScreen
  },
  roleButtonTextSelected: {
    color: "#a702c8",
  },
  helpIconContainer: {
    position: 'absolute',
    right: 7,
    top: '50%',
    transform: [{ translateY: -53 }],
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
    width: 312, // Matching width
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
    width: 312, // Matching width from NameScreen
    height: 50, // Matching height from NameScreen
    backgroundColor: "#a702c8",
    borderRadius: 67, // Matching radius from NameScreen
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