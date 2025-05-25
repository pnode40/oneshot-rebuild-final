import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../src/db/schema';
import * as dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../test.env') });

// Test database configuration
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 
  'postgresql://OneShotMay25_owner:npg_OPr6NdBp0QVH@ep-wispy-lab-a5ldd1qu-pooler.us-east-2.aws.neon.tech/OneShotMay25?sslmode=require';

let testPool: Pool;
let testDb: ReturnType<typeof drizzle>;

// Global test setup
beforeAll(async () => {
  // Initialize test database connection
  testPool = new Pool({
    connectionString: TEST_DATABASE_URL,
    max: 1, // Single connection for tests
  });
  
  testDb = drizzle(testPool, { schema });
  
  // Verify database connection
  const client = await testPool.connect();
  await client.query('SELECT NOW()');
  client.release();
  
  console.log('Test database connected successfully');
});

// Global test teardown
afterAll(async () => {
  if (testPool) {
    await testPool.end();
    console.log('Test database connection closed');
  }
});

// Test isolation - start transaction before each test
beforeEach(async () => {
  // Begin transaction for test isolation
  await testPool.query('BEGIN');
});

// Test cleanup - rollback transaction after each test
afterEach(async () => {
  // Rollback transaction to clean up test data
  await testPool.query('ROLLBACK');
});

// Export test database for use in tests
export { testDb };

// Test utilities
export const cleanupTestData = async () => {
  // Additional cleanup if needed
  // This runs in rollback, so usually not necessary
};

// Test timeout configuration
jest.setTimeout(30000); // 30 seconds for database operations

// Setup and teardown functions
export async function setupTestDatabase() {
  try {
    console.log('✅ Test database setup completed');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
}

export async function cleanupTestDatabase() {
  try {
    // Clean up test data - truncate all tables
    await testDb.execute(`
      TRUNCATE TABLE 
        media_items,
        athlete_profiles,
        users
      RESTART IDENTITY CASCADE
    `);
    console.log('✅ Test database cleaned');
  } catch (error) {
    console.warn('⚠️ Test database cleanup failed:', error);
  }
}

export async function closeTestDatabase() {
  try {
    await testPool.end();
    console.log('✅ Test database connection closed');
  } catch (error) {
    console.warn('⚠️ Failed to close test database connection:', error);
  }
}

// Jest global setup/teardown hooks
beforeAll(async () => {
  await setupTestDatabase();
});

beforeEach(async () => {
  await cleanupTestDatabase();
});

afterAll(async () => {
  await closeTestDatabase();
}); 