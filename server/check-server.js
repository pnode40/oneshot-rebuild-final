const axios = require('axios');

// Try different endpoints and ports to diagnose server issues
const endpoints = [
  'http://localhost:3001/',
  'http://localhost:3001/api',
  'http://localhost:3001/api/profile',
  'http://localhost:3001/api/profile/all',
  'http://localhost:3001/api/debug',
  'http://localhost:3001/test-insert',
  'http://localhost:5173/' // Check if the frontend is running
];

async function checkEndpoints() {
  console.log('Checking server availability...');
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\nTrying ${endpoint}...`);
      const response = await axios.get(endpoint);
      console.log('✅ Success!');
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
    } catch (error) {
      console.log('❌ Failed');
      if (error.response) {
        console.log('  Status:', error.response.status);
        console.log('  Response:', JSON.stringify(error.response.data, null, 2).substring(0, 200) + '...');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('  Connection refused. Server not running or port not open.');
      } else {
        console.log('  Error:', error.message);
      }
    }
  }
}

checkEndpoints(); 