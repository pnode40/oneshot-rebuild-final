import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const query = `
  SELECT 
    tc.constraint_name, 
    tc.table_name, 
    tc.constraint_type, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name, 
    ccu.column_name AS foreign_column_name,
    rc.update_rule,
    rc.delete_rule
  FROM 
    information_schema.table_constraints tc 
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
  WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = $1;
`;

async function checkForeignKeys() {
  if (process.argv.length < 3) {
    console.error('Please provide a table name');
    console.log('Usage: ts-node check-fk.ts <table_name>');
    process.exit(1);
  }

  const tableName = process.argv[2];
  
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    const result = await pool.query(query, [tableName]);
    
    console.log(`Foreign keys for table '${tableName}':`);
    console.table(result.rows);
    
    if (result.rows.length === 0) {
      console.log('No foreign keys found.');
    }
  } catch (err) {
    console.error('Error checking foreign keys:', err);
  } finally {
    await pool.end();
  }
}

checkForeignKeys().catch(console.error); 