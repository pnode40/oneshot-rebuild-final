const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// List of migrations to mark as applied
const migrations = [
  '0000_red_karma',
  '0001_abnormal_yellowjacket'
];

async function fixMigrations() {
  try {
    console.log('Connecting to the database...');
    const client = await pool.connect();
    console.log('Connected to the database');

    // First check the structure of the __drizzle_migrations table
    console.log('Checking __drizzle_migrations table structure...');
    const tableCheck = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'drizzle' AND table_name = '__drizzle_migrations'
      ORDER BY ordinal_position
    `);
    
    console.log('Table structure:', tableCheck.rows);

    // Process each migration
    for (const migration of migrations) {
      // Check if the migration is already in the table
      const existingCheck = await client.query(`
        SELECT * FROM drizzle.__drizzle_migrations 
        WHERE hash = $1
      `, [migration]);

      if (existingCheck.rows.length > 0) {
        console.log(`Migration ${migration} already exists:`, existingCheck.rows);
      } else {
        // Insert the migration record
        const migrationInsert = await client.query(`
          INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
          VALUES ($1, extract(epoch from now())::bigint)
          RETURNING *
        `, [migration]);
        
        console.log(`Migration ${migration} inserted:`, migrationInsert.rows);
      }
    }

    // Release the client back to the pool
    client.release();
    console.log('Migration fix completed');
    
    // Exit the process
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    
    // If we got a syntax error, try with different column structure
    if (err.code === '42601' || err.code === '42P01') {
      console.log('Error with initial query. Trying alternative table structures...');
      
      try {
        const client = await pool.connect();
        
        // Try with a different schema
        const schemaCheck = await client.query(`
          SELECT schema_name FROM information_schema.schemata 
          WHERE schema_name LIKE '%drizzle%'
        `);
        console.log('Available schemas:', schemaCheck.rows);
        
        // Check if the table exists
        const tableExistsCheck = await client.query(`
          SELECT tablename FROM pg_tables 
          WHERE schemaname = 'public' AND tablename = '__drizzle_migrations'
        `);
        
        if (tableExistsCheck.rows.length > 0) {
          console.log('Found __drizzle_migrations in public schema');
          
          // Check columns in public schema
          const colCheck = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = '__drizzle_migrations'
            ORDER BY ordinal_position
          `);
          
          console.log('Columns in public schema:', colCheck.rows);
          
          // Process each migration in public schema
          for (const migration of migrations) {
            // Check if migration exists in public schema
            const publicCheck = await client.query(`
              SELECT * FROM public.__drizzle_migrations 
              WHERE hash = $1
            `, [migration]);
            
            if (publicCheck.rows.length > 0) {
              console.log(`Migration ${migration} already tracked in public schema:`, publicCheck.rows);
            } else {
              // Try inserting in public schema
              const publicInsert = await client.query(`
                INSERT INTO public.__drizzle_migrations (hash, created_at)
                VALUES ($1, extract(epoch from now())::bigint)
                RETURNING *
              `, [migration]);
              
              console.log(`Migration ${migration} inserted into public schema:`, publicInsert.rows);
            }
          }
        } else {
          console.log('Table not found in public schema');
        }
        
        client.release();
      } catch (fallbackErr) {
        console.error('Error in fallback attempt:', fallbackErr);
      }
    }
    
    process.exit(1);
  }
}

// Execute the function
fixMigrations(); 