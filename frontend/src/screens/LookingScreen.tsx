import React, { useState, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, Keyboard } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types"; // Adjust path if needed

const backIcon = require("../assets/back-button.png"); // Assuming same back icon

// Initial list based on the image
const INITIAL_LOOKING_FOR = [
  "Job Opportunities", "Learning", "feedback on my product", "mentoring others",
  "Looking for a mentor", "founder role", "designer", "developer", "seed funding",
  "meet angel investors", "Advisor", "Raising soon, just networking", "Beta Testers"
];

// Pre-selected items based on the image
const PRE_SELECTED_LOOKING_FOR = ["meet angel investors", "Beta Testers"];

export const LookingScreen = () => { // Renamed component
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // State for all available items
  const [availableItems, setAvailableItems] = useState<string[]>(INITIAL_LOOKING_FOR);
  // State for selected items
  const [selectedItems, setSelectedItems] = useState<string[]>(PRE_SELECTED_LOOKING_FOR);
  // State for the input field text
  const [newItemText, setNewItemText] = useState<string>("");
  // State to control the visibility/mode of the input area
  const [isAddingItem, setIsAddingItem] = useState<boolean>(false);

  const toggleItem = (item: string) => {
    setSelectedItems((prevSelected) => {
      const newSelected = prevSelected.includes(item)
        ? prevSelected.filter((i) => i !== item)
        : [...prevSelected, item];
      return newSelected;
    });
  };

  const handleAddItem = () => {
    const trimmedItem = newItemText.trim();
    if (trimmedItem && !availableItems.map(i => i.toLowerCase()).includes(trimmedItem.toLowerCase())) {
      setAvailableItems(prevAvailable => [...prevAvailable, trimmedItem]);
      toggleItem(trimmedItem); // Optionally select the newly added item
    }
    setNewItemText("");
    setIsAddingItem(false);
    Keyboard.dismiss();
  };

  const handleContinue = () => {
    console.log("Selected Looking For:", selectedItems);
    console.log("Available Looking For:", availableItems);
    // TODO: Navigate to the FINAL screen (e.g., Home, Dashboard, Profile Creation)
    // navigation.navigate('Home');
    console.log("Navigate to final screen (implement navigation)");
  };

  const handleSkip = () => {
    console.log("Skipped Looking For selection");
    // TODO: Navigate to the FINAL screen
    // navigation.navigate('Home');
     console.log("Navigate to final screen (implement navigation)");
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
            onPress={handleGoBack} // Use custom back handler if needed
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
          {/* Title */}
          <Text style={styles.title}>I am looking for?</Text> 

          {/* --- Add Item Input Area --- */}
          {!isAddingItem ? (
            <View style={styles.addItemInputContainer}>
              <TextInput
                style={styles.addItemInput}
                placeholder="I AM LOOKING FOR..." // Updated placeholder
                placeholderTextColor="#B0B0B0"
                onFocus={() => setIsAddingItem(true)} 
                value={newItemText}
                onChangeText={setNewItemText}
              />
               {/* Button integrated with input field */}
              <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.addItemInputContainer, styles.addItemInputContainerActive]}>
              <TextInput
                style={styles.addItemInput}
                placeholder="I AM LOOKING FOR..."
                placeholderTextColor="#B0B0B0"
                value={newItemText}
                onChangeText={setNewItemText}
                onSubmitEditing={handleAddItem}
                autoFocus={true}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* --- Item Chips --- */}
          {/* Comment out this block */}
          <View style={styles.itemsContainer}>
            {availableItems.map((item) => {
                const isSelected = selectedItems.includes(item);
            return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.itemChip,
                    isSelected ? styles.itemChipSelected : styles.itemChipUnselected,
                    ]}
                  onPress={() => toggleItem(item)}
                >
                  <Text style={[
                    styles.itemText,
                    isSelected ? styles.itemTextSelected : styles.itemTextUnselected,
                  ]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* --- Footer Button --- */}
        <View style={styles.footer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueText}>CONTINUE</Text>
            </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// --- Styles --- (Adapted from Interests.tsx/WorkingScreen.tsx)
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
    paddingHorizontal: 0,
    height: 80,
  },
  progressBarContainer: {
    position: "absolute",
    top: 46,
    left: 0,
    right: 0,
    width: "100%",
    height: 5,
    backgroundColor: "#d9d9d9",
  },
  progressFill: {
    width: "100%", // Progress complete (or adjust if there are more steps)
    height: "100%",
    backgroundColor: "#a702c8",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    padding: 5,
    zIndex: 1,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  skipButton: { // Keep Skip button
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
  scrollView: {
      flex: 1,
      marginTop: 20,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40, // Increase padding to push content below header
    paddingBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#010001",
    marginBottom: 30, // Increased space after title
    alignSelf: 'flex-start',
  },
  // Removed Subtitle style
  // Input Area Styles - Modified to look like the reference image
  addItemInputContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 50,
    marginBottom: 25, // Increased space after input
    alignItems: 'center',
    backgroundColor: '#F0F0F0', // Light grey background
    borderColor: '#E0E0E0', // Light grey border
    borderWidth: 1,
    borderRadius: 25, // Rounded corners
    paddingLeft: 20, // Indent placeholder text
    paddingRight: 10, // Space for Add button
  },
  addItemInputContainerActive: { // Optional style for when focused
      borderColor: '#a702c8',
      backgroundColor: 'white',
  },
  addItemInput: {
    flex: 1,
    fontSize: 16,
    color: '#010001', // Color for typed text
    fontWeight: '500',
  },
  addButton: { // Style for the integrated Add button
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: '#E8E8E8', // Slightly darker grey for button
    borderRadius: 15,
  },
  addButtonText: {
    color: '#A0A0A0', // Muted text color for Add button
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Item Chips styles
  itemsContainer: { // Renamed
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: '100%',
    marginBottom: 'auto', // Push chips up and footer down
  },
  itemChip: { // Renamed
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  itemChipUnselected: { // Renamed
    backgroundColor: "white",
    borderColor: "#E0E0E0",
  },
  itemChipSelected: { // Renamed
    backgroundColor: "white",
    borderColor: "#a702c8",
  },
  itemText: { // Renamed
    fontSize: 14,
    fontWeight: "500",
  },
  itemTextUnselected: { // Renamed
    color: "#828693",
  },
  itemTextSelected: { // Renamed
    color: "#a702c8",
  },
  // Removed Add Later button styles
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