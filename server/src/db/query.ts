import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function runQuery() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Connecting to database...');
    const result = await pool.query('SELECT * FROM profiles ORDER BY id DESC LIMIT 1');
    console.log('Latest profile:');
    console.log(JSON.stringify(result.rows[0], null, 2));
  } catch (error) {
    console.error('Error executing query:', error);
  } finally {
    await pool.end();
  }
}

runQuery(); 