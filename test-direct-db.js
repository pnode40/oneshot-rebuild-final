const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://OneShotMay25_owner:npg_OPr6NdBp0QVH@ep-wispy-lab-a5ldd1qu-pooler.us-east-2.aws.neon.tech/OneShotMay25?sslmode=require"
});

async function testDirectDB() {
  try {
    console.log('=== Testing Direct Database Access ===\n');
    
    // First, create a test user
    const userResult = await pool.query(`
      INSERT INTO users (email, hashed_password, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email
    `, [`test${Date.now()}@example.com`, 'hashedpassword', 'Test', 'User', 'athlete']);
    
    const userId = userResult.rows[0].id;
    console.log('Created user:', userResult.rows[0]);
    
    // Now create a profile for this user
    const profileResult = await pool.query(`
      INSERT INTO profiles (
        user_id, 
        first_name, 
        last_name, 
        full_name,
        sport,
        position,
        grad_year,
        high_school,
        location,
        height,
        weight,
        custom_url_slug
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, first_name, last_name, position
    `, [
      userId,
      'Test',
      'User', 
      'Test User',
      'football',
      'Quarterback',
      2026,
      'Test High School',
      'Dallas, TX',
      "6'2\"",
      200,
      `test-user-${Date.now()}`
    ]);
    
    console.log('Created profile:', profileResult.rows[0]);
    console.log('\n✓ Direct database access works!');
    
  } catch (error) {
    console.error('Database error:', error.message);
    console.error('Detail:', error.detail);
  } finally {
    await pool.end();
  }
}

testDirectDB(); 