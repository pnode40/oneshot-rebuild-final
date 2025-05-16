const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Create a new Pool using the DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function createTestUser() {
  let client;
  
  try {
    console.log('👤 Creating Test User');
    console.log('---------------------------------');
    
    client = await pool.connect();
    console.log('Connected to database');

    // Check if test user already exists
    const checkResult = await client.query(`
      SELECT id, email FROM users WHERE email = 'test@oneshot.com';
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Test user already exists:');
      console.log(`   - ID: ${checkResult.rows[0].id}`);
      console.log(`   - Email: ${checkResult.rows[0].email}`);
      return;
    }
    
    // Hash the password
    const password = 'Password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create a test user
    const result = await client.query(`
      INSERT INTO users (
        email, 
        hashed_password, 
        is_verified, 
        role, 
        first_name, 
        last_name
      ) VALUES (
        'test@oneshot.com', 
        $1, 
        true, 
        'athlete', 
        'Test', 
        'User'
      ) RETURNING id, email;
    `, [hashedPassword]);
    
    if (result.rows.length > 0) {
      console.log('✅ Created test user:');
      console.log(`   - ID: ${result.rows[0].id}`);
      console.log(`   - Email: ${result.rows[0].email}`);
      console.log(`   - Password: ${password}`);
    } else {
      console.log('❌ Failed to create test user');
    }
    
  } catch (error) {
    console.error('\n❌ Failed to create test user:', error.message);
  } finally {
    if (client) {
      client.release();
      console.log('Database connection released');
    }
    await pool.end();
  }
}

// Run the function
createTestUser(); 