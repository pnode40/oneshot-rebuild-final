const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function cleanMigrationTracking() {
  try {
    console.log('Connecting to the database...');
    const client = await pool.connect();
    console.log('Connected to the database');

    // 1. List existing migration files
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .map(file => file.replace('.sql', ''));

    console.log('Found migration files:', migrationFiles);

    // 2. Get tracked migrations
    const result = await client.query('SELECT hash FROM drizzle.__drizzle_migrations ORDER BY hash');
    const trackedMigrations = result.rows.map(row => row.hash);
    console.log('Currently tracked migrations:', trackedMigrations);

    // 3. Find migrations to remove (those tracked but files don't exist)
    const migrationsToRemove = trackedMigrations.filter(hash => !migrationFiles.includes(hash));
    console.log('Migrations to remove from tracking:', migrationsToRemove);

    // 4. Remove obsolete entries
    if (migrationsToRemove.length > 0) {
      for (const hash of migrationsToRemove) {
        await client.query('DELETE FROM drizzle.__drizzle_migrations WHERE hash = $1', [hash]);
        console.log(`Removed migration tracking for ${hash}`);
      }
    } else {
      console.log('No obsolete migrations to remove');
    }

    // 5. Verify final state
    const finalResult = await client.query('SELECT hash FROM drizzle.__drizzle_migrations ORDER BY hash');
    console.log('Final tracked migrations:', finalResult.rows.map(row => row.hash));

    client.release();
    console.log('Migration tracking cleaned up successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning migration tracking:', error);
    process.exit(1);
  }
}

cleanMigrationTracking(); 