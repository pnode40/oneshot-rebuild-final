import { createContext } from 'react';
import { User } from './types';

// Auth context type definition
export interface AuthContextType {
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
export const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  user: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
}); 