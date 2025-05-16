// Test script for JWT authentication
const axios = require('axios');

// Base URL for API
const API_BASE_URL = 'http://localhost:3001/api/test-auth';

async function testAuthFlow() {
  try {
    console.log('🔑 Testing JWT Authentication Flow');
    console.log('---------------------------------');
    
    // Step 1: Test public endpoint (should always succeed)
    console.log('\n1. Testing public endpoint:');
    const publicResponse = await axios.get(`${API_BASE_URL}/public`);
    console.log(`   Status: ${publicResponse.status}`);
    console.log(`   Message: ${publicResponse.data.message}`);
    
    // Step 2: Generate a test token
    console.log('\n2. Generating test token:');
    const tokenResponse = await axios.get(`${API_BASE_URL}/generate-test-token`);
    const { token } = tokenResponse.data;
    console.log(`   Token received: ${token.substring(0, 20)}...`);
    
    // Step 3: Test protected endpoint with valid token
    console.log('\n3. Testing protected endpoint with valid token:');
    try {
      const protectedResponse = await axios.get(`${API_BASE_URL}/protected`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(`   Status: ${protectedResponse.status}`);
      console.log(`   Message: ${protectedResponse.data.message}`);
      console.log(`   User data: ${JSON.stringify(protectedResponse.data.userData)}`);
    } catch (error) {
      console.log(`   Error: ${error.response?.status || 'Unknown'} - ${error.response?.data?.message || error.message}`);
    }
    
    // Step 4: Test protected endpoint with invalid token
    console.log('\n4. Testing protected endpoint with invalid token:');
    try {
      const invalidTokenResponse = await axios.get(`${API_BASE_URL}/protected`, {
        headers: {
          Authorization: 'Bearer invalid.token.here'
        }
      });
      console.log(`   Status: ${invalidTokenResponse.status}`);
      console.log(`   Message: ${invalidTokenResponse.data.message}`);
    } catch (error) {
      console.log(`   Error: ${error.response?.status || 'Unknown'} - ${error.response?.data?.message || error.message}`);
    }
    
    // Step 5: Test protected endpoint with no token
    console.log('\n5. Testing protected endpoint with no token:');
    try {
      const noTokenResponse = await axios.get(`${API_BASE_URL}/protected`);
      console.log(`   Status: ${noTokenResponse.status}`);
      console.log(`   Message: ${noTokenResponse.data.message}`);
    } catch (error) {
      console.log(`   Error: ${error.response?.status || 'Unknown'} - ${error.response?.data?.message || error.message}`);
    }
    
    console.log('\n✅ Authentication flow test completed');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(error);
    }
  }
}

// Run the test
testAuthFlow(); 