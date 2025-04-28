// src/backend/db.ts
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neonConfig, Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';
import ws from 'ws';
import * as schema from './schema.js';
// Load environment variables from the root directory
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}
// Configure WebSocket explicitly for Neon
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
// Export the schema for use in routes
export { schema };
export const getDbClient = async () => {
    return db;
};
