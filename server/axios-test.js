const axios = require('axios');

// Profile data to send
const profileData = {
  fullName: 'John Smith',
  email: 'johnsmith@example.com',
  highSchool: 'Central High',
  position: 'Quarterback',
  gradYear: '2024',
  cityState: 'Austin, TX',
  heightFt: '6',
  heightIn: '2',
  weight: '195',
  fortyYardDash: '4.8',
  benchPress: '225'
};

console.log('Sending POST request to http://localhost:3001/api/profile');
console.log('With data:', JSON.stringify(profileData, null, 2));

// Making the API call
axios.post('http://localhost:3001/api/profile', profileData, {
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('✅ SUCCESS!');
  console.log('Status:', response.status);
  console.log('Response headers:', response.headers);
  console.log('Response data:', response.data);
  
  if (response.data.profileId) {
    console.log('New profile created with ID:', response.data.profileId);
  }
})
.catch(error => {
  console.error('❌ ERROR:', error.message);
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response status:', error.response.status);
    console.error('Response headers:', error.response.headers);
    console.error('Response data:', error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received. Is the server running?');
  } else {
    // Something happened in setting up the request
    console.error('Error setting up request:', error.message);
  }
}); 