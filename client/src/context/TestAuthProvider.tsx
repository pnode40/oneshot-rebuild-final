import React, { ReactNode } from 'react';
import { AuthContext } from './AuthContext.context';

// Mock user data for testing
const mockUser = {
  id: 999,
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'athlete' as const,
  isVerified: true
};

interface TestAuthProviderProps {
  children: ReactNode;
}

/**
 * A simplified AuthProvider for testing components that use the useAuth hook
 * without requiring a real authenticated session
 */
export const TestAuthProvider: React.FC<TestAuthProviderProps> = ({ children }) => {
  // Provide mock authentication data
  const authValue = {
    isLoading: false,
    isAuthenticated: true,
    user: mockUser,
    login: async () => true,
    register: async () => true,
    logout: () => console.log('Mock logout'),
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}; 