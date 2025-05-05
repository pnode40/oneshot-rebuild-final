const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function directMigrate() {
  try {
    console.log('Connecting to the database...');
    const client = await pool.connect();
    console.log('Connected to the database');

    console.log('Checking if the migrations are already applied...');
    
    // Check if __drizzle_migrations table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'drizzle' 
        AND table_name = '__drizzle_migrations'
      ) as exists;
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Creating drizzle schema and migrations table...');
      await client.query(`CREATE SCHEMA IF NOT EXISTS drizzle;`);
      await client.query(`
        CREATE TABLE drizzle.__drizzle_migrations (
          id SERIAL PRIMARY KEY,
          hash TEXT NOT NULL,
          created_at BIGINT NOT NULL
        );
      `);
    }
    
    // Check if user_role enum exists
    const enumCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'user_role'
      ) as exists;
    `);
    
    // Check if tables exist
    const usersCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as exists;
    `);
    
    const profilesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
      ) as exists;
    `);
    
    console.log(`Status: 
      - user_role enum: ${enumCheck.rows[0].exists ? 'EXISTS' : 'NOT FOUND'}
      - users table: ${usersCheck.rows[0].exists ? 'EXISTS' : 'NOT FOUND'}
      - profiles table: ${profilesCheck.rows[0].exists ? 'EXISTS' : 'NOT FOUND'}
    `);
    
    // 1. Insert migration records
    console.log('Adding migration records to tracking table...');
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Check if migration records already exist
    const migrationCheck = await client.query(`
      SELECT * FROM drizzle.__drizzle_migrations 
      WHERE hash IN ('0000_red_karma', '0001_abnormal_yellowjacket');
    `);
    
    const existingMigrations = new Set(migrationCheck.rows.map(row => row.hash));
    
    if (!existingMigrations.has('0000_red_karma')) {
      await client.query(`
        INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
        VALUES ('0000_red_karma', $1);
      `, [timestamp]);
      console.log('Added 0000_red_karma to migration tracking');
    } else {
      console.log('Migration 0000_red_karma already tracked');
    }
    
    if (!existingMigrations.has('0001_abnormal_yellowjacket')) {
      await client.query(`
        INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
        VALUES ('0001_abnormal_yellowjacket', $1);
      `, [timestamp]);
      console.log('Added 0001_abnormal_yellowjacket to migration tracking');
    } else {
      console.log('Migration 0001_abnormal_yellowjacket already tracked');
    }
    
    // 2. Check if user_id column exists in profiles table
    if (profilesCheck.rows[0].exists) {
      const userIdCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'profiles'
          AND column_name = 'user_id'
        ) as exists;
      `);
      
      if (!userIdCheck.rows[0].exists) {
        console.log('Adding user_id column to profiles table...');
        // First find if any users exist to use as default
        const anyUser = await client.query(`
          SELECT id FROM users ORDER BY id LIMIT 1;
        `);
        
        const defaultUserId = anyUser.rows.length > 0 ? anyUser.rows[0].id : 1;
        
        await client.query(`
          ALTER TABLE profiles 
          ADD COLUMN user_id INTEGER NOT NULL DEFAULT ${defaultUserId};
        `);
        
        await client.query(`
          ALTER TABLE profiles 
          ADD CONSTRAINT profiles_user_id_users_id_fk 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        `);
        
        console.log('Added user_id column and foreign key constraint');
      } else {
        console.log('user_id column already exists in profiles table');
      }
    }
    
    console.log('Migration completed successfully');
    client.release();
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

directMigrate(); 