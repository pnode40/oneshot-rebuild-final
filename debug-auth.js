// Debug script to check authentication state
console.log('=== OneShot Authentication Debug ===');

// Check if we're in browser environment
if (typeof window !== 'undefined' && window.localStorage) {
  const token = localStorage.getItem('oneshot_auth_token');
  console.log('Token exists:', !!token);
  
  if (token) {
    console.log('Token length:', token.length);
    console.log('Token starts with:', token.substring(0, 20) + '...');
    
    // Try to decode the JWT payload (without verification)
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('Token payload:', payload);
        
        // Check expiration
        const now = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp && payload.exp < now;
        console.log('Token expired:', isExpired);
        
        if (isExpired) {
          console.log('Token expired at:', new Date(payload.exp * 1000));
          console.log('Current time:', new Date());
        }
      }
    } catch (e) {
      console.log('Error decoding token:', e.message);
    }
  } else {
    console.log('No token found in localStorage');
  }
} else {
  console.log('Not in browser environment or localStorage not available');
}

// Test API connectivity
async function testAPI() {
  try {
    const response = await fetch('http://localhost:3001/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('oneshot_auth_token')}`
      }
    });
    
    console.log('API Response Status:', response.status);
    const data = await response.json();
    console.log('API Response:', data);
  } catch (error) {
    console.log('API Error:', error.message);
  }
}

if (typeof window !== 'undefined') {
  testAPI();
} 