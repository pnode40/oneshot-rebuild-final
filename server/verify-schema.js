/**
 * Schema Verification Script
 * 
 * This script compares the schema definition with the actual database structure
 * to ensure they match before generating a baseline migration.
 */

const { Client } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function verifySchema() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('🔴 DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('\n🔍 SCHEMA VERIFICATION');
  console.log('====================');
  
  const client = new Client({ connectionString: databaseUrl });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Check tables
    console.log('\n📊 Checking tables...');
    const { rows: tables } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`Found ${tables.length} tables in database:`);
    tables.forEach(t => console.log(`- ${t.table_name}`));
    
    // For each table, check columns
    const requiredTables = ['users', 'profiles'];
    const missingTables = requiredTables.filter(
      required => !tables.some(t => t.table_name === required)
    );
    
    if (missingTables.length > 0) {
      console.error(`❌ Missing tables: ${missingTables.join(', ')}`);
    } else {
      console.log('✅ All required tables exist');
    }
    
    // Check columns for profiles table
    console.log('\n📊 Checking columns in profiles table...');
    const { rows: profileColumns } = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles'
      ORDER BY ordinal_position
    `);
    
    console.log(`Found ${profileColumns.length} columns in profiles table:`);
    profileColumns.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // Verify slug column
    const slugColumn = profileColumns.find(col => col.column_name === 'slug');
    if (slugColumn) {
      console.log('\n✅ slug column exists with the following properties:');
      console.log(`- Data type: ${slugColumn.data_type}`);
      console.log(`- Nullable: ${slugColumn.is_nullable}`);
      
      // Check for unique constraint
      const { rows: constraints } = await client.query(`
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND constraint_type = 'UNIQUE'
      `);
      
      const slugConstraint = constraints.find(c => 
        c.constraint_name.includes('slug') || c.constraint_name.includes('profiles_slug')
      );
      
      if (slugConstraint) {
        console.log(`- Constraint: ${slugConstraint.constraint_name} (${slugConstraint.constraint_type})`);
      } else {
        console.error('❌ No unique constraint found for slug column');
      }
      
      // Check for index
      const { rows: indices } = await client.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = 'profiles'
          AND indexname = 'profiles_slug_idx'
      `);
      
      if (indices.length > 0) {
        console.log(`- Index: ${indices[0].indexname}`);
      } else {
        console.error('❌ No index found for slug column');
      }
    } else {
      console.error('❌ slug column not found in profiles table');
    }
    
    // Check columns for users table
    console.log('\n📊 Checking columns in users table...');
    const { rows: userColumns } = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log(`Found ${userColumns.length} columns in users table:`);
    userColumns.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // Check enum types
    console.log('\n📊 Checking enum types...');
    
    // Try to get enum types using a more reliable method
    const { rows: pgEnum } = await client.query(`
      SELECT
        n.nspname AS schema,
        t.typname AS name,
        e.enumlabel AS value
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      ORDER BY t.typname, e.enumsortorder
    `);
    
    // Group enum values by type
    const enumTypes = {};
    pgEnum.forEach(row => {
      if (!enumTypes[row.name]) {
        enumTypes[row.name] = [];
      }
      enumTypes[row.name].push(row.value);
    });
    
    console.log(`Found ${Object.keys(enumTypes).length} enum types in database:`);
    Object.entries(enumTypes).forEach(([name, values]) => {
      console.log(`- ${name}: [${values.join(', ')}]`);
    });
    
    console.log('\n📝 Schema verification complete!');
    
  } catch (error) {
    console.error('❌ Error verifying schema:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifySchema(); 