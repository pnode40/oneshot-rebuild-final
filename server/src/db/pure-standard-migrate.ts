import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

async function runPureStandardMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  // List migration files for debugging
  const migrationsFolder = path.resolve(process.cwd(), './migrations');
  console.log(`\n📁 Migration folder: ${migrationsFolder}`);
  
  try {
    const files = fs.readdirSync(migrationsFolder)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`📋 Migration files found (${files.length}):`);
    files.forEach(file => console.log(`   - ${file}`));
    
    // Check meta journal file
    const journalPath = path.join(migrationsFolder, 'meta', '_journal.json');
    if (fs.existsSync(journalPath)) {
      const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
      console.log(`\n📔 Journal entries found (${journal.entries.length}):`);
      journal.entries.forEach((entry: any) => {
        console.log(`   - ${entry.hash} (${entry.comment})`);
      });
    } else {
      console.log('\n⚠️ No journal file found at:', journalPath);
    }
  } catch (err) {
    console.error('\n⚠️ Error reading migration files:', err);
  }

  const migrationClient = postgres(databaseUrl, {
    max: 1,
    ssl: databaseUrl.includes('sslmode=require') ? 'require' : undefined
  });

  try {
    console.log(`\n🔄 Running pure standard Drizzle migrations from ${migrationsFolder}...`);
    
    // Initialize Drizzle
    const db = drizzle(migrationClient);
    
    // Call the standard migrate function with no additional logic or workarounds
    await migrate(db, { 
      migrationsFolder,
      migrationsTable: 'drizzle.__drizzle_migrations'
    });
    
    console.log('✅ Standard migration process completed successfully.');
  } catch (error: any) {
    console.error('\n❌ Standard migration process failed:');
    console.error(error);
    
    if (error.message && error.message.includes('undefined.sql')) {
      console.error('\n🔍 DIAGNOSIS:');
      console.error('This is the "undefined.sql" error which occurs when the migration');
      console.error('system cannot properly map between the files in your migrations folder');
      console.error('and the entries in the drizzle.__drizzle_migrations database table.');
      
      console.error('\n💡 POSSIBLE SOLUTIONS:');
      console.error('1. Check that your _journal.json entries match your SQL files exactly');
      console.error('2. Inspect the drizzle.__drizzle_migrations table for inconsistencies');
      console.error('3. Consider using a custom migration script that rebuilds the migration state');
      console.error('4. Check for recent issues in the Drizzle ORM GitHub repository');
    }
    
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

runPureStandardMigrations(); 