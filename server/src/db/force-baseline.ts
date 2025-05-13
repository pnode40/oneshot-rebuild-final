import { spawn } from 'child_process';
import postgres from 'postgres';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * This script forces the creation of a baseline migration by:
 * 1. Dropping all tables and the drizzle schema
 * 2. Clearing migration files and meta data
 * 3. Setting up a clean journal.json
 * 4. Running drizzle-kit generate
 */
async function forceBaseline() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('🔴 DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('🔄 Step 1/4: Resetting database schema...');
  
  // Initialize database connection
  const client = postgres(databaseUrl, { 
    max: 1, 
    ssl: databaseUrl.includes('sslmode=require') ? 'require' : undefined
  });
  
  try {
    // Drop existing schemas and tables
    await client`DROP SCHEMA IF EXISTS drizzle CASCADE`;
    await client`DROP TABLE IF EXISTS public.profiles CASCADE`;
    await client`DROP TABLE IF EXISTS public.users CASCADE`;
    await client`DROP TYPE IF EXISTS public.athlete_role CASCADE`;
    await client`DROP TYPE IF EXISTS public.position_enum CASCADE`;
    await client`DROP TYPE IF EXISTS public.user_role CASCADE`;
    
    console.log('✅ Database reset complete');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }

  console.log('🔄 Step 2/4: Clearing migration files...');
  
  // Clear migrations directory
  const migrationsDir = path.resolve(process.cwd(), 'migrations');
  if (fs.existsSync(migrationsDir)) {
    // Clear all .sql files
    const sqlFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'));
      
    for (const file of sqlFiles) {
      fs.unlinkSync(path.join(migrationsDir, file));
    }
    
    // Remove meta directory
    const metaDir = path.join(migrationsDir, 'meta');
    if (fs.existsSync(metaDir)) {
      try {
        fs.rmSync(metaDir, { recursive: true, force: true });
      } catch (err) {
        console.error('❌ Error removing meta directory:', err);
      }
    }
  } else {
    // Create migrations directory if it doesn't exist
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  console.log('✅ Migration files cleared');
  
  console.log('🔄 Step 3/4: Setting up clean migration state...');
  
  // Create empty meta directory
  const metaDir = path.join(migrationsDir, 'meta');
  fs.mkdirSync(metaDir, { recursive: true });
  
  // Create empty journal file
  const journalPath = path.join(metaDir, '_journal.json');
  const journalContent = {
    version: "5",
    dialect: "pg",
    entries: []
  };
  
  fs.writeFileSync(journalPath, JSON.stringify(journalContent, null, 2));
  console.log('✅ Clean migration state created');
  
  console.log('🔄 Step 4/4: Generating baseline migration...');
  
  // Run drizzle-kit generate
  return new Promise<void>((resolve, reject) => {
    const drizzleKit = spawn('drizzle-kit', ['generate'], { 
      stdio: 'inherit',
      shell: true
    });
    
    drizzleKit.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Baseline migration generated successfully');
        console.log('💡 Next steps:');
        console.log('  1. Review the generated migration files in the migrations/ directory');
        console.log('  2. Run "npm run migrate" to apply the migration');
        resolve();
      } else {
        console.error(`❌ Error generating baseline migration (code: ${code})`);
        reject(new Error(`drizzle-kit generate failed with code ${code}`));
      }
    });
    
    drizzleKit.on('error', (err) => {
      console.error('❌ Failed to start drizzle-kit:', err);
      reject(err);
    });
  });
}

forceBaseline().catch(error => {
  console.error(error);
  process.exit(1);
}); 