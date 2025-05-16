/**
 * Direct migration script for applying SQL migrations
 */

const { migrate } = require('drizzle-orm/postgres-js/migrator');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config();

async function runMigration() {
  console.log('Starting migration process...');
  
  const sql = postgres(process.env.DATABASE_URL);
  const db = drizzle(sql);
  
  try {
    console.log('Running migrations from ./migrations folder');
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('✅ Migration successful');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await sql.end();
    console.log('DB connection closed');
  }
}

runMigration(); 