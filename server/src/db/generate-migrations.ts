import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script to generate migrations from the schema definition.
 * This uses drizzle-kit's generate command to create migration files.
 */
async function generateMigrations() {
  console.log('🔍 Checking configuration...');
  
  // Verify drizzle.config.ts exists
  const configPath = path.resolve(process.cwd(), 'drizzle.config.ts');
  if (!fs.existsSync(configPath)) {
    console.error('❌ drizzle.config.ts not found!');
    console.log('💡 Please create a drizzle.config.ts file at the root of your project.');
    process.exit(1);
  }
  
  // Verify schema file exists
  const schemaPath = path.resolve(process.cwd(), 'src/db/schema.ts');
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found at src/db/schema.ts');
    process.exit(1);
  }

  console.log('✅ Configuration verified');
  console.log('🚀 Generating migrations...');

  // Create migrations directory if it doesn't exist
  const migrationsDir = path.resolve(process.cwd(), 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    console.log('📁 Created migrations directory');
  }

  // Remove the meta folder if it exists to force a clean state
  const metaDir = path.resolve(migrationsDir, 'meta');
  if (fs.existsSync(metaDir)) {
    console.log('🗑️ Removing existing meta directory to force a clean state...');
    fs.rmSync(metaDir, { recursive: true, force: true });
  }

  // Run drizzle-kit generate command with specific flags
  const nodePath = process.execPath; // Path to the current Node.js executable
  const drizzleKitScriptPath = path.resolve(process.cwd(), 'node_modules/drizzle-kit/bin.cjs');
  const args = [
    drizzleKitScriptPath, 
    'generate:pg',  // Explicitly use postgres dialect
    '--schema', './src/db/schema.ts',
    '--out', './migrations',
    '--clear'  // Force clearing any existing state
  ];
  
  return new Promise<void>((resolve, reject) => {
    const proc = spawn(nodePath, args, { stdio: 'inherit' });
    
    proc.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Migration files generated successfully');
        console.log('💡 Next steps:');
        console.log('  1. Review the generated migration files in the "migrations" directory');
        console.log('  2. Run "npm run migrate" to apply migrations');
        resolve();
      } else {
        console.error(`❌ Error generating migrations, exit code: ${code}`);
        reject(new Error(`Migration generation failed with code ${code}`));
      }
    });
    
    proc.on('error', (err) => {
      console.error('❌ Failed to start drizzle-kit:', err);
      reject(err);
    });
  });
}

generateMigrations().catch(error => {
  console.error(error);
  process.exit(1);
}); 