const { Pool } = require('pg');

const connectionString = 'postgresql://OneShotMay25_owner:npg_OPr6NdBp0QVH@ep-wispy-lab-a5ldd1qu-pooler.us-east-2.aws.neon.tech/OneShotMay25?sslmode=require';

console.log('🔍 Testing database connection...');
console.log('🔍 Connection string:', connectionString.substring(0, 50) + '...');

const pool = new Pool({
  connectionString: connectionString
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query successful:', result.rows[0]);
    
    client.release();
    await pool.end();
    console.log('✅ Connection closed successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('❌ Full error:', error);
  }
}

testConnection(); 