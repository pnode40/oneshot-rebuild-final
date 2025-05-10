# React Authentication Context Pattern

## Purpose
Provides a standardized pattern for managing authentication state in React applications.

## Pattern Structure

### Context Definition
```typescript
// Define context type
export interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
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
```

### Provider Implementation
```typescript
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
  });

  // Authentication methods
  const login = async (email, password) => {
    // API call, store token, update state
  };

  const logout = () => {
    // Remove token, update state
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: authState.isAuthenticated,
      user: authState.user,
      login,
      logout,
      // other values
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Usage (Hook)
```typescript
// Custom hook
export const useAuth = () => useContext(AuthContext);

// Component usage
const { isAuthenticated, login, user } = useAuth();
```

## Implementation Guidelines

1. **State Management**: Track authentication status, user data, and loading state
2. **Token Storage**: Use localStorage or secure cookies
3. **Initialization**: Check for existing token on app load
4. **Typed Context**: Use TypeScript interfaces for type safety
5. **Error Handling**: Consistent error handling in auth methods 