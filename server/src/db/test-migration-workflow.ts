/**
 * Migration Workflow Test Script
 * 
 * This script tests the complete Drizzle migration workflow:
 * 1. Adds a test field to the profiles table in schema.ts
 * 2. Generates a migration using npm run migrate:generate
 * 3. Applies the migration using npm run migrate
 * 4. Validates that the field was added to the database
 * 5. Cleans up by removing the test field from both schema and database
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import dotenv from 'dotenv';
import { validateMigrationState } from './validate-migrations';

dotenv.config();

// Field name will include timestamp to ensure uniqueness
const fieldName = `test_field_${Date.now()}`;
const schemaPath = path.resolve(__dirname, 'schema.ts');

/**
 * Helper function to directly clean up a test field from the database
 * @param fieldName The name of the field to remove
 * @returns Promise<boolean> Success status
 */
async function cleanupTestField(fieldName: string): Promise<boolean> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('🔴 DATABASE_URL environment variable is required');
    return false;
  }
  
  console.log(`\n🧹 CLEANING UP TEST FIELD: ${fieldName}`);
  
  try {
    // Use direct SQL command to drop the column
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    
    try {
      console.log(`Dropping column ${fieldName} from profiles table...`);
      await client.query(`ALTER TABLE profiles DROP COLUMN IF EXISTS ${fieldName}`);
      console.log(`✅ Column ${fieldName} successfully dropped from database`);
      return true;
    } catch (error) {
      console.error('❌ Error dropping column:', error);
      return false;
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    return false;
  }
}

/**
 * Main test function that verifies the entire migration workflow
 * @param cleanup Whether to clean up the test field after verification
 * @returns Promise<boolean> Success status
 */
