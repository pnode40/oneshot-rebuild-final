// Simple script to apply our custom migration directly
const fs = require('fs');
const { Pool } = require('pg');
// Use direct connection string instead of relying on dotenv
const DATABASE_URL = 'postgresql://OneShotMay25_owner:npg_OPr6NdBp0QVH@ep-wispy-lab-a5ldd1qu-pooler.us-east-2.aws.neon.tech/OneShotMay25?sslmode=require';

async function applyMigration() {
  console.log('Starting migration...');
  
  // Read the migration SQL
  const sql = fs.readFileSync('./migrations/0003_add_missing_columns.sql', 'utf8');
  console.log('Migration SQL:', sql);
  
  // Connect to the database
  const pool = new Pool({
    connectionString: DATABASE_URL
  });
  
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    console.log('Applying migration...');
    await client.query(sql);
    
    console.log('Migration applied successfully!');
    client.release();
  } catch (error) {
    console.error('Error applying migration:', error);
  } finally {
    await pool.end();
  }
}

// Run the migration
applyMigration(); 