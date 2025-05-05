import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Ensure DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required (check .env file)');
  process.exit(1);
}

async function fixMigrationTable() {
  // Create postgres client
  const client = postgres(process.env.DATABASE_URL!, {
     max: 1,
     ssl: process.env.DATABASE_URL!.includes('sslmode=require') ? 'require' : undefined
  });

  try {
    console.log('Attempting to fix migration tracking table...');
    
    // Check if the migrations table exists
    const tableExists = await client`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'drizzle' AND table_name = '__drizzle_migrations'
      ) as table_exists
    `;
    
    if (!tableExists[0]?.table_exists) {
      console.log('Drizzle migrations table does not exist yet');
      return;
    }
    
    // Get all entries from the migration table
    const entries = await client`
      SELECT id, hash, created_at FROM drizzle.__drizzle_migrations ORDER BY id
    `;
    
    console.log(`Found ${entries.length} entries in migration table:`);
    entries.forEach((entry) => {
      console.log(`  ID: ${entry.id}, Hash: ${entry.hash || 'NULL'}`);
    });
    
    // Find problematic entries (null or empty hash)
    const problematicEntries = entries.filter(entry => !entry.hash);
    
    if (problematicEntries.length > 0) {
      console.log(`Found ${problematicEntries.length} entries with null hash value`);
      
      // Delete problematic entries
      for (const entry of problematicEntries) {
        console.log(`Deleting entry with ID ${entry.id}`);
        await client`
          DELETE FROM drizzle.__drizzle_migrations WHERE id = ${entry.id}
        `;
      }
      console.log('Successfully removed problematic entries');
    } else {
      console.log('No null entries found in migration table');
    }
    
    // Get the latest entries
    const updatedEntries = await client`
      SELECT id, hash, created_at FROM drizzle.__drizzle_migrations ORDER BY id
    `;
    
    console.log(`Current migration entries (${updatedEntries.length}):`);
    updatedEntries.forEach((entry) => {
      console.log(`  ID: ${entry.id}, Hash: ${entry.hash}`);
    });
    
    console.log('Migration table fix completed');
    
  } catch (error) {
    console.error('Error fixing migration table:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the fix
fixMigrationTable(); 