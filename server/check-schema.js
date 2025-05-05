const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkSchema() {
  try {
    console.log('Connecting to the database...');
    const client = await pool.connect();
    console.log('Connected to the database');

    // Check profiles table structure
    console.log('Checking profiles table structure...');
    const profilesColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'profiles'
      ORDER BY ordinal_position
    `);
    
    console.log('Profiles table columns:', profilesColumns.rows);

    // Check if user_id column exists
    const userIdExists = profilesColumns.rows.some(col => col.column_name === 'user_id');
    console.log('user_id column exists:', userIdExists);

    // Check foreign keys on profiles table
    console.log('Checking foreign keys on profiles table...');
    const foreignKeys = await client.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE
        tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'profiles'
        AND tc.table_schema = 'public'
    `);
    
    console.log('Foreign keys on profiles table:', foreignKeys.rows);

    // Release the client back to the pool
    client.release();
    console.log('Schema check completed');
    
    // Exit the process
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

// Execute the function
checkSchema(); 