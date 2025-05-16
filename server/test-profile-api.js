// Test script for verifying numeric field handling in profile API
const axios = require('axios');
const { Client } = require('pg');
require('dotenv').config();

// Create a PostgreSQL client
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// API base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Test values for numeric fields
const TEST_GPA = 3.75;
const TEST_GRADUATION_YEAR = 2025;
const TEST_ELIGIBILITY_YEARS = 4;

// Sample user credentials - make sure these exist in your development database
const TEST_USER = {
  email: 'test@oneshot.dev',
  password: 'password123'
};

// Test profile data
const profileData = {
  fullName: 'Test Athlete',
  email: 'test.athlete@school.edu',
  highSchool: 'Test High School',
  position: 'Quarterback',
  gradYear: '2025',
  cityState: 'Portland, OR',
  heightFt: '6',
  heightIn: '2',
  weight: '195',
  fortyYardDash: '4.5',
  benchPress: '225',
  jerseyNumber: '12',
  athleteRole: 'high_school',
  highSchoolName: 'Test High School',
  // Numeric fields as strings in request
  graduationYear: TEST_GRADUATION_YEAR.toString(),
  gpa: TEST_GPA.toString(),
  eligibilityYearsRemaining: TEST_ELIGIBILITY_YEARS.toString(),
  // URLs
  highlightVideoUrl: 'https://youtube.com/watch?v=testVideo',
  // Visibility flags
  isHeightVisible: true,
  isWeightVisible: true,
  isGpaVisible: true,
  isTranscriptVisible: true,
  isNcaaInfoVisible: true
};

// Main test function
async function runTest() {
  try {
    console.log('=== Starting Profile API Numeric Field Test ===');
    
    // Show database connection string (with password redacted)
    const connectionDetails = client.connectionParameters;
    console.log('Database connection details:', {
      host: connectionDetails.host,
      port: connectionDetails.port,
      database: connectionDetails.database,
      user: connectionDetails.user,
      // Password is omitted for security
    });
    
    // Connect to the database
    try {
      await client.connect();
      console.log('Connected to database successfully');
    } catch (dbError) {
      console.error('Database connection error:', dbError.message);
      throw new Error('Failed to connect to database');
    }
    
    // Step 1: Login to get JWT token
    console.log('\n1. Logging in to get auth token...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, TEST_USER);
      const token = loginResponse.data.data.token;
      console.log('Authentication successful, received token');
      
      // Step 2: Create a profile using the token
      console.log('\n2. Creating test profile with numeric fields...');
      console.log('Request data:', JSON.stringify(profileData, null, 2));
      
      try {
        const createResponse = await axios.post(
          `${API_BASE_URL}/profile`,
          profileData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        console.log('Profile creation response:', JSON.stringify(createResponse.data, null, 2));
        
        // Step 3: Get the profile ID from the response
        const profileId = createResponse.data.data.profile.id;
        console.log(`\nCreated profile with ID: ${profileId}`);
        
        // Step 4: Query the database directly to check data types and values
        console.log('\n3. Querying database to verify numeric field types...');
        const dbQuery = `
          SELECT
            gpa,
            graduation_year,
            eligibility_years_remaining,
            pg_typeof(gpa) AS gpa_db_type,
            pg_typeof(graduation_year) AS grad_year_db_type,
            pg_typeof(eligibility_years_remaining) AS eligibility_db_type
          FROM profiles
          WHERE id = $1;
        `;
        
        try {
          const dbResult = await client.query(dbQuery, [profileId]);
          
          if (dbResult.rows.length > 0) {
            const row = dbResult.rows[0];
            console.log('\nDatabase verification results:');
            console.log('----------------------------');
            console.log(`GPA value: ${row.gpa}, DB type: ${row.gpa_db_type}`);
            console.log(`Graduation Year value: ${row.graduation_year}, DB type: ${row.grad_year_db_type}`);
            console.log(`Eligibility Years value: ${row.eligibility_years_remaining}, DB type: ${row.eligibility_db_type}`);
            
            // Validation
            console.log('\nVerification:');
            console.log('------------');
            console.log(`GPA DB type is numeric: ${row.gpa_db_type === 'numeric'}`);
            console.log(`Graduation Year DB type is integer: ${row.grad_year_db_type === 'integer'}`);
            console.log(`Eligibility Years DB type is integer: ${row.eligibility_db_type === 'integer'}`);
            
            // Value validation
            console.log(`GPA value is correct: ${parseFloat(row.gpa) === TEST_GPA}`);
            console.log(`Graduation Year value is correct: ${parseInt(row.graduation_year) === TEST_GRADUATION_YEAR}`);
            console.log(`Eligibility Years value is correct: ${parseInt(row.eligibility_years_remaining) === TEST_ELIGIBILITY_YEARS}`);
            
            // Overall verification
            const allTypesCorrect = 
              row.gpa_db_type === 'numeric' && 
              row.grad_year_db_type === 'integer' && 
              row.eligibility_db_type === 'integer';
              
            const allValuesCorrect =
              parseFloat(row.gpa) === TEST_GPA &&
              parseInt(row.graduation_year) === TEST_GRADUATION_YEAR &&
              parseInt(row.eligibility_years_remaining) === TEST_ELIGIBILITY_YEARS;
            
            if (allTypesCorrect && allValuesCorrect) {
              console.log('\n✅ TEST PASSED: All numeric fields have correct types and values in the database!');
            } else {
              console.log('\n❌ TEST FAILED: Some numeric fields have incorrect types or values!');
            }
          } else {
            console.log(`No profile found with ID ${profileId}`);
          }
        } catch (dbQueryError) {
          console.error('Database query error:', dbQueryError.message);
        }
      } catch (profileError) {
        console.error('Profile creation error:', profileError.message);
        if (profileError.response) {
          console.error('Response status:', profileError.response.status);
          console.error('Response data:', JSON.stringify(profileError.response.data, null, 2));
        }
      }
    } catch (loginError) {
      console.error('Authentication error:', loginError.message);
      if (loginError.response) {
        console.error('Response status:', loginError.response.status);
        console.error('Response data:', JSON.stringify(loginError.response.data, null, 2));
      }
    }
  } catch (error) {
    console.error('Test Error:', error.message);
  } finally {
    // Close the database connection
    try {
      await client.end();
      console.log('\nDatabase connection closed');
    } catch (err) {
      console.error('Error closing database connection:', err.message);
    }
    console.log('=== Test Complete ===');
  }
}

// Run the test
runTest(); 