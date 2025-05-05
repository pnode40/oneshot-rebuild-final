const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixMigrationTracking() {
  try {
    console.log('Connecting to the database...');
    const client = await pool.connect();
    console.log('Connected to the database');

    // Check if migrations table exists
    const tableCheck = await client.query(`
      SELECT EXISTS(
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'drizzle' AND table_name = '__drizzle_migrations'
      ) as exists
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('Migration table does not exist, creating...');
      await client.query(`
        CREATE SCHEMA IF NOT EXISTS drizzle;
        CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
          hash text PRIMARY KEY,
          created_at integer
        );
      `);
      console.log('Migration table created');
    }

    // SQL commands to add migration entries
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    const sqlCommands = [
      `INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
       VALUES ('0000_red_karma', ${currentTimestamp})
       ON CONFLICT (hash) DO NOTHING`,
       
      `INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
       VALUES ('0001_abnormal_yellowjacket', ${currentTimestamp})
       ON CONFLICT (hash) DO NOTHING`
    ];

    // Execute each SQL command
    for (const sql of sqlCommands) {
      try {
        console.log(`Executing SQL: ${sql}`);
        const result = await client.query(sql);
        console.log(`SQL executed successfully. Rows affected: ${result.rowCount}`);
      } catch (err) {
        console.error('SQL execution error:', err);
      }
    }
    
    // Check what migrations are now tracked
    const currentMigrations = await client.query(`
      SELECT hash FROM drizzle.__drizzle_migrations ORDER BY hash
    `);
    
    console.log('Currently tracked migrations:');
    currentMigrations.rows.forEach(row => {
      console.log(`- ${row.hash}`);
    });

    // Release the client back to the pool
    client.release();
    console.log('Migration tracking fixes completed');
    
    // Exit the process
    process.exit(0);
  } catch (err) {
    console.error('Database operation error:', err);
    process.exit(1);
  }
}

// Execute the function
fixMigrationTracking(); 