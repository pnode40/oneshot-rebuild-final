import { Pool } from 'pg';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const createProfilesTable = async () => {
  try {
    console.log('Creating profiles table if it does not exist...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(256) NOT NULL,
        email VARCHAR(256) NOT NULL,
        high_school VARCHAR(256) NOT NULL,
        position VARCHAR(128) NOT NULL,
        grad_year VARCHAR(8),
        city_state VARCHAR(128),
        height_ft VARCHAR(4),
        height_in VARCHAR(4),
        weight VARCHAR(8),
        forty_yard_dash VARCHAR(8),
        bench_press VARCHAR(8),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    await pool.query(createTableSQL);
    console.log('Profiles table created or already exists.');
  } catch (error) {
    console.error('Error creating profiles table:', error);
  } finally {
    await pool.end();
  }
};

createProfilesTable(); 