import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

/**
 * Fix the data type of created_at in the drizzle.__drizzle_migrations table
 * This is to address the root cause of the "undefined.sql" error in the Drizzle migrator
 */
async function fixMigrationTypes() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    await client.connect();
    console.log('Connected to database, starting migration type fix');

    // 1. Check current table structure
    const { rows: columnInfo } = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns
      WHERE table_schema = 'drizzle' AND table_name = '__drizzle_migrations'
    `);
    
    console.log('Current table structure:');
    columnInfo.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}, Nullable: ${col.is_nullable}`);
    });
    
    // 2. Create a backup of the current migrations table
    console.log('\nCreating backup of migration table...');
    
    await client.query(`DROP TABLE IF EXISTS drizzle.__drizzle_migrations_backup`);
    await client.query(`
      CREATE TABLE drizzle.__drizzle_migrations_backup AS 
      SELECT * FROM drizzle.__drizzle_migrations
    `);
    
    const { rowCount: backupCount } = await client.query(`SELECT COUNT(*) FROM drizzle.__drizzle_migrations_backup`);
    console.log(`Backup created with ${backupCount} rows`);
    
    // 3. Get current migration entries to restore later
    const { rows: migrations } = await client.query(`
      SELECT id, hash, created_at FROM drizzle.__drizzle_migrations ORDER BY id
    `);
    
    console.log(`Found ${migrations.length} migrations to convert`);
    
    // 4. Drop and recreate the migrations table with proper types
    console.log('\nRecreating migrations table with proper column types...');
    
    await client.query(`DROP TABLE drizzle.__drizzle_migrations`);
    await client.query(`
      CREATE TABLE drizzle.__drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash TEXT NOT NULL,
        created_at BIGINT NOT NULL
      )
    `);
    
    // 5. Insert the migrations with proper numeric timestamps
    console.log('Inserting migrations with correct data types...');
    
    for (const migration of migrations) {
      const createdAt = parseInt(migration.created_at, 10);
      if (isNaN(createdAt)) {
        throw new Error(`Invalid created_at value for migration ${migration.hash}: ${migration.created_at}`);
      }
      
      await client.query(
        `INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at) VALUES ($1, $2, $3)`,
        [migration.id, migration.hash, createdAt]
      );
      
      console.log(`- Converted migration ${migration.hash}, created_at: ${migration.created_at} (string) -> ${createdAt} (number)`);
    }
    
    // 6. Verify the migrations table now has the correct types
    const { rows: verifyColumns } = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns
      WHERE table_schema = 'drizzle' AND table_name = '__drizzle_migrations'
    `);
    
    console.log('\nVerifying new table structure:');
    verifyColumns.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}, Nullable: ${col.is_nullable}`);
    });
    
    // 7. Verify the data was correctly converted
    const { rows: verifyData } = await client.query(`
      SELECT id, hash, created_at, pg_typeof(created_at) as created_at_type 
      FROM drizzle.__drizzle_migrations 
      ORDER BY id
    `);
    
    console.log('\nVerifying migration data with correct types:');
    verifyData.forEach(row => {
      console.log(`- ID: ${row.id}, Hash: ${row.hash}, Created At: ${row.created_at} (${row.created_at_type})`);
    });
    
    console.log('\n✅ Migration table types fixed successfully!');
    console.log('You can now run "npm run migrate" with the standard Drizzle migrate script');
    
  } catch (error) {
    console.error('Error fixing migration types:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Execute the fix
fixMigrationTypes(); 