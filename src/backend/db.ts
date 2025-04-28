// src/backend/db.ts

import { drizzle } from 'drizzle-orm/neon-serverless';
import { neonConfig, Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import ws from 'ws';
import * as schema from './schema.js';

// Load environment variables immediately
dotenv.config();

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Configure WebSocket explicitly for Neon
neonConfig.webSocketConstructor = ws;

// Set up database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Export schema separately for route use
export { schema };

// Helper function to get db client
export const getDbClient = async () => {
  return db;
};
