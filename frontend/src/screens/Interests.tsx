import React, { useState, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, Keyboard, ActivityIndicator, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { updateProfile } from "../api/profile";

const backIcon = require("../assets/back-button.png");

// Initial interests list - this might come from a configuration or API later
const INITIAL_INTERESTS = [
  "AI", "Machine Learning", "Healthcare", "Climate change", "Energy",
  "Heavy Metal", "House Parties", "Gin Tonic", "Gymnastics", "Cloud",
  "Hot Yoga", "Meditation", "Spotify", "Sushi", "Hockey", "Basketball",
  "Slam Poetry", "Home Workout", "Theater", "Cafe Hopping", "Aquarium", "Sneakers"
];

// Pre-selected interests based on the image - for initial state only
const PRE_SELECTED = ["AI", "Meditation"];

// Store component state outside if necessary, but usually useState is fine for screen state persistence within stack navigation
// let persistentAvailableInterests = [...INITIAL_INTERESTS];
// let persistentSelectedInterests = [...PRE_SELECTED];

export const Interests = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // State for all available interests (including user-added)
  const [availableInterests, setAvailableInterests] = useState<string[]>(INITIAL_INTERESTS);
  // State for selected interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>(PRE_SELECTED);
  // State for the input field text
  const [newInterestText, setNewInterestText] = useState<string>("");
  // State to control the visibility/mode of the input area
  const [isAddingInterest, setIsAddingInterest] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // --- State Persistence Handling (Optional but good practice) ---
  // Using component state directly often works fine with react-navigation's stack
  // behaviour as screens aren't always unmounted on back navigation.
  // If state loss occurs, uncomment and adapt the useFocusEffect hook below.

  // useFocusEffect(
  //   useCallback(() => {
  //     // When screen comes into focus, restore state
  //     setAvailableInterests(persistentAvailableInterests);
  //     setSelectedInterests(persistentSelectedInterests);
  //
  //     return () => {
  //       // Optional: When screen goes out of focus, save state
  //       // This can sometimes be prone to race conditions depending on navigation timing
  //       // persistentAvailableInterests = [...availableInterests];
  //       // persistentSelectedInterests = [...selectedInterests];
  //     };
  //   }, [])
  // );


  const toggleInterest = (interest: string) => {
    setSelectedInterests((prevSelected) => {
      const newSelected = prevSelected.includes(interest)
        ? prevSelected.filter((item) => item !== interest)
        : [...prevSelected, interest];
      // persistentSelectedInterests = newSelected; // Update persistent state if using useFocusEffect
      return newSelected;
    });
  };

  const handleAddInterest = () => {
    const trimmedInterest = newInterestText.trim();
    if (trimmedInterest && !availableInterests.map(i => i.toLowerCase()).includes(trimmedInterest.toLowerCase())) {
      setAvailableInterests(prevAvailable => {
          const newAvailable = [...prevAvailable, trimmedInterest];
          // persistentAvailableInterests = newAvailable; // Update persistent state
          return newAvailable;
      });
      // Optionally select the newly added interest automatically
      toggleInterest(trimmedInterest);
    }
    setNewInterestText("");
    setIsAddingInterest(false); // Hide input after adding
    Keyboard.dismiss(); // Dismiss keyboard
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
        const payload = {
            interests: selectedInterests.join(',')
        };
        console.log("Saving Interests:", payload);
        const success = await updateProfile(payload);

        if (success) {
          navigation.navigate('Looking');
        }
    } catch (error: any) {
         console.error("Failed to save interests:", error);
         Alert.alert("Save Failed", error.message || "Could not save your interests. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleSkip = () => {
    console.log("Skipped Interests selection");
    navigation.navigate('Looking');
  };

  const handleGoBack = () => {
      // Save state before going back if using the useFocusEffect approach
      // persistentAvailableInterests = [...availableInterests];
      // persistentSelectedInterests = [...selectedInterests];
      navigation.goBack();
  }

  return (
    // SafeAreaView helps avoid notches and system UI overlaps, good for mobile
    <SafeAreaView style={styles.safeArea}>
      {/* Using flexbox for layout adapts better to different screen sizes (web/mobile) */}
      <View style={styles.container}>
        {/* --- Header Elements --- */}
        <View style={styles.header}>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressFill} />
          </View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack} // Use custom back handler if needed
            disabled={loading}
          >
            <Image source={backIcon} style={styles.backIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={loading}
          >
            <Text style={styles.skipText}>SKIP</Text>
          </TouchableOpacity>
        </View>

        {/* --- Scrollable Content Area --- */}
        <ScrollView
          style={styles.scrollView} // Use flex: 1 for the scroll view
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled" // Allows tapping outside input to dismiss keyboard
        >
          <Text style={styles.title}>Interests</Text>
          <Text style={styles.subtitle}>
            Let everyone know what you're interested in by adding it to your profile.
          </Text>

          {/* --- Add Interest Input Area --- */}
          {!isAddingInterest ? (
            <TouchableOpacity
              style={styles.addInterestsButton}
              onPress={() => setIsAddingInterest(true)}
              disabled={loading}
            >
              <Text style={styles.addInterestsText}>ADD YOUR INTERESTS HERE</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.addInterestInputContainer}>
              <TextInput
                style={styles.addInterestInput}
                placeholder="Type your interest..."
                placeholderTextColor="#B0B0B0"
                value={newInterestText}
                onChangeText={setNewInterestText}
                onSubmitEditing={handleAddInterest} // Allow adding via keyboard 'return' key
                autoFocus={true} // Focus input immediately
                editable={!loading}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddInterest} disabled={loading}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* --- Interest Chips --- */}
          <View style={styles.interestsContainer}>
            {availableInterests.map((interest) => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.interestChip,
                    isSelected ? styles.interestChipSelected : styles.interestChipUnselected,
                  ]}
                  onPress={() => toggleInterest(interest)}
                  disabled={loading}
                >
                  <Text style={[
                    styles.interestText,
                    isSelected ? styles.interestTextSelected : styles.interestTextUnselected,
                  ]}>{interest}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* --- Footer Button --- */}
        {/* Keep the Continue button outside ScrollView for fixed position */}
        <View style={styles.footer}>
            {loading ? (
                <ActivityIndicator size="large" color="#a702c8" style={{height: 50}} />
            ) : (
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleContinue}
                  disabled={loading}
                >
                  <Text style={styles.continueText}>CONTINUE</Text>
                </TouchableOpacity>
            )}
        </View>
      </View>
    </SafeAreaView>
  );
};

