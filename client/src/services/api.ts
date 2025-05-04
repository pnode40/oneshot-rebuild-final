/**
 * API services for interacting with the backend
 */

// Configure the base URL for all API requests
const API_BASE_URL = 'http://localhost:3001';

// Token management functions
/**
 * Stores the JWT token in localStorage
 */
export function storeToken(token: string): void {
  localStorage.setItem('oneshot_auth_token', token);
}

/**
 * Retrieves the JWT token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem('oneshot_auth_token');
}

/**
 * Removes the JWT token from localStorage
 */
export function removeToken(): void {
  localStorage.removeItem('oneshot_auth_token');
}

/**
 * Checks if the user is authenticated (has a token)
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Creates authorization headers with the JWT token
 */
export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

/**
 * Login a user with email and password
 * @param email User's email
 * @param password User's password
 * @returns The response with token and user data
 */
export async function login(email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (data.success && data.token) {
      storeToken(data.token);
    }
    
    return { response, data };
  } catch (error) {
    console.error('Login API call error:', error);
    throw error;
  }
}

/**
 * Register a new user
 * @param userData User registration data
 * @returns The response with token and user data
 */
export async function register(userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'athlete' | 'recruiter' | 'admin' | 'parent';
}) {
  console.log('API service: Registering user:', {
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: userData.role
  });
  
  try {
    console.log(`API service: Sending POST request to ${API_BASE_URL}/api/auth/register`);
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    console.log('API service: Registration response status:', response.status);
    const data = await response.json();
    console.log('API service: Registration response parsed:', {
      success: data.success,
      hasToken: !!data.token,
      hasUser: !!data.user
    });
    
    if (data.success && data.token) {
      console.log('API service: Registration successful, storing token');
      storeToken(data.token);
    }
    
    return { response, data };
  } catch (error) {
    console.error('API service: Registration error:', error);
    throw error;
  }
}

/**
 * Logout the current user
 */
export function logout(): void {
  removeToken();
}

/**
 * Create a new athlete profile
 * @param profile The profile data to create
 * @returns The raw fetch response promise
 */
export async function createProfile(profile: {
  fullName: string;
  email: string;
  highSchool: string;
  position: string;
  gradYear?: string;
  cityState?: string;
  heightFt?: string;
  heightIn?: string;
  weight?: string;
  fortyYardDash?: string;
  benchPress?: string;
}) {
  console.log('Making API call to create profile:', profile);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(profile),
    });

    console.log('API response status:', response.status);
    
    // Clone the response before using it, since response body can only be read once
    const responseClone = response.clone();
    try {
      const data = await responseClone.json();
      console.log('API response data:', data);
    } catch {
      console.log('Could not parse response as JSON');
    }
    
    return response;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
} 