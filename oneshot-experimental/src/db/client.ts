import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database connection string (should be from environment variables)
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/oneshot';

// Create a postgres client with the connection string
const client = postgres(connectionString);

// Create a drizzle client with the postgres client and schema
export const db = drizzle(client, { schema }); 