/**
 * API services for interacting with the backend
 */

// Configure the base URL for all API requests
const API_BASE_URL = 'http://localhost:3001';

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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });

    console.log('API response status:', response.status);
    
    // Clone the response before using it, since response body can only be read once
    const responseClone = response.clone();
    try {
      const data = await responseClone.json();
      console.log('API response data:', data);
    } catch (e) {
      console.log('Could not parse response as JSON');
    }
    
    return response;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
} 