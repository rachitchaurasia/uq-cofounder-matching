import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

// Helper function to get CSRF token from cookies
function getCookie(name: string): string | null {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}


interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_superuser?: boolean;
  // Add other fields as needed
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  loginUser: (credentials: {username: string, password: string }) => Promise<void>;
  logoutUser: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/matchingapp/api/webadmin/status/'); // UPDATED
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const loginUser = async (credentials: {username: string, password: string }) => {
    setIsLoading(true);
    setError(null); // Assuming you'll have an error state in consuming components
    
    let csrfToken = getCookie('csrftoken');
    if (!csrfToken) {
        try {
            await fetch('/matchingapp/api/webadmin/login/'); // UPDATED - GET to ensure_csrf_cookie sets the token
        } catch (e) {
            console.warn("Could not pre-fetch CSRF token, proceeding with login POST anyway.", e);
        }
    }
    // Re-fetch after the potential GET request
    const finalCsrfToken = getCookie('csrftoken');


    try {
      const response = await fetch('/matchingapp/api/webadmin/login/', { // UPDATED
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': finalCsrfToken || '', 
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error("Login API error:", error);
      setIsAuthenticated(false);
      setUser(null);
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    setIsLoading(true);
    const csrfToken = getCookie('csrftoken');
    try {
      const response = await fetch('/matchingapp/api/webadmin/logout/', { // UPDATED
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          'X-CSRFToken': csrfToken || '', 
        },
      });
      if (response.ok) {
        setIsAuthenticated(false);
        setUser(null);
      } else {
        // Handle logout error if necessary
        console.error("Logout failed on server");
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      setIsAuthenticated(false); // Ensure frontend state is logged out
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, loginUser, logoutUser, checkAuthStatus }}>
      {!isLoading && children} {/* Optionally render children only after initial auth check */}
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

// Remove this if you have a global error state elsewhere or handle errors in components
let error: string | null = null;
const setError = (e: string | null) => { error = e; console.error(e); };
