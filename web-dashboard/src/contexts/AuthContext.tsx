import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js'; // Import Supabase types
import { supabase } from '../supabaseClient'; // Import our Supabase client

// CSRF getCookie function is removed as it's not needed for Supabase

// Updated User interface to better match Supabase User and include potential app-specific metadata
interface UserProfile {
  id: string; // Supabase user ID (UUID)
  email?: string;
  full_name?: string; // Example: from user_metadata
  avatar_url?: string; // Example: from user_metadata
  // Add other profile fields you expect from your 'profiles' table or user_metadata
}

// Designated Admin Email (replace if you used a different one)
const ADMIN_EMAIL = 'admin@uqcofounder.com';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null; 
  isLoading: boolean;
  session: Session | null; // Add session to context if needed directly
  isAdmin: boolean; // New: To indicate if the logged-in user is an admin
  loginUser: (credentials: { email: string, password: string }) => Promise<void>; // Changed to email
  logoutUser: () => Promise<void>;
  // checkAuthStatus is effectively replaced by onAuthStateChange listener and initial session check
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // New: isAdmin state

  const processUserSession = (currentSession: Session | null) => {
    setSession(currentSession);
    setIsAuthenticated(!!currentSession);
    if (currentSession?.user) {
      const userProfile: UserProfile = {
        id: currentSession.user.id,
        email: currentSession.user.email,
        full_name: currentSession.user.user_metadata?.full_name,
        avatar_url: currentSession.user.user_metadata?.avatar_url
      };
      setUser(userProfile);
      // Check if the logged-in user is the admin
      if (currentSession.user.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } else {
      setUser(null);
      setIsAdmin(false);
    }
  };

  // useEffect for onAuthStateChange will replace checkAuthStatus
  useEffect(() => {
    setIsLoading(true);
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      processUserSession(session);
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        processUserSession(session);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const loginUser = async (credentials: { email: string, password: string }) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw error;
      }
      // Auth state (isAuthenticated, user, session, isAdmin) will be updated by onAuthStateChange listener
    } catch (error: any) {
      console.error("Login API error:", error);
      // Ensure frontend state reflects failed login if listener doesn't immediately fire or error occurs before
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
      setIsAdmin(false); // Reset isAdmin on login failure
      throw new Error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      // Auth state will be updated by onAuthStateChange listener
      // Explicitly clear here as well for immediate UI feedback if needed, though listener should handle it.
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } catch (error: any) {
      console.error("Logout API error:", error);
      throw new Error(error.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, session, isAdmin, loginUser, logoutUser }}>
      {/* Render children immediately; loading state can be used by consumers if needed */}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Removed unused setError and error variable
