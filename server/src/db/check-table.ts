import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function checkTable(tableName: string) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    // Parse schema and table name
    let schema = 'public';
    let table = tableName;
    
    if (tableName.includes('.')) {
      const parts = tableName.split('.');
      schema = parts[0];
      table = parts[1];
    }
    
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = $1 AND table_name = $2
      ) as exists
    `, [schema, table]);
    
    const tableExists = tableCheck.rows[0].exists;
    console.log(`Table ${schema}.${table} exists: ${tableExists}`);
    
    if (!tableExists) {
      console.log('Table does not exist.');
      return;
    }
    
    // Get table structure
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position
    `, [schema, table]);
    
    console.log(`\nTable ${schema}.${table} structure:`);
    console.table(columns.rows);
    
    // Count records
    const countResult = await client.query(`SELECT COUNT(*) FROM ${schema}.${table}`);
    console.log(`\nTotal records: ${countResult.rows[0].count}`);
    
  } catch (error) {
    console.error('Error checking table:', error);
  } finally {
    await client.end();
  }
}

// Get table name from command line
const tableName = process.argv[2];

if (!tableName) {
  console.error('Please provide a table name');
  console.error('Usage: ts-node check-table.ts <table_name>');
  console.error('For schema-qualified tables: ts-node check-table.ts <schema>.<table_name>');
  process.exit(1);
}

// Run the check
checkTable(tableName)
  .then(() => console.log('Table check completed'))
  .catch(err => {
    console.error('Table check error:', err);
    process.exit(1);
  }); 