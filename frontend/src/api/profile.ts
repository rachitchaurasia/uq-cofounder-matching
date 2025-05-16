import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config'; // Adjust path if needed

export const updateProfile = async (payload: Record<string, any>): Promise<boolean> => {
  console.log('Attempting to update profile with payload:', payload);
  const token = await AsyncStorage.getItem('authToken');
  if (!token) {
    console.error('Update Profile Failed: No auth token found.');
    // Optionally, trigger logout or redirect to login here
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/profiles/me/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json(); // Try to parse JSON regardless of status

    if (!response.ok) {
      console.error('Update Profile Failed:', response.status, data);
       let errorMessage = `Failed to save profile data (Status: ${response.status})`;
       // Try to extract specific errors
       if (typeof data === 'object' && data !== null) {
           const errors = Object.entries(data).map(([key, value]) =>
                `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
           ).join('; ');
           if (errors) errorMessage += `\nDetails: ${errors}`;
       } else if (typeof data === 'string' && data) {
            errorMessage += `\nDetails: ${data}`;
       }
      throw new Error(errorMessage);
    }

    console.log('Profile updated successfully:', data);
    return true; // Indicate success

  } catch (err: any) {
    console.error("Error during profile update fetch:", err);
    // Alerting the user might be better handled in the component calling this
    // Alert.alert("Save Failed", err.message || "Could not save profile data.");
    throw err; // Re-throw the error so the calling component can handle it
  }
};

export const getProfile = async (): Promise<any> => {
  const token = await AsyncStorage.getItem('authToken');
  if (!token) {
    throw new Error('No auth token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/profiles/me/`, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("Error fetching profile:", err);
    throw err;
  }
};

export const runMatching = async (): Promise<any> => {
  const token = await AsyncStorage.getItem('authToken');
  if (!token) {
    throw new Error('No auth token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/matching/run/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to run matching: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("Error running matching algorithm:", err);
    throw err;
  }
};
