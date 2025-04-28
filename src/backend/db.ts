// src/backend/db.ts

import { drizzle } from 'drizzle-orm/neon-serverless';
import { neonConfig, Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

// Configure WebSocket explicitly for Neon
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);

export const getDbClient = async () => {
    // Temporary mock DB client
    return {
      users: {
        async findOne(query: { email: string }) {
          // This would normally hit a real database
          return null; // Always pretend user does not exist for now
        },
        async insertOne(user: any) {
          // This would normally insert into a real database
          return {
            insertedId: 'mock-user-id', // Always return a mock ID
          };
        },
      },
    };
  };
  