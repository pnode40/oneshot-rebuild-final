/**
 * OneShot Authentication Test Script
 * 
 * This script tests the authentication endpoints:
 * 1. Seeding test users
 * 2. Registering a new user
 * 3. Logging in
 * 4. Accessing protected routes
 */
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';
let authToken = null;

// Test user data
const testUser = {
  email: 'test-user@oneshot.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User',
  role: 'athlete'
};

// Helper function for nicer console output
const logResponse = (title, response) => {
  console.log('\n------------------------------');
  console.log(`${title}:`);
  console.log('Status:', response.status);
  console.log('Data:', JSON.stringify(response.data, null, 2));
  console.log('------------------------------\n');
};

// Helper function to handle errors
const handleError = (title, error) => {
  console.error('\n------------------------------');
  console.error(`ERROR in ${title}:`);
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Response data:', JSON.stringify(error.response.data, null, 2));
  } else {
    console.error('Error message:', error.message);
    console.error('Full error:', error);
  }
  console.error('------------------------------\n');
};

// Main async function to run all tests in sequence
async function runTests() {
  try {
    console.log('Checking API availability...');
    try {
      // Use a known working endpoint to check server availability
      await axios.get(`${API_BASE_URL}/api/profile/all`);
      console.log('API is available!');
    } catch (error) {
      console.error('API server is not responding. Please ensure the server is running at', API_BASE_URL);
      if (error.code === 'ECONNREFUSED') {
        console.error('Connection refused. The server is likely not running.');
      }
      process.exit(1);
    }

    // 1. Seed test users
    console.log('🌱 Seeding test users...');
    try {
      const seedResponse = await axios.post(`${API_BASE_URL}/api/test-auth/seed`);
      logResponse('Seed Users Response', seedResponse);
    } catch (error) {
      handleError('Seeding test users', error);
      console.log('Continuing with other tests despite seeding failure...');
    }

    // 2. Register a new test user
    console.log('📝 Registering a new user...');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, testUser);
      logResponse('Register Response', registerResponse);
      
      // Save token from registration
      authToken = registerResponse.data.token;
    } catch (error) {
      // If user already exists, try logging in instead
      if (error.response && error.response.status === 409) {
        console.log('User already exists, proceeding to login...');
      } else {
        handleError('User registration', error);
        console.log('Continuing to login phase...');
      }
    }

    // 3. Login with test user
    console.log('🔑 Logging in...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      logResponse('Login Response', loginResponse);
      
      // Save token from login
      authToken = loginResponse.data.token;
    } catch (error) {
      handleError('User login', error);
      console.log('Authentication failed, cannot proceed with protected route tests.');
      process.exit(1);
    }

    // Make sure we have a token before proceeding
    if (!authToken) {
      console.error('No auth token available. Cannot proceed with protected route tests.');
      process.exit(1);
    }

    // 4. Test protected route
    console.log('🔒 Testing protected route...');
    try {
      const protectedResponse = await axios.get(
        `${API_BASE_URL}/api/test-auth/protected`, 
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      logResponse('Protected Route Response', protectedResponse);
    } catch (error) {
      handleError('Protected route test', error);
    }

    // 5. Test athlete-parent route (should succeed for athlete)
    console.log('👨‍👩‍👧‍👦 Testing athlete-parent route...');
    try {
      const athleteParentResponse = await axios.get(
        `${API_BASE_URL}/api/test-auth/athlete-parent`, 
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      logResponse('Athlete-Parent Route Response', athleteParentResponse);
    } catch (error) {
      handleError('Athlete-parent route test', error);
    }

    // 6. Test admin route (should fail for athlete)
    console.log('👔 Testing admin-only route (should fail)...');
    try {
      const adminResponse = await axios.get(
        `${API_BASE_URL}/api/test-auth/admin-only`, 
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      logResponse('Admin Route Response (Unexpected Success)', adminResponse);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        logResponse('Admin Route Response (Expected Failure)', error.response);
      } else {
        handleError('Admin route test', error);
      }
    }

    console.log('✅ All tests completed!');

  } catch (error) {
    handleError('Test Execution', error);
  }
}

// Run the tests
runTests(); 