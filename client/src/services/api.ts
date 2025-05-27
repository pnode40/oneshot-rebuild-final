/**
 * API services for interacting with the backend
 */

// Configure the base URL for all API requests
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
console.log('API_BASE_URL:', API_BASE_URL); // Debugging log

// Key for localStorage profile data in test mode
const TEST_MODE_PROFILE_DATA_KEY = 'oneShot_testMode_profileData';

// Helper to check test mode (consistent with App.tsx)
const isTestModeActive = () => localStorage.getItem('oneshot_test_mode') === 'true';

import { ProfileData } from '../types'; // Import shared type

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
  // Test mode should bypass login via TestAuthProvider, but if called, could be mocked too.
  // For now, keeping original login logic as TestAuthProvider handles test login state.
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
  // Test mode should bypass register via TestAuthProvider, but if called, could be mocked.
  // For now, keeping original register logic.
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
  // In test mode, localStorage for test mode should also be cleared for a full "logout"
  if (isTestModeActive()) {
    localStorage.removeItem(TEST_MODE_PROFILE_DATA_KEY);
    localStorage.removeItem('oneshot_test_mode'); // This will turn off test mode itself
    // Consider if TestAuthProvider needs to be reset too, though page reload will handle it
  }
}

/**
 * Create or Update athlete profile (mockable)
 * @param profile The profile data to create/update
 * @returns The raw fetch response promise or a mock response
 */
