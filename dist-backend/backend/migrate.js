import { Pool } from '@neondatabase/serverless';
import { neonConfig } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import ws from 'ws';
import { fileURLToPath } from 'url';
// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function migrate() {
    const pool = new Pool({
        connectionString: 'postgresql://neondb_owner:npg_XVumNeiOjh43@ep-orange-cloud-a57aagvj-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'
    });
    try {
        // Drop existing tables
        console.log('Dropping existing tables...');
        await pool.query('DROP TABLE IF EXISTS posts, timelines, profiles, users CASCADE');
        console.log('Tables dropped successfully');
        // Read and execute all SQL files in order
        const drizzleDir = path.join(__dirname, '..', '..', 'drizzle');
        const files = fs.readdirSync(drizzleDir)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Ensure files are executed in order
        for (const file of files) {
            const sqlPath = path.join(drizzleDir, file);
            console.log('Reading SQL file from:', sqlPath);
            const sql = fs.readFileSync(sqlPath, 'utf8')
                .replace(/-->.*/g, '') // Remove statement-breakpoint comments
                .replace(/\s+/g, ' ') // Normalize whitespace
                .trim();
            console.log('Executing SQL:', sql);
            await pool.query(sql);
            console.log('SQL executed successfully');
        }
        // Verify tables exist
        const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'profiles', 'timelines', 'posts')
    `);
        console.log('\nCreated tables:', tables.rows.map(r => r.table_name));
        console.log('\nMigration completed successfully!');
    }
    catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
    finally {
        await pool.end();
    }
}
migrate();
