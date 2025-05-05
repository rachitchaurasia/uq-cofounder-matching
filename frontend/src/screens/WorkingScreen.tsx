import React, { useState, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, Keyboard, ActivityIndicator, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { updateProfile } from "../api/profile";

const backIcon = require("../assets/back-button.png"); 

// Initial fields/topics list based on the image
const INITIAL_FIELDS = [
    "AI", "Machine Learning", "Healthcare", "Climate change", "Energy",
    "Heavy Metal", "House Parties", "Beverage", "Health", "Meditation", "Music", "Food",
    "Hockey", "Basketball", "Property", "Home Workout",
    "Theater", "Cafe Hopping", "Mining", "Sport"
];

// Pre-selected fields based on the image
const PRE_SELECTED_FIELDS = ["Hockey", "Home Workout"];

export const WorkingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // State for all available fields (including user-added)
  const [availableFields, setAvailableFields] = useState<string[]>(INITIAL_FIELDS);
  // State for selected fields
  const [selectedFields, setSelectedFields] = useState<string[]>(PRE_SELECTED_FIELDS);
  // State for the input field text
  const [newFieldText, setNewFieldText] = useState<string>("");
  // State to control the visibility/mode of the input area
  const [isAddingField, setIsAddingField] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const toggleField = (field: string) => {
    setSelectedFields((prevSelected) => {
      const newSelected = prevSelected.includes(field)
        ? prevSelected.filter((item) => item !== field)
        : [...prevSelected, field];
      return newSelected;
    });
  };

  const handleAddField = () => {
    const trimmedField = newFieldText.trim();
    if (trimmedField && !availableFields.map(f => f.toLowerCase()).includes(trimmedField.toLowerCase())) {
        setAvailableFields(prevAvailable => [...prevAvailable, trimmedField]);
      // Optionally select the newly added field automatically
      toggleField(trimmedField);
    }
    setNewFieldText("");
    setIsAddingField(false);
    Keyboard.dismiss();
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
        const payload = {
            startup_industries: selectedFields.join(',')
        };
        console.log("Saving Working On Fields:", payload);
        const success = await updateProfile(payload);

        if (success) {
          navigation.navigate('Offer');
        }
    } catch (error: any) {
         console.error("Failed to save working on fields:", error);
         Alert.alert("Save Failed", error.message || "Could not save what you're working on. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleSkip = () => {
    console.log("Skipped Working On selection");
    navigation.navigate('Offer');
  };

  const handleGoBack = () => {
       navigation.goBack();
   }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* --- Header Elements --- */}
        <View style={styles.header}>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressFill} />
          </View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <Image source={backIcon} style={styles.backIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipText}>SKIP</Text>
          </TouchableOpacity>
        </View>

        {/* --- Scrollable Content Area --- */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>What are you building right now?</Text>
          <Text style={styles.subtitle}>Let everyone know what you're working on in by adding it to your profile.</Text>

          {!isAddingField ? (
            <TouchableOpacity
              style={styles.addFieldsButton}
              onPress={() => setIsAddingField(true)}
            >
              <Text style={styles.addFieldsText}>ADD YOUR Field HERE</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.addFieldInputContainer}>
              <TextInput
                style={styles.addFieldInput}
                placeholder="Type your field..."
                placeholderTextColor="#B0B0B0"
                value={newFieldText}
                onChangeText={setNewFieldText}
                onSubmitEditing={handleAddField}
                autoFocus={true}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddField}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.fieldsContainer}>
            {availableFields.map((field) => {
              const isSelected = selectedFields.includes(field);
              return (
                <TouchableOpacity
                  key={field}
                  style={[
                    styles.fieldChip,
                    isSelected ? styles.fieldChipSelected : styles.fieldChipUnselected,
                  ]}
                  onPress={() => toggleField(field)}
                >
                  <Text style={[
                    styles.fieldText,
                    isSelected ? styles.fieldTextSelected : styles.fieldTextUnselected,
                  ]}>{field}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

        </ScrollView>

        {/* --- Footer Button --- */}
        <View style={styles.footer}>
            {loading ? (
                <ActivityIndicator size="large" color="#a702c8" style={{height: 50}}/>
            ) : (
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleContinue}
                >
                  <Text style={styles.continueText}>CONTINUE</Text>
                </TouchableOpacity>
            )}
        </View>
      </View>
    </SafeAreaView>
  );
};

// --- Styles --- (Copied from Expertise.tsx, renamed where appropriate, adjusted progress, added Add Later)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 0, // No horizontal padding for progress bar full width
    height: 80, // Ensure header has enough height for absolute positioned elements
  },
  progressBarContainer: {
    position: "absolute", // Use absolute positioning
    top: 46,
    left: 0,
    right: 0,
    width: "100%",
    height: 5,
    backgroundColor: "#d9d9d9",
  },
  progressFill: {
    width: "90%", // Progress almost complete
    height: "100%",
    backgroundColor: "#a702c8",
  },
  backButton: {
    position: "absolute",
    top: 60, // Consistent placement
    left: 20,
    padding: 5,
    zIndex: 1, // Ensure button is clickable over other elements if needed
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  // Removed Skip Button styles
  scrollView: {
      flex: 1,
      marginTop: 20, // Reduced margin now that skip button is gone
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20, // Reduced top padding
    paddingBottom: 20, // Space above footer
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#010001",
    marginBottom: 15,
    alignSelf: 'flex-start', // Align title left
    textAlign: 'left', // Explicitly left align
  },
  subtitle: {
    fontSize: 16,
    color: "#828693",
    marginBottom: 25,
    alignSelf: 'flex-start',
  },
  addFieldsButton: {
    width: '100%',
    height: 50,
    backgroundColor: "#F0F0F0",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addFieldsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#828693",
  },
  addFieldInputContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 50,
    marginBottom: 20,
    alignItems: 'center',
    borderColor: '#a702c8',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  addFieldInput: {
    flex: 1,
    fontSize: 16,
    color: '#010001',
  },
  addButton: {
    marginLeft: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#a702c8',
    borderRadius: 15,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: 20,
    padding: 10,
    zIndex: 1,
  },
  skipText: {
    fontSize: 16,
    color: "#B0B0B0",
    fontWeight: "500",
  },
  fieldsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: '100%',
    marginBottom: 20,
  },
  fieldChip: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  fieldChipUnselected: {
    backgroundColor: "white",
    borderColor: "#E0E0E0",
  },
  fieldChipSelected: {
    backgroundColor: "white",
    borderColor: "#a702c8",
  },
  fieldText: {
    fontSize: 14,
    fontWeight: "500",
  },
  fieldTextUnselected: {
    color: "#828693",
  },
  fieldTextSelected: {
    color: "#a702c8",
  },
  // Styles for the "Add Later" button
  addLaterButton: {
      width: '100%',
      maxWidth: 312, // Consistent width
      height: 50,
      backgroundColor: "#F0F0F0", // Light grey background like the image
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20, // Space before the main Continue button
      borderWidth: 1,
      borderColor: '#E0E0E0',
      alignSelf: 'center',
  },
  addLaterText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#828693", // Grey text like the image
  },
  footer: {
      paddingVertical: 20,
      paddingHorizontal: 20,
      backgroundColor: 'white',
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
  },
  continueButton: {
    width: '100%',
    maxWidth: 312,
    height: 50,
    backgroundColor: "#a702c8",
    borderRadius: 67,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: 'center',
  },
  continueText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