async function testMigrationWorkflow(cleanup: boolean = true): Promise<boolean> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('🔴 DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('\n🧪 MIGRATION WORKFLOW TEST');
  console.log('=========================');
  console.log('This script will test the complete Drizzle migration workflow');
  console.log(`Adding test field: ${fieldName}`);
  
  // Backup original schema file
  const originalSchema = fs.readFileSync(schemaPath, 'utf8');
  const backupPath = `${schemaPath}.backup`;
  fs.writeFileSync(backupPath, originalSchema);
  console.log(`✅ Original schema backed up to ${backupPath}`);
  
  try {
    // STEP 1: Add test field to schema
    console.log('\n📋 STEP 1: Adding test field to profiles schema...');
    
    // Find the profiles table definition
    const profilesTablePattern = /export const profiles = pgTable\('profiles',\s*{([\s\S]*?)},\s*\(table\)/;
    const match = originalSchema.match(profilesTablePattern);
    
    if (!match) {
      console.error('❌ Could not find profiles table definition in schema.ts');
      return false;
    }
    
    // Add the test field
    const profilesTableContent = match[1];
    const testFieldDefinition = `\n  // Test field for migration workflow verification
  ${fieldName}: varchar('${fieldName}', { length: 100 }),`;
    
    const newProfilesTableContent = profilesTableContent + testFieldDefinition;
    const newSchema = originalSchema.replace(profilesTableContent, newProfilesTableContent);
    
    // Write the modified schema back to the file
    fs.writeFileSync(schemaPath, newSchema);
    console.log(`✅ Test field "${fieldName}" added to schema.ts`);
    
    // STEP 2: Run schema validation first
    console.log('\n📋 STEP 2: Validating initial migration state...');
    const initialValidation = await validateMigrationState();
    if (!initialValidation.isValid) {
      console.error('❌ Initial migration state is invalid. Fix migration issues before testing.');
      console.error('Issues:', initialValidation.issues);
      throw new Error('Invalid migration state');
    }
    console.log('✅ Initial migration state is valid');
    
    // STEP 3: Generate migration
    console.log('\n📋 STEP 3: Generating migration with drizzle-kit...');
    try {
      execSync('npm run migrate:generate', { stdio: 'inherit' });
      console.log('✅ Migration generation successful');
    } catch (error) {
      console.error('❌ Migration generation failed:', error);
      throw new Error('Migration generation failed');
    }
    
    // STEP 4: Apply migration
    console.log('\n📋 STEP 4: Applying migration...');
    try {
      execSync('npm run migrate', { stdio: 'inherit' });
      console.log('✅ Migration application successful');
    } catch (error) {
      console.error('❌ Migration application failed:', error);
      throw new Error('Migration application failed');
    }
    
    // STEP 5: Verify the field was added to the database
    console.log('\n📋 STEP 5: Verifying field was added to database...');
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    
    try {
      const { rows } = await client.query(`
        SELECT EXISTS (
          SELECT 
            FROM information_schema.columns 
          WHERE 
            table_schema = 'public' 
            AND table_name = 'profiles'
            AND column_name = '${fieldName}'
        ) as exists
      `);
      
      if (!rows[0].exists) {
        console.error(`❌ Test field "${fieldName}" was not added to the database`);
        throw new Error('Field not added to database');
      }
      
      console.log(`✅ Test field "${fieldName}" was successfully added to the database`);
    } finally {
      await client.end();
    }
    
    // STEP 6: Validate final migration state
    console.log('\n📋 STEP 6: Validating final migration state...');
    const finalValidation = await validateMigrationState();
    if (!finalValidation.isValid) {
      console.error('❌ Final migration state is invalid after migration');
      console.error('Issues:', finalValidation.issues);
      throw new Error('Invalid migration state after migration');
    }
    console.log('✅ Final migration state is valid');
    
    // Success for the first phase
    console.log('\n🎉 MIGRATION WORKFLOW TEST SUCCESSFUL!');
    console.log('The Drizzle migration system is working correctly:');
    console.log('✓ Schema changes are detected');
    console.log('✓ Migrations are generated properly');
    console.log('✓ Migrations apply successfully');
    console.log('✓ Database reflects the schema changes');
    console.log('✓ Migration state remains valid');
    
    // STEP 7: Cleanup if requested
    if (cleanup) {
      console.log('\n🧹 CLEANUP PHASE');
      console.log('===============');
      console.log('Now cleaning up the test field from schema and database...');
      
      // Restore original schema first
      console.log('\n📋 STEP 7.1: Restoring original schema file...');
      fs.writeFileSync(schemaPath, originalSchema);
      console.log('✅ Original schema restored');
      
      // Generate cleanup migration
      console.log('\n📋 STEP 7.2: Generating cleanup migration...');
      try {
        execSync('npm run migrate:generate', { stdio: 'inherit' });
        console.log('✅ Cleanup migration generation successful');
      } catch (error) {
        console.error('❌ Cleanup migration generation failed:', error);
        console.error('⚠️ Test field remains in database');
        return true; // Return true since the test itself was successful
      }
      
      // Apply cleanup migration
      console.log('\n📋 STEP 7.3: Applying cleanup migration...');
      try {
        execSync('npm run migrate', { stdio: 'inherit' });
        console.log('✅ Cleanup migration application successful');
      } catch (error) {
        console.error('❌ Cleanup migration application failed:', error);
        console.error('⚠️ Test field may remain in database');
        return true; // Return true since the test itself was successful
      }
      
      // Verify the field was removed
      console.log('\n📋 STEP 7.4: Verifying field was removed from database...');
      const verifyClient = new Client({ connectionString: databaseUrl });
      await verifyClient.connect();
      
      try {
        const { rows } = await verifyClient.query(`
          SELECT EXISTS (
            SELECT 
              FROM information_schema.columns 
            WHERE 
              table_schema = 'public' 
              AND table_name = 'profiles'
              AND column_name = '${fieldName}'
          ) as exists
        `);
        
        if (rows[0].exists) {
          console.warn(`⚠️ Warning: Test field "${fieldName}" was not removed from the database`);
          console.warn('This may be due to a limitation in Drizzle ORM for dropping columns');
          
          // Try direct SQL approach as a fallback
          console.log('Attempting direct SQL cleanup as fallback...');
          await cleanupTestField(fieldName);
        } else {
          console.log(`✅ Test field "${fieldName}" was successfully removed from the database`);
        }
      } finally {
        await verifyClient.end();
      }
      
      // Final validation after cleanup
      console.log('\n📋 STEP 7.5: Validating migration state after cleanup...');
      const cleanupValidation = await validateMigrationState();
      if (!cleanupValidation.isValid) {
        console.error('❌ Migration state is invalid after cleanup');
        console.error('Issues:', cleanupValidation.issues);
      } else {
        console.log('✅ Migration state is valid after cleanup');
      }
      
      console.log('\n✨ CLEANUP COMPLETE!');
    } else {
      console.log('\n⚠️ Cleanup was disabled - the test field remains in schema.ts and database');
    }
    
    return true;
  } catch (error) {
    console.error('\n❌ MIGRATION WORKFLOW TEST FAILED:', error);
    return false;
  } finally {
    // Always restore the original schema if it hasn't been done already
    if (fs.existsSync(backupPath)) {
      try {
        const currentSchema = fs.readFileSync(schemaPath, 'utf8');
        const originalSchema = fs.readFileSync(backupPath, 'utf8');
        
        if (currentSchema !== originalSchema) {
          console.log('\n📋 Restoring original schema from backup...');
          fs.writeFileSync(schemaPath, originalSchema);
          console.log('✅ Original schema restored from backup');
        }
        
        // Remove the backup file
        fs.unlinkSync(backupPath);
      } catch (error) {
        console.error('❌ Error restoring schema:', error);
      }
    }
  }
}

// Allow importing this file without running it immediately
if (require.main === module) {
  testMigrationWorkflow()
    .then(success => {
      console.log(`\nTest ${success ? 'passed' : 'failed'}`);
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('🔴 Test failed with error:', err);
      process.exit(1);
    });
}

export { testMigrationWorkflow, cleanupTestField }; 