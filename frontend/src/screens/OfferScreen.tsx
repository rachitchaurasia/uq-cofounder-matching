import React, { useState, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, Keyboard, ActivityIndicator, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types"; // Adjust path if needed
import { supabase } from "../supabaseClient"; // Import Supabase client

const backIcon = require("../assets/back-button.png"); // Assuming same back icon

// Initial list based on the image
const INITIAL_OFFERS = [
    "Talent referrals", "Hiring support", "financial guidance", "Launch support",
    "Technical expertise", "Marketing", "Collab on side projects", "UX", "investor network"
];

// Pre-selected items based on the image
const PRE_SELECTED_OFFERS = ["Collab on side projects", "investor network"];

export const OfferScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // State for all available offers
  const [availableOffers, setAvailableOffers] = useState<string[]>(INITIAL_OFFERS);
  // State for selected offers
  const [selectedOffers, setSelectedOffers] = useState<string[]>(PRE_SELECTED_OFFERS);
  // State for the input field text
  const [newOfferText, setNewOfferText] = useState<string>("");
  // State to control the visibility/mode of the input area
  const [isAddingOffer, setIsAddingOffer] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false); // <<< Add loading state

  const toggleOffer = (offer: string) => {
    setSelectedOffers((prevSelected) => {
      const newSelected = prevSelected.includes(offer)
        ? prevSelected.filter((i) => i !== offer)
        : [...prevSelected, offer];
      return newSelected;
    });
  };

  const handleAddOffer = () => {
    const trimmedOffer = newOfferText.trim();
    if (trimmedOffer && !availableOffers.map(i => i.toLowerCase()).includes(trimmedOffer.toLowerCase())) {
      setAvailableOffers(prevAvailable => [...prevAvailable, trimmedOffer]);
      toggleOffer(trimmedOffer);
    }
    setNewOfferText("");
    setIsAddingOffer(false);
    Keyboard.dismiss();
  };

  const handleContinue = async () => { // <<< Make async
    setLoading(true); // <<< Start loading
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Error", "No authenticated user found. Please sign in.");
        setLoading(false);
        // navigation.navigate("SignIn"); // Optionally navigate
        return;
      }

      const updates = {
        offers: selectedOffers, // Save as an array for JSONB
        onboarding_completed: true, // <<< SET ONBOARDING COMPLETED
        updated_at: new Date().toISOString(),
      };

      // console.log("Saving Offers:", payload); // Old log
      // const success = await updateProfile(payload); // Old call

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to save offers to Supabase:', updateError);
        throw updateError;
      }
      
      console.log('Successfully saved offers to Supabase profile:', selectedOffers);
      // This is the last step, navigate to Welcome screen
      // Use replace to remove the onboarding stack
      navigation.replace('Welcome'); // <<< Navigate on success
      
    } catch (error: any) {
         console.error("Failed to save offers:", error);
         Alert.alert("Save Failed", error.message || "Could not save what you can offer. Please try again.");
    } finally {
        setLoading(false); // <<< Stop loading
    }
  };

  const handleSkip = () => { // Optional: Save empty state or just navigate
    console.log("Skipped Offer selection");
    navigation.replace('Welcome'); // Still go to Welcome screen
  };

  const handleGoBack = () => {
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* --- Header Elements (Add disabled={loading}) --- */}
        <View style={styles.header}>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressFill} />
          </View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
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
          <Text style={styles.title}>What can you offer?</Text>

          {/* --- Add Offer Input Area (Add disabled={loading}) --- */}
          {!isAddingOffer ? (
            <View style={styles.addOfferInputContainer}>
              <TextInput
                style={styles.addOfferInput}
                placeholder="I CAN OFFER..."
                placeholderTextColor="#B0B0B0"
                onFocus={() => setIsAddingOffer(true)}
                value={newOfferText}
                onChangeText={setNewOfferText}
                editable={!loading}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddOffer} disabled={loading}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.addOfferInputContainer, styles.addOfferInputContainerActive]}>
              <TextInput
                style={styles.addOfferInput}
                placeholder="I CAN OFFER..."
                placeholderTextColor="#B0B0B0"
                value={newOfferText}
                onChangeText={setNewOfferText}
                onSubmitEditing={handleAddOffer}
                autoFocus={true}
                editable={!loading}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddOffer} disabled={loading}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* --- Offer Chips (Add disabled={loading}) --- */}
          <View style={styles.offersContainer}>
            {availableOffers.map((offer) => {
              const isSelected = selectedOffers.includes(offer);
              return (
                <TouchableOpacity
                  key={offer}
                  style={[
                    styles.offerChip,
                    isSelected ? styles.offerChipSelected : styles.offerChipUnselected,
                  ]}
                  onPress={() => toggleOffer(offer)}
                  disabled={loading}
                >
                  <Text style={[
                    styles.offerText,
                    isSelected ? styles.offerTextSelected : styles.offerTextUnselected,
                  ]}>{offer}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* --- Footer Button (Show loader or button) --- */}
        <View style={styles.footer}>
            {loading ? (
                <ActivityIndicator size="large" color="#a702c8" style={{height: 50}}/>
            ) : (
                <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={loading}>
                    <Text style={styles.continueText}>CONTINUE</Text>
                </TouchableOpacity>
            )}
        </View>
      </View>
    </SafeAreaView>
  );
};

// --- Styles --- (Adapted from LookingScreen.tsx)
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
    width: "100%", // Assuming this is the last step
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
      marginTop: 20,
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
    marginBottom: 30,
    alignSelf: 'flex-start',
  },
  // Input Area Styles
  addOfferInputContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 50,
    marginBottom: 25,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 25,
    paddingLeft: 20,
    paddingRight: 10,
  },
  addOfferInputContainerActive: {
      borderColor: '#a702c8',
      backgroundColor: 'white',
  },
  addOfferInput: {
    flex: 1,
    fontSize: 16,
    color: '#010001',
    fontWeight: '500',
  },
  addButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: '#E8E8E8',
    borderRadius: 15,
  },
  addButtonText: {
    color: '#A0A0A0',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Offer Chips styles
  offersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: '100%',
    marginBottom: 'auto',
  },
  offerChip: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  offerChipUnselected: {
    backgroundColor: "white",
    borderColor: "#E0E0E0",
  },
  offerChipSelected: {
    backgroundColor: "white",
    borderColor: "#a702c8",
  },
  offerText: {
    fontSize: 14,
    fontWeight: "500",
  },
  offerTextUnselected: {
    color: "#828693",
  },
  offerTextSelected: {
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