// --- Styles --- (Minor adjustments for layout and new elements)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1, // Make container use full height
  },
  header: {
    paddingTop: 40, // Adjust as needed for status bar height
  },
  progressBarContainer: {
    position: "absolute",
    top: 46,
    width: "100%",
    height: 5,
    backgroundColor: "#d9d9d9",
  },
  progressFill: {
    width: "75%", // Progress further than Role screen
    height: "100%",
    backgroundColor: "#a702c8",
  },
  backButton: {
    position: "absolute",
    top: 60, // Consistent with Role.tsx
    left: 20,
    padding: 5,
    zIndex: 1,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
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
  scrollView: {
      flex: 1, // Allow scroll view to take up available space between header/footer
      marginTop: 60, // Space below header elements
  },
  scrollContent: {
    alignItems: "center", // Center content horizontally
    paddingHorizontal: 20, // Horizontal padding for content
    paddingTop: 40, // Space below header absolute elements
    paddingBottom: 20, // Space above footer
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#010001",
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  subtitle: {
    fontSize: 16,
    color: "#828693",
    marginBottom: 25,
    alignSelf: 'flex-start',
  },
  // Add Interest Button / Input styles
  addInterestsButton: {
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
  addInterestsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#828693",
  },
  addInterestInputContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 50,
    marginBottom: 20,
    alignItems: 'center',
    borderColor: '#a702c8', // Purple border when active
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  addInterestInput: {
    flex: 1, // Take available space
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
  // Interest Chips styles (mostly unchanged)
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start", // Align chips to the start
    width: '100%',
    marginBottom: 20,
  },
  interestChip: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10, // Add right margin for spacing
    marginBottom: 10, // Add bottom margin for spacing
    borderWidth: 1,
  },
  interestChipUnselected: {
    backgroundColor: "white",
    borderColor: "#E0E0E0",
  },
  interestChipSelected: {
    backgroundColor: "white",
    borderColor: "#a702c8",
  },
  interestText: {
    fontSize: 14,
    fontWeight: "500",
  },
  interestTextUnselected: {
    color: "#828693",
  },
  interestTextSelected: {
    color: "#a702c8",
  },
  // Footer styles
  footer: {
      paddingVertical: 20, // Add padding around the button
      paddingHorizontal: 20,
      backgroundColor: 'white', // Ensure footer background matches
      borderTopWidth: 1, // Optional: add a separator line
      borderTopColor: '#f0f0f0', // Optional: line color
  },
  continueButton: {
    // Removed absolute positioning, button is now part of the normal flow at the end
    width: '100%', // Use full width of the footer padding
    maxWidth: 312, // Keep max width consistent
    height: 50,
    backgroundColor: "#a702c8",
    borderRadius: 67,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: 'center', // Center button within footer
  },
  continueText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
}); 