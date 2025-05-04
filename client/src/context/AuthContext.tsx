import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { isAuthenticated, getToken, login as apiLogin, logout as apiLogout, register as apiRegister } from '../services/api';

// User type definition
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'athlete' | 'recruiter' | 'admin' | 'parent';
  isVerified: boolean;
}

// Auth context type definition
interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'athlete' | 'recruiter' | 'admin' | 'parent';
  }) => Promise<boolean>;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  user: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    user: User | null;
  }>({
    isAuthenticated: false,
    user: null,
  });

  // Check authentication status on load
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = isAuthenticated();
      
      // TODO: In a production app, we would verify the token with the server
      // and get the user data from the server
      
      setAuthState({
        isAuthenticated: authenticated,
        user: null, // We'll need to implement a getUser API call
      });
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data } = await apiLogin(email, password);
      
      if (data.success && data.token && data.user) {
        setAuthState({
          isAuthenticated: true,
          user: data.user,
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Register function
  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'athlete' | 'recruiter' | 'admin' | 'parent';
  }): Promise<boolean> => {
    try {
      console.log("AuthContext: Starting registration API call with data:", {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role
      });
      
      const { data } = await apiRegister(userData);
      console.log("AuthContext: Registration API response:", data);
      
      if (data.success && data.token && data.user) {
        console.log("AuthContext: Registration successful, token received:", {
          token: data.token.substring(0, 15) + '...',
          userId: data.user.id,
          role: data.user.role
        });
        
        setAuthState({
          isAuthenticated: true,
          user: data.user,
        });
        console.log("AuthContext: Auth state updated, returning success");
        return true;
      }
      
      console.log("AuthContext: Registration failed, missing data:", { 
        success: data.success,
        hasToken: !!data.token,
        hasUser: !!data.user
      });
      return false;
    } catch (error) {
      console.error("AuthContext: Registration error:", error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    apiLogout();
    setAuthState({
      isAuthenticated: false,
      user: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 