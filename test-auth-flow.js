const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testAuthFlow() {
    console.log('=== Testing Authentication Flow ===\n');
    
    try {
        // Step 1: Register a new user
        const timestamp = Date.now();
        const testUser = {
            email: `test${timestamp}@example.com`,
            password: 'testpass123',
            firstName: 'Test',
            lastName: 'User',
            role: 'athlete'
        };
        
        console.log('1. Registering new user:', testUser.email);
        const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, testUser);
        console.log('   Registration response:', {
            success: registerResponse.data.success,
            hasToken: !!registerResponse.data.token,
            hasUser: !!registerResponse.data.user
        });
        
        const token = registerResponse.data.token;
        console.log('   Token received:', token ? token.substring(0, 20) + '...' : 'NONE');
        
        // Step 2: Check if token works with /api/profile/me
        console.log('\n2. Testing token with /api/profile/me endpoint:');
        try {
            const profileCheckResponse = await axios.get(`${API_BASE_URL}/api/profile/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('   Profile check response:', profileCheckResponse.status, profileCheckResponse.data);
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('   ✓ Got expected 404 - user has no profile yet');
            } else {
                console.log('   ✗ Error:', error.response?.status, error.response?.data);
            }
        }
        
        // Step 3: Try to create a profile
        console.log('\n3. Creating profile with token:');
        
        // Updated to match actual database schema
        const profileData = {
            first_name: 'Test',
            last_name: 'User',
            full_name: 'Test User',
            email: testUser.email,
            high_school: 'Test High School',
            position: 'Quarterback',
            grad_year: 2026,
            location: 'Dallas, TX',
            height: "6'2\"",
            weight: 200,
            // Required fields from the actual schema
            sport: 'football',
            custom_url_slug: `test-user-${timestamp}`
        };
        
        console.log('   Profile data:', profileData);
        console.log('   Using token:', token ? token.substring(0, 20) + '...' : 'NONE');
        
        const createProfileResponse = await axios.post(`${API_BASE_URL}/api/profile`, profileData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('   ✓ Profile created successfully!');
        console.log('   Response:', createProfileResponse.data);
        
    } catch (error) {
        console.error('\n✗ Error in auth flow:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
    }
}

// Run the test
testAuthFlow(); 