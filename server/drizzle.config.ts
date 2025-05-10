import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';
import { parse } from 'pg-connection-string';

config();

// Parse the connection string
const connectionOptions = parse(process.env.DATABASE_URL || '');

export default {
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: connectionOptions.host || 'localhost',
    port: connectionOptions.port ? parseInt(connectionOptions.port) : 5432,
    user: connectionOptions.user,
    password: connectionOptions.password,
    database: connectionOptions.database || 'oneshot',
    ssl: connectionOptions.ssl as any
  }
} satisfies Config; 