import axios from 'axios';

async function testInvalidToken() {
  try {
    console.log('Testing API with invalid token...');
    const response = await axios.post('http://localhost:3001/api/profile', 
      {
        name: 'Test User',
        highSchool: 'Test High School',
        position: 'QB',
        height: '6\'2"',
        weight: 185,
        visibility: 'private'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer INVALID_TOKEN_HERE'
        }
      }
    );
    
    console.log('Response:', response.data);
  } catch (error) {
    console.log('Error response:');
    if (axios.isAxiosError(error)) {
      console.log('Status:', error.response?.status);
      console.log('Message:', error.response?.data);
    } else {
      console.log('Unexpected error:', error);
    }
  }
}

testInvalidToken(); 