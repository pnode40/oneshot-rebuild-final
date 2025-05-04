const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function createTestUser() {
  try {
    console.log('Connecting to the database...');
    const client = await pool.connect();
    console.log('Connected to the database');

    // Check if the test user already exists
    const checkUserQuery = 'SELECT * FROM users WHERE email = $1';
    const checkResult = await client.query(checkUserQuery, ['test@example.com']);
    
    if (checkResult.rows.length > 0) {
      console.log('Test user already exists:', {
        id: checkResult.rows[0].id,
        email: checkResult.rows[0].email,
        role: checkResult.rows[0].role
      });
      
      // Release the client back to the pool
      client.release();
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Insert the test user
    const insertUserQuery = `
      INSERT INTO users (
        email, 
        hashed_password, 
        first_name, 
        last_name, 
        role, 
        is_verified
      ) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, role
    `;
    
    const insertValues = [
      'test@example.com',
      hashedPassword,
      'Test',
      'User',
      'athlete',
      true
    ];
    
    const insertResult = await client.query(insertUserQuery, insertValues);
    console.log('Test user created:', insertResult.rows[0]);
    
    // Release the client back to the pool
    client.release();
  } catch (err) {
    console.error('Error creating test user:', err);
    process.exit(1);
  }
}

// Execute the function
createTestUser(); 