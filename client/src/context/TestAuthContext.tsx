import React, { ReactNode, useState } from 'react';
import { AuthContext } from './AuthContext.context';
import { User } from './types';

// Create a mock user for testing
const mockAthleteUser: User = {
  id: 999,
  email: 'test@athlete.com',
  firstName: 'Test',
  lastName: 'Athlete',
  role: 'athlete',
  isVerified: true
};

const mockRecruiterUser: User = {
  id: 998,
  email: 'test@recruiter.com',
  firstName: 'Test',
  lastName: 'Recruiter',
  role: 'recruiter',
  isVerified: true
};

const mockAdminUser: User = {
  id: 997,
  email: 'test@admin.com',
  firstName: 'Test',
  lastName: 'Admin',
  role: 'admin',
  isVerified: true
};

/**
 * Test provider component that pre-authenticates a user
 * This is used for development and testing purposes only
 */
export const TestAuthProvider: React.FC<{ 
  children: ReactNode,
  initialRole?: 'athlete' | 'recruiter' | 'admin' | 'parent'
}> = ({ children, initialRole = 'athlete' }) => {
  // Get the appropriate mock user based on initialRole
  const getInitialUser = () => {
    switch (initialRole) {
      case 'athlete':
        return mockAthleteUser;
      case 'recruiter':
        return mockRecruiterUser;
      case 'admin':
        return mockAdminUser;
      default:
        return mockAthleteUser;
    }
  };
  
  // Initialize state with mock user
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    user: User | null;
  }>({
    isAuthenticated: true, // Pre-authenticated
    user: getInitialUser(),
  });

  // Mock login function - always succeeds
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Test login called with:', email);
    
    let mockUser;
    // Select the mock user based on email
    if (email.includes('recruiter')) {
      mockUser = mockRecruiterUser;
    } else if (email.includes('admin')) {
      mockUser = mockAdminUser;
    } else {
      mockUser = mockAthleteUser;
    }
    
    setAuthState({
      isAuthenticated: true,
      user: mockUser
    });
    
    return true;
  };

  // Mock register function - always succeeds
  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'athlete' | 'recruiter' | 'admin' | 'parent';
  }): Promise<boolean> => {
    console.log('Test registration called with:', userData);
    
    const mockUser = {
      id: 1000,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'athlete',
      isVerified: true
    };
    
    setAuthState({
      isAuthenticated: true,
      user: mockUser
    });
    
    return true;
  };

  // Logout function
  const logout = () => {
    console.log('Test logout called');
    setAuthState({
      isAuthenticated: false,
      user: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading: false,
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