import { db } from './db/client'; // Make sure path is correct relative to index.ts

async function testConnection() {
  try {
    console.log('Attempting to query profiles...');
    const result = await db.query.profiles.findMany(); // Tries to query the table
    console.log('Fetched profiles (indicates connection success):', result); // Should log [] if table exists/query works
  } catch (error) {
    console.error('Error during database test:', error); // Log any error
  }
}

testConnection();
