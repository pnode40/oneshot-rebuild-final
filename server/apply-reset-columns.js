const { Pool } = require('pg');
require('dotenv').config();

// Create a new Pool using the DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function applyResetColumns() {
  let client;
  
  try {
    console.log('Connecting to database...');
    client = await pool.connect();
    console.log('Connected to database');
    
    // 1. Check if columns exist
    console.log('Checking if reset columns exist...');
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('reset_token', 'reset_token_expiry');
    `);
    
    const existingColumns = checkResult.rows.map(row => row.column_name);
    console.log(`Found existing columns: ${existingColumns.join(', ') || 'none'}`);
    
    // 2. Add columns if they don't exist
    if (!existingColumns.includes('reset_token')) {
      console.log('Adding reset_token column...');
      await client.query(`ALTER TABLE "users" ADD COLUMN "reset_token" text;`);
      console.log('✅ reset_token column added');
    }
    
    if (!existingColumns.includes('reset_token_expiry')) {
      console.log('Adding reset_token_expiry column...');
      await client.query(`ALTER TABLE "users" ADD COLUMN "reset_token_expiry" timestamp with time zone;`);
      console.log('✅ reset_token_expiry column added');
    }
    
    // 3. Add index if needed
    console.log('Checking if index exists...');
    const indexResult = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'users' 
      AND indexname = 'users_reset_token_idx';
    `);
    
    if (indexResult.rows.length === 0) {
      console.log('Adding index on reset_token...');
      await client.query(`CREATE INDEX IF NOT EXISTS "users_reset_token_idx" ON "users" ("reset_token");`);
      console.log('✅ Index users_reset_token_idx created');
    } else {
      console.log('✅ Index already exists');
    }
    
    // 4. Verify columns exist after modification
    const verifyResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('reset_token', 'reset_token_expiry');
    `);
    
    const verifiedColumns = verifyResult.rows.map(row => row.column_name);
    console.log(`Verified columns: ${verifiedColumns.join(', ')}`);
    
    if (verifiedColumns.length === 2) {
      console.log('✅ All columns are in place!');
    } else {
      console.log('❌ Some columns are still missing!');
    }
    
    // 5. Also update drizzle_migrations table to mark migration as applied
    console.log('Updating migration tracking...');
    
    // Check if the migration is already recorded
    const migrationCheck = await client.query(`
      SELECT * FROM drizzle.__drizzle_migrations 
      WHERE hash = '07a8d5b4-d2ac-44d5-b4a0-2bd6fcb14c5b';
    `);
    
    if (migrationCheck.rows.length === 0) {
      // Add migration record
      const timestamp = Date.now();
      await client.query(`
        INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
        VALUES ('07a8d5b4-d2ac-44d5-b4a0-2bd6fcb14c5b', $1);
      `, [timestamp]);
      console.log('✅ Migration recorded in tracking table');
    } else {
      console.log('✅ Migration already tracked');
    }
    
    console.log('🎉 Migration process completed successfully');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (client) {
      client.release();
      console.log('Database connection released');
    }
    await pool.end();
  }
}

// Run the function
applyResetColumns(); 