const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function executeSQL() {
  try {
    console.log('Connecting to the database...');
    const client = await pool.connect();
    console.log('Connected to the database');

    // SQL commands from the migration
    const sqlCommands = [
      'ALTER TABLE "profiles" ADD COLUMN "user_id" integer NOT NULL DEFAULT 1',
      'ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade'
    ];

    // Execute each SQL command
    for (const sql of sqlCommands) {
      try {
        console.log(`Executing SQL: ${sql}`);
        await client.query(sql);
        console.log('SQL executed successfully');
      } catch (err) {
        if (err.code === '42701') {
          // Column already exists, skip this error
          console.log('Column user_id already exists, skipping');
        } else if (err.code === '42710') {
          // Constraint already exists, skip this error
          console.log('Constraint already exists, skipping');
        } else {
          console.error('SQL execution error:', err);
        }
      }
    }

    // Release the client back to the pool
    client.release();
    console.log('All SQL commands executed');
    
    // Exit the process
    process.exit(0);
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
}

// Execute the function
executeSQL(); 