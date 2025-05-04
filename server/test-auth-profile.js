const http = require('http');

// Test user credentials for login
const credentials = {
  email: 'test@example.com',
  password: 'password123'
};

// Function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedBody = JSON.parse(responseBody);
          resolve({ 
            statusCode: res.statusCode, 
            headers: res.headers, 
            body: parsedBody 
          });
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}, Response: ${responseBody}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Main test function
async function runTests() {
  let authToken = null;
  
  console.log('--------------------------------------------');
  console.log('Testing authentication and profile API links');
  console.log('--------------------------------------------');

  // Step 1: Login to get auth token
  try {
    console.log('\n1. Logging in to get auth token...');
    
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, credentials);
    
    console.log(`Login response (${loginRes.statusCode}):`);
    console.log(`Success: ${loginRes.body.success}`);
    
    if (loginRes.body.success && loginRes.body.token) {
      authToken = loginRes.body.token;
      console.log(`Token received: ${authToken.substring(0, 20)}...`);
      console.log(`User ID: ${loginRes.body.user.id}`);
      console.log(`User role: ${loginRes.body.user.role}`);
    } else {
      throw new Error('Login failed, no token received');
    }
  } catch (error) {
    console.error('Login test failed:', error.message);
    process.exit(1);
  }

  // Step 2: Test profile creation with auth token
  try {
    console.log('\n2. Creating profile with auth token...');
    
    const profileData = {
      fullName: 'Test User',
      email: credentials.email,
      highSchool: 'Test High School',
      position: 'Quarterback',
      gradYear: '2025',
      cityState: 'Test City, TX',
      heightFt: '6',
      heightIn: '2',
      weight: '190',
      fortyYardDash: '4.6',
      benchPress: '250'
    };
    
    const createProfileRes = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/profile',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, profileData);
    
    console.log(`Create profile response (${createProfileRes.statusCode}):`);
    console.log(`Success: ${createProfileRes.body.success}`);
    
    if (createProfileRes.body.success) {
      console.log('Profile created successfully!');
      console.log(`Profile ID: ${createProfileRes.body.profile.id}`);
      console.log(`Profile user ID: ${createProfileRes.body.profile.userId}`);
    } else if (createProfileRes.statusCode === 409) {
      console.log('User already has a profile (expected if you run this test multiple times)');
    } else {
      console.log('Response:', createProfileRes.body);
    }
  } catch (error) {
    console.error('Profile creation test failed:', error.message);
  }

  // Step 3: Get my profile with auth token
  try {
    console.log('\n3. Getting my profile with auth token...');
    
    const getProfileRes = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/profile/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log(`Get profile response (${getProfileRes.statusCode}):`);
    console.log(`Success: ${getProfileRes.body.success}`);
    
    if (getProfileRes.body.success) {
      console.log('Profile retrieved successfully!');
      console.log(`Profile ID: ${getProfileRes.body.profile.id}`);
      console.log(`Profile user ID: ${getProfileRes.body.profile.userId}`);
      console.log(`Profile full name: ${getProfileRes.body.profile.fullName}`);
    } else {
      console.log('Response:', getProfileRes.body);
    }
  } catch (error) {
    console.error('Profile retrieval test failed:', error.message);
  }

  // Step 4: Try to get profile without auth token (should fail)
  try {
    console.log('\n4. Getting profile without auth token (should fail)...');
    
    const unauthProfileRes = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/profile/me',
      method: 'GET'
    });
    
    console.log(`Response (${unauthProfileRes.statusCode}):`);
    console.log(`Message: ${unauthProfileRes.body.message}`);
    
    if (unauthProfileRes.statusCode === 401) {
      console.log('✅ Authentication check passed! Unauthenticated request was properly rejected.');
    } else {
      console.log('❌ Authentication check failed! Unauthenticated request was not rejected.');
    }
  } catch (error) {
    console.error('Unauthenticated test failed:', error.message);
  }
  
  console.log('\n--------------------------------------------');
  console.log('Test complete!');
  console.log('--------------------------------------------');
}

// Run the tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
}); 