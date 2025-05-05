/**
 * Utility script to query and display the migration table contents
 * This script helps debug issues with the Drizzle migration system
 */

import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

function formatTimestamp(timestamp: any): string {
  // Handle different types of timestamp values
  try {
    if (typeof timestamp === 'string') {
      // Try to parse the string as a number first
      const num = parseInt(timestamp, 10);
      if (!isNaN(num)) {
        // If it's a valid number as string, use that
        return new Date(num).toISOString().replace('T', ' ').substring(0, 19);
      }
      // Otherwise try to parse directly as a date string
      return new Date(timestamp).toISOString().replace('T', ' ').substring(0, 19);
    } else if (typeof timestamp === 'number') {
      return new Date(timestamp).toISOString().replace('T', ' ').substring(0, 19);
    } else {
      return `${timestamp} (unparseable)`;
    }
  } catch (e) {
    return `${timestamp} (invalid date)`;
  }
}

async function queryMigrationTable() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    console.log('🔍 Querying the migration tracking table...');
    
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

    // Query migration entries
    const { rows: migrations } = await client.query(
      'SELECT * FROM drizzle.__drizzle_migrations ORDER BY id'
    );
    
    console.log(`\n📋 Migration entries (${migrations.length}):`);
    console.log('--------------------------------------------------------');
    console.log('| ID  | HASH                   | CREATED_AT           |');
    console.log('--------------------------------------------------------');
    
    for (const migration of migrations) {
      // Format for cleaner display
      const id = migration.id.toString().padEnd(4);
      const hash = migration.hash.padEnd(24);
      const createdAt = formatTimestamp(migration.created_at);
      
      console.log(`| ${id}| ${hash}| ${createdAt} |`);
    }
    console.log('--------------------------------------------------------');
    
    // Check for duplicates
    const hashCounts = migrations.reduce((acc: any, curr: any) => {
      acc[curr.hash] = (acc[curr.hash] || 0) + 1;
      return acc;
    }, {});
    
    const duplicates = Object.entries(hashCounts)
      .filter(([_, count]) => (count as number) > 1)
      .map(([hash]) => hash);
    
    if (duplicates.length > 0) {
      console.log('\n⚠️ DUPLICATE ENTRIES DETECTED:');
      for (const duplicate of duplicates) {
        const dupes = migrations.filter(m => m.hash === duplicate);
        console.log(`  Hash "${duplicate}" appears ${dupes.length} times with IDs: ${dupes.map(d => d.id).join(', ')}`);
      }
    } else {
      console.log('\n✅ No duplicate entries found.');
    }
    
    // Check data types
    const createdAtTypes = new Set(migrations.map(m => typeof m.created_at));
    console.log('\n📊 Data type of created_at field:', Array.from(createdAtTypes).join(', '));
    
    // Show raw values to aid debugging
    console.log('\n🔢 Raw created_at values:');
    migrations.forEach(m => console.log(`  ID ${m.id}, hash ${m.hash}, created_at: ${m.created_at} (${typeof m.created_at})`));
    
    // Print schema of the migration table
    const { rows: schema } = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'drizzle'
      AND table_name = '__drizzle_migrations'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Migration table schema:');
    console.log('--------------------------------------------------');
    console.log('| COLUMN_NAME    | DATA_TYPE    | IS_NULLABLE   |');
    console.log('--------------------------------------------------');
    
    for (const column of schema) {
      const name = column.column_name.padEnd(15);
      const type = column.data_type.padEnd(13);
      const nullable = column.is_nullable.padEnd(14);
      
      console.log(`| ${name}| ${type}| ${nullable}|`);
    }
    console.log('--------------------------------------------------');
    
  } catch (error) {
    console.error('❌ Error querying migration table:', error);
  } finally {
    await client.end();
  }
}

queryMigrationTable(); 