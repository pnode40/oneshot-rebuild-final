import React, { useState, useEffect, ReactNode } from 'react';
import { isAuthenticated, login as apiLogin, logout as apiLogout, register as apiRegister } from '../services/api';
import { AuthContext } from './AuthContext.context';
import { User } from './types';

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

  // Register function with improved error handling
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
      
      // Capture registration start time for debugging
      const startTime = Date.now();
      
      try {
        const { response, data } = await apiRegister(userData);
        const endTime = Date.now();
        
        console.log("AuthContext: Registration API completed in " + (endTime - startTime) + "ms");
        console.log("AuthContext: Registration response status:", response.status);
        
        if (response.ok && data.success && data.token && data.user) {
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
        
        // Log error details
        console.error("AuthContext: Registration failed", {
          status: response.status,
          statusText: response.statusText,
          success: data.success,
          message: data.message,
          errors: data.errors
        });
        
        return false;
      } catch (apiError: any) {
        console.error("AuthContext: API registration error:", apiError);
        return false;
      }
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