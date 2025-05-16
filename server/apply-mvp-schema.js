/**
 * Direct SQL migration script for MVP schema
 */
const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

async function applyMvpSchema() {
  console.log('🔄 Applying MVP Schema Directly...');
  console.log('---------------------------------');
  
  // Read SQL file
  const sqlPath = './migrations/0005_mvp_schema.sql';
  
  try {
    console.log(`Reading SQL from ${sqlPath}...`);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Connect to database
    console.log('Connecting to database...');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    const client = await pool.connect();
    console.log('Connected to database');
    
    try {
      // Execute SQL
      console.log('Executing SQL migration...');
      await client.query(sql);
      console.log('✅ SQL migration executed successfully');
      
      // Update migrations tracking table
      console.log('Updating migration tracking...');
      await client.query(`
        INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
        VALUES ('0005_mvp_schema', $1)
        ON CONFLICT DO NOTHING
      `, [Date.now()]);
      console.log('✅ Migration tracking updated');
      
      console.log('\n🎉 MVP Schema successfully applied!');
      
      // Verify tables were created
      const tableCheckResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('athlete_profiles', 'media_items');
      `);
      
      if (tableCheckResult.rows.length === 2) {
        console.log('✅ Verified both tables were created:');
        tableCheckResult.rows.forEach(row => {
          console.log(`   - ${row.table_name}`);
        });
      } else {
        console.log(`⚠️ Not all tables were found. Found ${tableCheckResult.rows.length} of 2 expected tables.`);
      }
      
      // Verify enums were created
      const enumCheckResult = await client.query(`
        SELECT typname 
        FROM pg_type 
        WHERE typname IN ('sports_enum', 'football_positions_enum', 'visibility_enum', 'commitment_status_enum', 'media_type_enum');
      `);
      
      console.log(`✅ Verified ${enumCheckResult.rows.length} enums were created:`);
      enumCheckResult.rows.forEach(row => {
        console.log(`   - ${row.typname}`);
      });
      
    } finally {
      // Release client
      client.release();
    }
    
    // Close pool
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error applying MVP schema:', error);
    process.exit(1);
  }
}

// Run the function
applyMvpSchema(); 