import React, { useState, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, Keyboard, ActivityIndicator, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { updateProfile } from "../api/profile";

const backIcon = require("../assets/back-button.png");

// Initial skills list based on the image
const INITIAL_SKILLS = [
    "Marketing", "Design", "Business strategy", "Product development",
    "SCRUM", "Gymnastics", "SEO", "3D Modeling", "Accountant", "Corporate Partnerships",
    "Sales Operations", "Financial Planning", "DevOps", "Just Here to Connect!"
];

// Pre-selected skills based on the image
const PRE_SELECTED_SKILLS = ["SEO", "Corporate Partnerships"];

export const Expertise = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // State for all available skills (including user-added)
  const [availableSkills, setAvailableSkills] = useState<string[]>(INITIAL_SKILLS);
  // State for selected skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>(PRE_SELECTED_SKILLS);
  // State for the input field text
  const [newSkillText, setNewSkillText] = useState<string>("");
  // State to control the visibility/mode of the input area
  const [isAddingSkill, setIsAddingSkill] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // --- State Persistence Handling (Same logic as Interests) ---
  // Using component state directly often works fine with react-navigation's stack.
  // Uncomment useFocusEffect if state loss occurs.
  // const [persistentAvailableSkills, setPersistentAvailableSkills] = useState(INITIAL_SKILLS);
  // const [persistentSelectedSkills, setPersistentSelectedSkills] = useState(PRE_SELECTED_SKILLS);
  // useFocusEffect(
  //   useCallback(() => {
  //     setAvailableSkills(persistentAvailableSkills);
  //     setSelectedSkills(persistentSelectedSkills);
  //     return () => {
  //        // Optional save on blur
  //        // setPersistentAvailableSkills([...availableSkills]);
  //        // setPersistentSelectedSkills([...selectedSkills]);
  //     };
  //   }, [persistentAvailableSkills, persistentSelectedSkills]) // Dependencies
  // );


  const toggleSkill = (skill: string) => {
    setSelectedSkills((prevSelected) => {
      const newSelected = prevSelected.includes(skill)
        ? prevSelected.filter((item) => item !== skill)
        : [...prevSelected, skill];
      // setPersistentSelectedSkills(newSelected); // Update persistent state if using useFocusEffect
      return newSelected;
    });
  };

  const handleAddSkill = () => {
    const trimmedSkill = newSkillText.trim();
    if (trimmedSkill && !availableSkills.map(s => s.toLowerCase()).includes(trimmedSkill.toLowerCase())) {
        setAvailableSkills(prevAvailable => {
            const newAvailable = [...prevAvailable, trimmedSkill];
            // setPersistentAvailableSkills(newAvailable); // Update persistent state
            return newAvailable;
        });
      // Optionally select the newly added skill automatically
      toggleSkill(trimmedSkill);
    }
    setNewSkillText("");
    setIsAddingSkill(false); // Hide input after adding
    Keyboard.dismiss(); // Dismiss keyboard
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
        const payload = {
            skills: selectedSkills.join(',')
        };
        console.log("Saving Expertise:", payload);
        const success = await updateProfile(payload);

        if (success) {
          navigation.navigate('Interests');
        }
    } catch (error: any) {
         console.error("Failed to save expertise:", error);
         Alert.alert("Save Failed", error.message || "Could not save your expertise. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  // ... rest of the component (including handleSkip which might also need updating) ...

  const handleSkip = () => {
    console.log("Skipped Expertise & Skills selection");
    // Also navigate to Interests when skipping Expertise
    navigation.navigate('Interests');
  };

   const handleGoBack = () => {
       // Save state before going back if using the useFocusEffect approach
       // setPersistentAvailableSkills([...availableSkills]);
       // setPersistentSelectedSkills([...selectedSkills]);
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
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <Text style={styles.title}>Expertise & Skills</Text>
          {/* Subtitle */}
          <Text style={styles.subtitle}>Let everyone know what you're skilled in by adding it to your profile.</Text>

          {/* --- Add Skill Input Area --- */}
           {!isAddingSkill ? (
            <TouchableOpacity
              style={styles.addSkillsButton}
              onPress={() => setIsAddingSkill(true)}
              disabled={loading}
            >
              <Text style={styles.addSkillsText}>ADD YOUR SKILLS HERE</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.addSkillInputContainer}>
              <TextInput
                style={styles.addSkillInput}
                placeholder="Type your skill..."
                placeholderTextColor="#B0B0B0"
                value={newSkillText}
                onChangeText={setNewSkillText}
                onSubmitEditing={handleAddSkill}
                autoFocus={true}
                editable={!loading}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddSkill} disabled={loading}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* --- Skill Chips --- */}
           <View style={styles.skillsContainer}>
            {availableSkills.map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              return (
                <TouchableOpacity
                  key={skill}
                  style={[
                    styles.skillChip,
                    isSelected ? styles.skillChipSelected : styles.skillChipUnselected,
                  ]}
                  onPress={() => toggleSkill(skill)}
                  disabled={loading}
                >
                  <Text style={[
                    styles.skillText,
                    isSelected ? styles.skillTextSelected : styles.skillTextUnselected,
                  ]}>{skill}</Text>
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

// --- Styles --- (Copied from Interests.tsx, renamed where appropriate, adjusted progress bar)
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
    width: "85%",
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
      flex: 1,
      marginTop: 60,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
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
  addSkillsButton: {
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
  addSkillsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#828693",
  },
  addSkillInputContainer: {
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
  addSkillInput: {
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
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: '100%',
    marginBottom: 20,
  },
  skillChip: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  skillChipUnselected: {
    backgroundColor: "white",
    borderColor: "#E0E0E0",
  },
  skillChipSelected: {
    backgroundColor: "white",
    borderColor: "#a702c8",
  },
  skillText: {
    fontSize: 14,
    fontWeight: "500",
  },
  skillTextUnselected: {
    color: "#828693",
  },
  skillTextSelected: {
    color: "#a702c8",
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