export async function saveProfile(profile: Partial<ProfileData>) {
  if (isTestModeActive()) {
    console.log('TEST MODE: Simulating saveProfile with data:', profile);
    try {
      const storedData = localStorage.getItem(TEST_MODE_PROFILE_DATA_KEY);
      // Use an empty object as fallback to initialize if nothing is stored yet
      let currentProfileData: ProfileData = storedData ? JSON.parse(storedData) : { fullName: '', email: '', highSchool: '', position: '', mockUploads: {} };
      
      const updatedProfile = { ...currentProfileData, ...profile };
      localStorage.setItem(TEST_MODE_PROFILE_DATA_KEY, JSON.stringify(updatedProfile));
      
      const mockResponseData = { success: true, message: 'Profile saved successfully (mock).', data: updatedProfile };
      const mockResponse = new Response(JSON.stringify(mockResponseData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      // Return structure consistent with other API calls if possible, e.g., { response, data }
      return Promise.resolve({ response: mockResponse, data: mockResponseData });
    } catch (e) {
      console.error("TEST MODE: Error in saveProfile mock", e);
      const mockErrorData = { success: false, message: 'Test mode mock profile save error' };
      const mockErrorResponse = new Response(JSON.stringify(mockErrorData), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
      return Promise.resolve({ response: mockErrorResponse, data: mockErrorData });
    }
  }

  // Original create/update profile logic for non-test mode
  console.log('Making API call to save profile:', profile);
  try {
    // Determine if it's a create (POST) or update (PUT), or if backend handles upsert
    // Assuming a POST to /api/profile for now, adjust if needed
    const response = await fetch(`${API_BASE_URL}/api/profile`, { 
      method: 'POST', 
      headers: getAuthHeaders(),
      body: JSON.stringify(profile),
    });

    const data = await response.json(); // Assuming backend returns JSON
    return { response, data };
  } catch (error) {
    console.error('API call error (saveProfile):', error);
    throw error;
  }
}

/**
 * Upload a file (mockable)
 * @param file The File object
 * @param fileType A string key to identify the upload type (e.g., 'profilePhoto', 'videoMain', 'transcriptPDF')
 * @returns Mock or real API response
 */
export async function uploadFile(file: File, fileType: string) {
  if (isTestModeActive()) {
    console.log(`TEST MODE: Simulating upload for ${fileType}:`, file.name);
    try {
      const storedData = localStorage.getItem(TEST_MODE_PROFILE_DATA_KEY);
      let currentProfileData: ProfileData = storedData 
        ? JSON.parse(storedData) 
        : { fullName: '', email: '', highSchool: '', position: '', mockUploads: {} }; // Default structure
      
      if (!currentProfileData.mockUploads) {
        currentProfileData.mockUploads = {};
      }
      
      // For all file types in test mode, including profilePhoto, store a mock path.
      // The actual image preview in the form will be handled by a blob URL created client-side at selection time.
      const mockFileUrl = `test-mode-assets/${fileType}/${encodeURIComponent(file.name)}`;
      console.log(`TEST MODE: Using mock path for ${fileType}: ${mockFileUrl}`);
            
      currentProfileData.mockUploads[fileType] = { 
        name: file.name, 
        type: file.type,
        url: mockFileUrl // Store the mock path
      };
      localStorage.setItem(TEST_MODE_PROFILE_DATA_KEY, JSON.stringify(currentProfileData));
      
      const mockResponseData = { 
        success: true, 
        message: `${fileType} uploaded successfully (mock).`, 
        data: { url: mockFileUrl, name: file.name, type: file.type } // Return the mock path
      };
      const mockResponse = new Response(JSON.stringify(mockResponseData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      return Promise.resolve({ response: mockResponse, data: mockResponseData });
    } catch (e) {
      console.error("TEST MODE: Error in uploadFile mock", e);
      const mockErrorData = { success: false, message: 'Test mode mock upload error' };
      const mockErrorResponse = new Response(JSON.stringify(mockErrorData), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
      return Promise.resolve({ response: mockErrorResponse, data: mockErrorData});
    }
  }

  // Real upload logic for non-test mode
  console.log(`API: Uploading ${fileType}:`, file.name);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType); 

  try {
    const response = await fetch(`${API_BASE_URL}/api/upload`, { 
      method: 'POST',
      // For FormData, Content-Type is set by browser, remove explicit 'application/json'
      // getAuthHeaders() includes Content-Type, so create a new header object
      headers: { 
        ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {})
      }, 
      body: formData,
    });
    const data = await response.json();
    return { response, data };
  } catch (error) {
    console.error('API upload error:', error);
    throw error;
  }
}

/**
 * Fetch public profile data by slug (mockable)
 * @param slug The public profile slug
 * @returns Promise with response and data
 */
export async function getPublicProfileBySlug(slug: string): Promise<{ response: Response, data: any }> {
  if (isTestModeActive()) {
    console.log(`TEST MODE: Simulating getPublicProfileBySlug for slug: ${slug}`);
    try {
      const storedData = localStorage.getItem(TEST_MODE_PROFILE_DATA_KEY);
      if (storedData) {
        const profileData: ProfileData = JSON.parse(storedData);
        // In test mode, we assume any slug request refers to the stored test user data
        const mockResponseData = { success: true, data: profileData };
        const mockResponse = new Response(JSON.stringify(mockResponseData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        return Promise.resolve({ response: mockResponse, data: mockResponseData });
      } else {
        const mockErrorData = { success: false, message: 'Test mode: No profile data found in localStorage.' };
        const mockErrorResponse = new Response(JSON.stringify(mockErrorData), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
        return Promise.resolve({ response: mockErrorResponse, data: mockErrorData });
      }
    } catch (e) {
      console.error("TEST MODE: Error in getPublicProfileBySlug mock", e);
      const mockErrorData = { success: false, message: 'Test mode: Error retrieving mock profile data.' };
      const mockErrorResponse = new Response(JSON.stringify(mockErrorData), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
      return Promise.resolve({ response: mockErrorResponse, data: mockErrorData });
    }
  }

  // Real API call for non-test mode
  console.log(`API: Fetching public profile for slug: ${slug}`);
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile/public/${slug}`);
    const data = await response.json();
    return { response, data };
  } catch (error) {
    console.error('API call error (getPublicProfileBySlug):', error);
    throw error; // Re-throw to be handled by the caller
  }
}

/**
 * Generate vCard string for a given profile (mockable)
 * @param profileData The profile data to generate vCard from
 * @returns Promise with response and data (mocked vCard string or error)
 */
export async function generateVCard(profileData: ProfileData): Promise<{ response: Response, data: any }> {
  if (isTestModeActive()) {
    console.log('TEST MODE: Simulating generateVCard with data:', profileData);
    try {
      // Basic vCard format
      let firstName = '';
      let lastName = '';
      if (profileData.fullName) {
        const nameParts = profileData.fullName.split(' ');
        lastName = nameParts.pop() || '';
        firstName = nameParts.join(' ') || '';
      }

      const vCardString = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${profileData.fullName || 'N/A'}`, // Full Name
        `N:${lastName};${firstName}`, // Name (Last;First)
        `EMAIL:${profileData.email || 'N/A'}`,
        `ORG:${profileData.highSchool || 'N/A'}`, // Organization (High School)
        `TITLE:${profileData.position || 'N/A'}`, // Position
        // Add more fields as needed from ProfileData
        // For example: profileData.socialMediaLinks.twitter, profileData.cityState etc.
        'END:VCARD'
      ].join('\n');

      const mockResponseData = { success: true, message: 'vCard generated successfully (mock).', data: { vCardString } };
      const mockResponse = new Response(JSON.stringify(mockResponseData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' } // Or 'text/vcard' if sending raw vcard
      });
      return Promise.resolve({ response: mockResponse, data: mockResponseData });
    } catch (e) {
      console.error("TEST MODE: Error in generateVCard mock", e);
      const mockErrorData = { success: false, message: 'Test mode: Error generating mock vCard.' };
      const mockErrorResponse = new Response(JSON.stringify(mockErrorData), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
      return Promise.resolve({ response: mockErrorResponse, data: mockErrorData });
    }
  }

  // Real API call for non-test mode (assuming endpoint exists)
  console.log('API: Generating vCard for profile:', profileData.email);
  try {
    // This endpoint might expect profile ID or slug, adjust as needed
    const response = await fetch(`${API_BASE_URL}/api/profile/vcard`, { 
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData), // Send full profile or just an ID
    });
    const data = await response.json(); // Assuming backend returns JSON with vCard string or URL
    return { response, data };
  } catch (error) {
    console.error('API call error (generateVCard):', error);
    throw error;
  }
}

// The 'createProfile' function was renamed to 'saveProfile' to better reflect create/update.
// If any component still uses 'createProfile', it should be updated or an alias can be kept.
// For example:
// export const createProfile = saveProfile; 