// Simple test script to directly check registration using only browser APIs
// To run in the browser console on the site
// Copy this code and paste it into the browser console

// Immediately-invoked function expression
(function() {
  const API_URL = 'https://oneshot-backend-production.up.railway.app';
  const TEST_USER = {
    email: `test${Date.now()}@example.com`, // Unique email to avoid conflicts
    password: 'test1234',
    firstName: 'Test',
    lastName: 'User',
    role: 'athlete'
  };

  console.log(`Testing registration with ${API_URL}/api/auth/register`);
  console.log('Test user:', { ...TEST_USER, password: '******' });

  // Using native browser XMLHttpRequest
  const xhr = new XMLHttpRequest();
  xhr.open('POST', `${API_URL}/api/auth/register`, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      console.log('Response status:', xhr.status);
      console.log('Response headers:', xhr.getAllResponseHeaders());
      console.log('Response body:', xhr.responseText);
      
      try {
        const jsonData = JSON.parse(xhr.responseText);
        console.log('Parsed JSON:', jsonData);
      } catch (e) {
        console.log('Could not parse response as JSON');
      }
      
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log('✅ Registration test passed!');
      } else {
        console.log('❌ Registration test failed!');
      }
    }
  };
  
  xhr.onerror = function() {
    console.error('Network error during registration test');
  };
  
  // Send the request
  xhr.send(JSON.stringify(TEST_USER));
})(); 