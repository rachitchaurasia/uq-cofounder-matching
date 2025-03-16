import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";


import crossIcon from "../assets/cross.png"; // Make sure the cross icon is clear

export const NameScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // State for user input
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressFill} />
      </View>

      {/* Cross Button */}
      <TouchableOpacity style={styles.crossButton} onPress={() => navigation.navigate("SignIn")}>
        <Image source={crossIcon} style={styles.crossIcon} />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Let's Start with your Name</Text>

      {/* First Name Input */}
      <TextInput
        style={styles.input}
        placeholder="First Name"
        placeholderTextColor="#828693"
        value={firstName}
        onChangeText={setFirstName}
      />

      {/* Last Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        placeholderTextColor="#828693"
        value={lastName}
        onChangeText={setLastName}
      />

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => console.log("Navigate to Next Step")}
      >
        <Text style={styles.continueText}>CONTINUE</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  progressBarContainer: {
    position: "absolute",
    top: 46,
    width: "100%",
    height: 5,
    backgroundColor: "#d9d9d9",
  },
  progressFill: {
    width: "25%", // Adjust this dynamically as the user progresses
    height: "100%",
    backgroundColor: "#a702c8",
  },
  crossButton: {
    position: "absolute",
    top: 60,
    left: 20,
  },
  crossIcon: {
    width: 24,
    height: 24,
    tintColor: "#5d5b5d", // Ensure it's visible
  },
  title: {
    fontSize: 34,
    fontWeight: "600",
    textAlign: "center",
    color: "#010001",
    marginBottom: 20,
  },
  input: {
    width: 312,
    height: 50,
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#010001",
    marginBottom: 15,
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

export default NameScreen;
