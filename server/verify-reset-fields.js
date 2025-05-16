const { Pool } = require('pg');
require('dotenv').config();

// Create a new Pool using the DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function verifyResetFields() {
  let client;
  
  try {
    console.log('🔍 Verifying Reset Password Fields');
    console.log('---------------------------------');
    
    client = await pool.connect();
    console.log('Connected to database');
    
    // 1. Verify columns exist in the database
    console.log('\n1. Checking if reset columns exist in database:');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('reset_token', 'reset_token_expiry');
    `);
    
    if (columnsResult.rows.length === 0) {
      console.log('❌ No reset columns found in the database!');
    } else {
      console.log('✅ Found the following reset columns:');
      columnsResult.rows.forEach(row => {
        console.log(`   - ${row.column_name} (${row.data_type}, ${row.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
      });
    }
    
    // 2. Check if index exists
    console.log('\n2. Checking if reset_token index exists:');
    const indexResult = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes 
      WHERE tablename = 'users' 
      AND indexname = 'users_reset_token_idx';
    `);
    
    if (indexResult.rows.length === 0) {
      console.log('❌ Reset token index not found!');
    } else {
      console.log('✅ Found index:');
      console.log(`   - ${indexResult.rows[0].indexname}: ${indexResult.rows[0].indexdef}`);
    }
    
    // 3. Check if migration is tracked
    console.log('\n3. Checking if migration is tracked:');
    const migrationResult = await client.query(`
      SELECT * FROM drizzle.__drizzle_migrations 
      WHERE hash = '07a8d5b4-d2ac-44d5-b4a0-2bd6fcb14c5b';
    `);
    
    if (migrationResult.rows.length === 0) {
      console.log('❌ Migration not found in tracking table!');
    } else {
      console.log('✅ Migration is tracked:');
      console.log(`   - ID: ${migrationResult.rows[0].id}`);
      console.log(`   - Hash: ${migrationResult.rows[0].hash}`);
      console.log(`   - Created at: ${new Date(migrationResult.rows[0].created_at).toLocaleString()}`);
    }
    
    // 4. Test creating a reset token for a user
    console.log('\n4. Testing reset token creation for a user:');
    
    // Find a user to test with
    const userResult = await client.query(`
      SELECT id, email FROM users LIMIT 1;
    `);
    
    if (userResult.rows.length === 0) {
      console.log('❌ No users found to test with!');
    } else {
      const user = userResult.rows[0];
      console.log(`   Found user: ID ${user.id}, Email: ${user.email}`);
      
      // Try to add a test reset token
      const testToken = 'test_reset_token_' + Date.now();
      const testExpiry = new Date(Date.now() + 3600000); // 1 hour from now
      
      try {
        await client.query(`
          UPDATE users 
          SET reset_token = $1, reset_token_expiry = $2
          WHERE id = $3;
        `, [testToken, testExpiry, user.id]);
        
        console.log('✅ Successfully added test reset token to user');
        
        // Verify it was added
        const verifyResult = await client.query(`
          SELECT reset_token, reset_token_expiry 
          FROM users 
          WHERE id = $1;
        `, [user.id]);
        
        if (verifyResult.rows[0].reset_token === testToken) {
          console.log('✅ Verified token was set correctly in database');
          console.log(`   - Token: ${verifyResult.rows[0].reset_token}`);
          console.log(`   - Expiry: ${verifyResult.rows[0].reset_token_expiry}`);
        } else {
          console.log('❌ Token verification failed!');
        }
        
        // Clean up test token
        await client.query(`
          UPDATE users 
          SET reset_token = NULL, reset_token_expiry = NULL
          WHERE id = $1;
        `, [user.id]);
        
        console.log('✅ Cleaned up test token');
      } catch (error) {
        console.error('❌ Error testing reset token:', error.message);
      }
    }
    
    console.log('\n✅ Reset fields verification completed');
    
  } catch (error) {
    console.error('\n❌ Verification failed with error:', error.message);
  } finally {
    if (client) {
      client.release();
      console.log('Database connection released');
    }
    await pool.end();
  }
}

// Run the verification
verifyResetFields(); 