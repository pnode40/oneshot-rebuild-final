const http = require('http');

const data = JSON.stringify({
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
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/profile',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Sending request with data:', data);
console.log('To URL:', `http://${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  let responseBody = '';
  
  res.on('data', (chunk) => {
    responseBody += chunk;
    console.log('Received chunk:', chunk);
  });
  
  res.on('end', () => {
    console.log('Response Body:', responseBody);
    try {
      const parsedBody = JSON.parse(responseBody);
      console.log('Parsed Response:', parsedBody);
      
      if (parsedBody.profileId) {
        console.log('✅ SUCCESS! New profile created with ID:', parsedBody.profileId);
      }
    } catch (e) {
      console.error('Error parsing response JSON:', e);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
  console.error('Make sure the server is running on port 3001');
});

// Write data to request body
req.write(data);
req.end();

console.log('Test API request sent. Waiting for response...'); 