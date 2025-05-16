const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function executeSQL() {
  try {
    console.log('Connecting to the database...');
    const client = await pool.connect();
    console.log('Connected to the database');
    
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'migrations', '0005_extend_profiles_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Executing SQL...');
    await client.query(sql);
    console.log('SQL executed successfully');
    
    // Query to verify some of the new columns were added
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'profiles'
      ORDER BY column_name
    `);
    
    console.log('Profile table columns:');
    result.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type}`);
    });
    
    client.release();
    console.log('Profile table extension completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error executing SQL:', error);
    process.exit(1);
  }
}

executeSQL(); 