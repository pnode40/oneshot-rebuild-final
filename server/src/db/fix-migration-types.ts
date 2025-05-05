/**
 * Fix Migration Types Script
 * 
 * This script corrects the type mismatch in the migration tracking table
 * by converting string timestamps to proper bigint format.
 * 
 * The issue occurs because:
 * 1. The created_at column is defined as BIGINT in the database
 * 2. But the actual values are stored as strings (e.g., "1746412721")
 * 3. This causes type mismatch issues with Drizzle ORM's migrator
 * 
 * This script:
 * 1. Converts each string timestamp to a proper bigint
 * 2. Updates the table with corrected values
 */

import { Client } from 'pg';
import dotenv from 'dotenv';
import { exit } from 'process';

dotenv.config();

async function fixMigrationTypes() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    console.log('🔍 Checking migration table...');
    
    // Check if the migration table exists
    const { rows: tableExists } = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'drizzle' 
        AND table_name = '__drizzle_migrations'
      ) as exists
    `);
    
    if (!tableExists[0].exists) {
      console.log('⚠️ Migration tracking table does not exist.');
      return;
    }

    // Verify column type
    const { rows: schema } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'drizzle' 
      AND table_name = '__drizzle_migrations'
      AND column_name = 'created_at'
    `);
    
    if (schema.length === 0 || schema[0].data_type !== 'bigint') {
      console.log(`⚠️ The created_at column is not a bigint. Found: ${schema.length > 0 ? schema[0].data_type : 'none'}`);
      console.log('No action needed or the schema is different than expected.');
      return;
    }
    
    console.log('✅ Confirmed created_at column is defined as bigint');

    // Fetch all migrations
    const { rows: migrations } = await client.query(
      'SELECT * FROM drizzle.__drizzle_migrations ORDER BY id'
    );
    
    if (migrations.length === 0) {
      console.log('ℹ️ No migrations found in the table.');
      return;
    }
    
    console.log(`📊 Found ${migrations.length} migrations to check.`);
    
    // Check types and update as needed
    let fixesApplied = 0;
    for (const migration of migrations) {
      const createdAt = migration.created_at;
      const jsType = typeof createdAt;
      
      if (jsType === 'string') {
        try {
          const parsedInt = BigInt(createdAt);
          console.log(`🔄 Converting migration ${migration.id} (${migration.hash}): "${createdAt}" to bigint`);
          
          // Update the record with proper bigint
          await client.query(`
            UPDATE drizzle.__drizzle_migrations
            SET created_at = $1::bigint
            WHERE id = $2
          `, [createdAt, migration.id]);
          
          fixesApplied++;
        } catch (e) {
          console.error(`❌ Error converting "${createdAt}" to bigint:`, e);
        }
      } else {
        console.log(`✅ Migration ${migration.id} (${migration.hash}) already has correct type: ${jsType}`);
      }
    }
    
    if (fixesApplied > 0) {
      console.log(`\n✅ Successfully applied ${fixesApplied} type fixes.`);
      console.log('The standard Drizzle migration function should now work properly.');
    } else {
      console.log('\nℹ️ No type fixes were needed.');
    }
    
    // Verify the fixes
    const { rows: verifyMigrations } = await client.query(`
      SELECT id, hash, created_at, pg_typeof(created_at) as actual_type
      FROM drizzle.__drizzle_migrations
      ORDER BY id
    `);
    
    console.log('\n📊 Verification results:');
    console.log('----------------------------------------------------------');
    console.log('| ID  | HASH                   | TYPE IN DB    | JS TYPE |');
    console.log('----------------------------------------------------------');
    
    for (const migration of verifyMigrations) {
      const id = migration.id.toString().padEnd(4);
      const hash = migration.hash.padEnd(24);
      const dbType = migration.actual_type.padEnd(13);
      const jsType = typeof migration.created_at;
      
      console.log(`| ${id}| ${hash}| ${dbType}| ${jsType.padEnd(7)} |`);
    }
    console.log('----------------------------------------------------------');
    
  } catch (error) {
    console.error('❌ Error fixing migration types:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixMigrationTypes(); 