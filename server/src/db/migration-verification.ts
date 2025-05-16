/**
 * Migration System Verification Script
 * 
 * This script provides a comprehensive test of the Drizzle migration workflow:
 * 1. Validates the current migration state
 * 2. Makes a small schema change
 * 3. Generates a migration
 * 4. Applies the migration
 * 5. Validates the final state
 * 
 * Used to verify that the entire migration workflow is functioning correctly
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import dotenv from 'dotenv';
import { validateMigrationState } from './validate-migrations';

dotenv.config();

interface ValidationResult {
  isValid: boolean;
  issues: string[];
}

async function verifyMigrationWorkflow(): Promise<boolean> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('🔴 DATABASE_URL environment variable is required');
    process.exit(1);
  }
  
  console.log('🧪 Starting comprehensive migration workflow verification');
  
  try {
    // STEP 1: Validate initial migration state
    console.log('\n📋 STEP 1: Validating initial migration state');
    const initialValidation = await validateMigrationState();
    
    if (!initialValidation.isValid) {
      console.error('❌ Initial validation failed. Please run migrate:rebuild first.');
      console.error('Issues:', initialValidation.issues);
      return false;
    }
    
    console.log('✅ Initial migration state is valid.');
    
    // STEP 2: Add a temporary test table to schema.ts
    console.log('\n📋 STEP 2: Adding test table to schema for migration generation');
    const schemaPath = path.resolve(__dirname, 'schema.ts');
    const originalSchema = fs.readFileSync(schemaPath, 'utf8');
    
    // Add a test table to the schema for migration testing
    const testTableSchema = `
// Test table for migration verification - will be removed after test
export const migrationVerificationTest = pgTable('migration_verification_test', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});
`;
    
    // Append the test table to the schema
    fs.writeFileSync(schemaPath, originalSchema + testTableSchema);
    console.log('✅ Test table added to schema.');
    
    // STEP 3: Generate migration
    console.log('\n📋 STEP 3: Generating migration with drizzle-kit');
    try {
      execSync('npm run migrate:generate', { stdio: 'inherit' });
      console.log('✅ Migration generation successful.');
    } catch (error) {
      console.error('❌ Migration generation failed:', error);
      // Restore original schema
      fs.writeFileSync(schemaPath, originalSchema);
      return false;
    }
    
    // STEP 4: Apply migration
    console.log('\n📋 STEP 4: Applying migration with standard migrate function');
    try {
      execSync('npm run migrate', { stdio: 'inherit' });
      console.log('✅ Migration application successful.');
    } catch (error) {
      console.error('❌ Migration application failed:', error);
      // Restore original schema
      fs.writeFileSync(schemaPath, originalSchema);
      return false;
    }
    
    // STEP 5: Validate final migration state
    console.log('\n📋 STEP 5: Validating final migration state');
    const finalValidation = await validateMigrationState();
    
    if (!finalValidation.isValid) {
      console.error('❌ Final validation failed after migration.');
      console.error('Issues:', finalValidation.issues);
      // Restore original schema
      fs.writeFileSync(schemaPath, originalSchema);
      return false;
    }
    
    console.log('✅ Final migration state is valid.');
    
    // STEP 6: Verify the test table was created in the database
    console.log('\n📋 STEP 6: Verifying test table exists in database');
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    
    try {
      const { rows } = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'migration_verification_test'
        ) as exists
      `);
      
      if (!rows[0].exists) {
        console.error('❌ Test table was not created in the database.');
        // Restore original schema
        fs.writeFileSync(schemaPath, originalSchema);
        return false;
      }
      
      console.log('✅ Test table exists in database.');
    } finally {
      await client.end();
    }
    
    // STEP 7: Clean up - remove test table from schema
    console.log('\n📋 STEP 7: Cleaning up - restoring original schema');
    fs.writeFileSync(schemaPath, originalSchema);
    console.log('✅ Original schema restored.');
    
    // Success message
    console.log('\n🎉 MIGRATION WORKFLOW VERIFICATION SUCCESSFUL!');
    console.log('The standard Drizzle migration flow is working correctly:');
    console.log('✓ Proper migration table structure');
    console.log('✓ Generation works without errors');
    console.log('✓ Migration applies successfully');
    console.log('✓ Database state and migration tracking stay in sync');
    
    // Note about test table
    console.log('\n📝 NOTE: The test table "migration_verification_test" still exists in the database.');
    console.log('To clean it up completely, you would need to:');
    console.log('1. Generate a final migration that removes the table');
    console.log('2. Apply that migration');
    console.log('Or you can drop it manually if it was just for testing.');
    
    return true;
  } catch (error) {
    console.error('🔴 Error in migration workflow verification:', error);
    return false;
  }
}

// Allow importing this file without running it immediately
if (require.main === module) {
  verifyMigrationWorkflow()
    .then(success => {
      console.log(`\nVerification ${success ? 'successful' : 'failed'}`);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('🔴 Verification process error:', error);
      process.exit(1);
    });
}

export { verifyMigrationWorkflow }; 