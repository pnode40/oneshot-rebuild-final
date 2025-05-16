// Test script for full password reset functionality
const axios = require('axios');

// Base URL for API
const API_BASE_URL = 'http://localhost:3001/api/auth';

async function testFullPasswordResetFlow() {
  try {
    console.log('🔑 Testing Complete Password Reset Flow');
    console.log('---------------------------------');
    
    // Step 1: Request password reset with valid email
    console.log('\n1. Testing password reset request with valid email:');
    const validEmail = 'test@oneshot.com'; // Our test user
    const resetResponse = await axios.post(`${API_BASE_URL}/request-reset`, {
      email: validEmail
    });
    console.log(`   Status: ${resetResponse.status}`);
    console.log(`   Message: ${resetResponse.data.message}`);
    
    // If in development mode, we should receive the reset URL
    if (resetResponse.data.resetUrl) {
      console.log(`   Reset URL: ${resetResponse.data.resetUrl}`);
      
      // Extract token from URL
      const token = new URL(resetResponse.data.resetUrl).searchParams.get('token');
      
      console.log(`   Token: ${token}`);
      
      // Step 2: Verify token validity
      console.log('\n2. Verifying token validity:');
      try {
        const verifyResponse = await axios.get(`${API_BASE_URL}/reset/${token}`);
        console.log(`   Status: ${verifyResponse.status}`);
        console.log(`   Message: ${verifyResponse.data.message}`);
        console.log(`   Email: ${verifyResponse.data.email}`);
        
        // Step 3: Reset password with valid token
        console.log('\n3. Resetting password with valid token:');
        try {
          const resetPasswordResponse = await axios.post(`${API_BASE_URL}/reset/${token}`, {
            password: 'NewPassword456',
            confirmPassword: 'NewPassword456'
          });
          console.log(`   Status: ${resetPasswordResponse.status}`);
          console.log(`   Message: ${resetPasswordResponse.data.message}`);
          
          // Step 4: Try to login with new password
          console.log('\n4. Testing login with new password:');
          try {
            const loginResponse = await axios.post(`${API_BASE_URL}/login`, {
              email: validEmail,
              password: 'NewPassword456'
            });
            console.log(`   Status: ${loginResponse.status}`);
            console.log(`   Message: ${loginResponse.data.message}`);
            console.log(`   Login successful: ${loginResponse.data.success}`);
          } catch (loginError) {
            console.log(`   Error: ${loginError.response?.status || 'Unknown'} - ${loginError.response?.data?.message || loginError.message}`);
          }
          
        } catch (resetError) {
          console.log(`   Error: ${resetError.response?.status || 'Unknown'} - ${resetError.response?.data?.message || resetError.message}`);
        }
      } catch (verifyError) {
        console.log(`   Error: ${verifyError.response?.status || 'Unknown'} - ${verifyError.response?.data?.message || verifyError.message}`);
      }
    } else {
      console.log('   No reset URL received. This is expected in production but should not happen in development.');
    }
    
    // Step 5: Test password reset with non-existent email
    console.log('\n5. Testing password reset with non-existent email:');
    const invalidEmail = 'nonexistent@example.com';
    try {
      const invalidResetResponse = await axios.post(`${API_BASE_URL}/request-reset`, {
        email: invalidEmail
      });
      console.log(`   Status: ${invalidResetResponse.status}`);
      console.log(`   Message: ${invalidResetResponse.data.message}`);
      // Should still return 200 for security reasons
    } catch (error) {
      console.log(`   Error: ${error.response?.status || 'Unknown'} - ${error.response?.data?.message || error.message}`);
    }
    
    console.log('\n✅ Password reset flow test completed');
    
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
testFullPasswordResetFlow(); 