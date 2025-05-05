const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection string
const connectionString = 'postgresql://OneShotMay25_owner:npg_OPr6NdBp0QVH@ep-wispy-lab-a5ldd1qu-pooler.us-east-2.aws.neon.tech/OneShotMay25?sslmode=require';

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'setup-users-table.sql');
const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

async function applySchema() {
  const client = new Client({
    connectionString
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connection successful');

    console.log('Executing SQL script...');
    await client.query(sqlScript);
    console.log('SQL script executed successfully');
  } catch (error) {
    console.error('Error executing SQL script:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

applySchema().catch(console.error); 