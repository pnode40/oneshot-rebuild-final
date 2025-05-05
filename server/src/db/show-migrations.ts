import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function showMigrations() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    // Get all migrations
    const result = await client.query(`
      SELECT * FROM drizzle.__drizzle_migrations ORDER BY id
    `);
    
    console.log(`\nMigrations (${result.rows.length} total):`);
    for (const row of result.rows) {
      console.log(`  ${row.id}. ${row.hash} (created_at: ${row.created_at}, type: ${typeof row.created_at})`);
    }
    
    // Compare with journal
    const fs = require('fs');
    const path = require('path');
    const journalPath = path.resolve(process.cwd(), './migrations/meta/_journal.json');
    
    if (fs.existsSync(journalPath)) {
      const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
      console.log(`\nJournal entries (${journal.entries.length} total):`);
      
      const journalHashes = new Set(journal.entries.map((entry: any) => entry.hash));
      const dbHashes = new Set(result.rows.map(row => row.hash));
      
      // Check for mismatches
      const inJournalNotDb = [...journalHashes].filter(hash => !dbHashes.has(hash));
      const inDbNotJournal = [...dbHashes].filter(hash => !journalHashes.has(hash));
      
      if (inJournalNotDb.length > 0) {
        console.log(`\n⚠️ In journal but not in DB (${inJournalNotDb.length}):`);
        inJournalNotDb.forEach(hash => console.log(`  - ${hash}`));
      }
      
      if (inDbNotJournal.length > 0) {
        console.log(`\n⚠️ In DB but not in journal (${inDbNotJournal.length}):`);
        inDbNotJournal.forEach(hash => console.log(`  - ${hash}`));
      }
      
      if (inJournalNotDb.length === 0 && inDbNotJournal.length === 0) {
        console.log('\n✅ DB and journal are in sync!');
      }
    }
    
  } catch (error) {
    console.error('Error showing migrations:', error);
  } finally {
    await client.end();
  }
}

showMigrations()
  .then(() => console.log('\nMigration info completed'))
  .catch(err => {
    console.error('Show migrations error:', err);
    process.exit(1);
  }); 