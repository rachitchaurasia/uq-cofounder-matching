import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import vector5 from "../assets/back-button.png"; // Updated to PNG

const { width } = Dimensions.get("window");

export const Role = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Name")}
        >
          <Image source={vector5} style={styles.vectorImage} />
        </TouchableOpacity>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressFill} />
        </View>

        <Text style={styles.mainText}>
          I am a
        </Text>

        <View style={styles.roleButtonsContainer}>
          {["CO-FOUNDER", "INVESTOR", "ENTREPRENEUR"].map((role) => (
            <TouchableOpacity
              key={role}
              style={[styles.roleButton, pressedButton === role && styles.roleButtonPressed]}
              onPressIn={() => setPressedButton(role)}
              onPressOut={() => setPressedButton(null)}
              onPress={() => console.log(`Selected: ${role}`)}
            >
              <Text style={styles.roleButtonText}>{role}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.genderToggle}>
          <Text style={styles.genderText}>Show my gender on my profile</Text>
          <View style={styles.toggleSwitch} />
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={() => console.log("Navigate to Next Step")}>
          <Text style={styles.continueText}>CONTINUE</Text>
        </TouchableOpacity>

        <View style={styles.helpIcon}>
          <Text style={styles.helpText}>?</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    width: 393,
    height: 850,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
  },
  vectorImage: {
    width: 24,
    height: 24,
  },
  progressBarContainer: {
    position: "absolute",
    top: 46,
    width: "100%",
    height: 5,
    backgroundColor: "#d9d9d9",
  },
  progressFill: {
    width: "50%", // Adjust as needed
    height: "100%",
    backgroundColor: "#a702c8",
  },
  mainText: {
    position: "absolute",
    top: 82,
    left: 82,
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    fontSize: 38.3,
    lineHeight: 53.6,
    letterSpacing: 1.91,
    color: "#010001",
  },
  roleButtonsContainer: {
    position: "absolute",
    top: 226,
    left: 10,
    width: 312,
  },
  roleButton: {
    width: "100%",
    height: 50,
    borderRadius: 67.18,
    borderWidth: 2,
    borderColor: "#C6C5C7",
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  roleButtonPressed: {
    backgroundColor: "#f0f0f0",
  },
  roleButtonText: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    fontSize: 18.1,
    color: "#C6C5C7",
  },
  genderToggle: {
    position: "absolute",
    top: 694,
    left: 94,
    flexDirection: "row",
    alignItems: "center",
  },
  genderText: {
    fontFamily: "Inter-Regular",
    fontSize: 13,
    color: "#1E1E24",
    letterSpacing: 0.58,
    lineHeight: 17.1,
  },
  toggleSwitch: {
    width: 20,
    height: 20,
    borderRadius: 3,
    border: 1,
    borderColor: "black",
    marginLeft: 10,
  },
  continueButton: {
    position: "absolute",
    bottom: 40,
    width: 312,
    height: 50,
    backgroundColor: "#A702C8",
    borderRadius: 67.18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  continueText: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    fontSize: 18.1,
    color: "white",
  },
  helpIcon: {
    position: "absolute",
    top: 189,
    right: 20,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C6C5C7",
  },
  helpText: {
    fontSize: 18.1,
    fontWeight: "600",
    color: "black",
  },
});