import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { updateProfile } from "../api/profile";

import crossIcon from "../assets/cross.png";

export const NameScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // State for user input
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [formErrors, setFormErrors] = useState<{ firstName?: string; lastName?: string }>({});
  const [loading, setLoading] = useState(false);

  // Function to validate form
  const validateForm = () => {
    let errors = {};
    if (!firstName.trim()) {
      errors = { ...errors, firstName: "First name is required" };
    }
    if (!lastName.trim()) {
      errors = { ...errors, lastName: "Last name is required" };
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Function to handle continue button press
  const handleContinue = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      // We need to update the nested 'user' object for first/last name
      const payload = {
        user: {
          first_name: firstName.trim(),
          last_name: lastName.trim()
        }
      };
      const success = await updateProfile(payload);

      if (success) {
        navigation.navigate("Role");
      }
    } catch (error: any) {
      console.error("Failed to save name:", error);
      Alert.alert("Save Failed", error.message || "Could not save your name. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#828693"
          value={firstName}
          onChangeText={setFirstName}
          editable={!loading}
        />
        {formErrors.firstName && <Text style={styles.errorText}>{formErrors.firstName}</Text>}
      </View>

      {/* Last Name Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#828693" 
          value={lastName}
          onChangeText={setLastName}
          editable={!loading}
        />
        {formErrors.lastName && <Text style={styles.errorText}>{formErrors.lastName}</Text>}
      </View>

      {/* Continue Button */}
      {loading ? (
        <ActivityIndicator size="large" color="#a702c8" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity
          style={[styles.continueButton, (!firstName.trim() || !lastName.trim()) && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!firstName.trim() || !lastName.trim() || loading}
        >
          <Text style={styles.continueText}>CONTINUE</Text>
        </TouchableOpacity>
      )}
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
    width: "25%",
    height: "100%",
    backgroundColor: "#a702c8",
  },
  crossButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 1,
  },
  crossIcon: {
    width: 24,
    height: 24,
    tintColor: "#5d5b5d",
  },
  title: {
    fontSize: 34,
    fontWeight: "600",
    textAlign: "center",
    color: "#010001",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: 312,
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#010001",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
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
  disabledButton: {
    backgroundColor: "#cccccc",
  },
});

export default NameScreen;