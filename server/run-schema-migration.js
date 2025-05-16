/**
 * Helper script to run Drizzle migrations for the MVP schema
 */
const { exec } = require('child_process');
require('dotenv').config();

console.log('🔄 Running OneShot MVP Schema Migrations');
console.log('---------------------------------------');

// Step 1: Generate migrations
console.log('\n1️⃣ Generating migrations from schema...');
exec('npx drizzle-kit generate:pg', (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Error during generate: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`❌ Generate stderr: ${stderr}`);
    return;
  }
  
  console.log(stdout);
  console.log('✅ Migration files generated successfully');
  
  // Step 2: Apply migrations
  console.log('\n2️⃣ Applying migrations to database...');
  exec('npx drizzle-kit migrate:pg', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error during migrate: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`❌ Migrate stderr: ${stderr}`);
      return;
    }
    
    console.log(stdout);
    console.log('✅ Migrations applied successfully');
    
    // Step 3: If PowerShell issues with && operator, try direct SQL approach
    console.log('\n3️⃣ If any issues occurred, you can try:');
    console.log('   - Check if your DATABASE_URL in .env is correct');
    console.log('   - Run "node apply-migration.js" if you need to apply SQL directly');
    console.log('   - Run "node verify-schema.js" to verify the schema');
    
    console.log('\n🎉 Schema migration process completed');
  });
}); 