import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';

config();

export default {
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!
  }
} satisfies Config; 