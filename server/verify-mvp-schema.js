/**
 * MVP Schema Verification Script
 */
const { Pool } = require('pg');
require('dotenv').config();

async function verifyMvpSchema() {
  console.log('🔍 Verifying MVP Schema...');
  console.log('---------------------------------');
  
  try {
    // Connect to database
    console.log('Connecting to database...');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    const client = await pool.connect();
    console.log('Connected to database');
    
    try {
      // Check if users table has last_login_at column
      console.log('\n📋 Checking users table:');
      const usersResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'last_login_at';
      `);
      
      if (usersResult.rows.length > 0) {
        console.log('✅ users.last_login_at column exists');
        console.log(`   - Type: ${usersResult.rows[0].data_type}`);
      } else {
        console.log('❌ users.last_login_at column is missing');
      }
      
      // Check if enum types exist
      console.log('\n📋 Checking enum types:');
      const enumTypes = [
        'sports_enum', 
        'football_positions_enum', 
        'visibility_enum', 
        'commitment_status_enum', 
        'media_type_enum'
      ];
      
      const enumsResult = await client.query(`
        SELECT typname, string_agg(enumlabel, ', ') as values
        FROM pg_type 
        JOIN pg_enum ON pg_enum.enumtypid = pg_type.oid
        WHERE typname = ANY($1)
        GROUP BY typname;
      `, [enumTypes]);
      
      if (enumsResult.rows.length === enumTypes.length) {
        console.log(`✅ All ${enumTypes.length} enum types exist`);
        enumsResult.rows.forEach(row => {
          console.log(`   - ${row.typname}: ${row.values}`);
        });
      } else {
        console.log(`❌ Only ${enumsResult.rows.length} of ${enumTypes.length} enum types exist`);
        enumsResult.rows.forEach(row => {
          console.log(`   - ${row.typname}`);
        });
        
        const missingEnums = enumTypes.filter(type => !enumsResult.rows.find(row => row.typname === type));
        console.log('   Missing enums:', missingEnums.join(', '));
      }
      
      // Check if athlete_profiles table exists with all columns
      console.log('\n📋 Checking athlete_profiles table:');
      const athleteProfilesResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'athlete_profiles' 
        ORDER BY ordinal_position;
      `);
      
      if (athleteProfilesResult.rows.length > 0) {
        console.log(`✅ athlete_profiles table exists with ${athleteProfilesResult.rows.length} columns`);
        console.log('   Key columns:');
        const keyColumns = ['user_id', 'first_name', 'last_name', 'sport', 'positions', 'visibility'];
        keyColumns.forEach(col => {
          const column = athleteProfilesResult.rows.find(row => row.column_name === col);
          if (column) {
            console.log(`   - ${col}: ${column.data_type}`);
          } else {
            console.log(`   - ❌ ${col}: MISSING`);
          }
        });
      } else {
        console.log('❌ athlete_profiles table is missing');
      }
      
      // Check if media_items table exists with all columns
      console.log('\n📋 Checking media_items table:');
      const mediaItemsResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'media_items' 
        ORDER BY ordinal_position;
      `);
      
      if (mediaItemsResult.rows.length > 0) {
        console.log(`✅ media_items table exists with ${mediaItemsResult.rows.length} columns`);
        console.log('   Key columns:');
        const keyColumns = ['id', 'athlete_profile_user_id', 'title', 'media_type', 'is_featured'];
        keyColumns.forEach(col => {
          const column = mediaItemsResult.rows.find(row => row.column_name === col);
          if (column) {
            console.log(`   - ${col}: ${column.data_type}`);
          } else {
            console.log(`   - ❌ ${col}: MISSING`);
          }
        });
      } else {
        console.log('❌ media_items table is missing');
      }
      
      // Check if indexes exist
      console.log('\n📋 Checking indexes:');
      const indexResult = await client.query(`
        SELECT tablename, indexname
        FROM pg_indexes
        WHERE tablename IN ('athlete_profiles', 'media_items');
      `);
      
      if (indexResult.rows.length > 0) {
        console.log(`✅ Found ${indexResult.rows.length} indexes:`);
        indexResult.rows.forEach(row => {
          console.log(`   - ${row.tablename}.${row.indexname}`);
        });
      } else {
        console.log('❌ No indexes found');
      }
      
      console.log('\n✅ MVP Schema verification completed');
    } finally {
      // Release client
      client.release();
    }
    
    // Close pool
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error verifying MVP schema:', error);
    process.exit(1);
  }
}

// Run the function
verifyMvpSchema(); 