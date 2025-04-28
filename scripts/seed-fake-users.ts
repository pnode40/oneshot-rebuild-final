import { drizzle } from 'drizzle-orm/neon-serverless';
import { neonConfig, Pool } from '@neondatabase/serverless';
import * as schema from '../src/backend/schema';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_XVumNeiOjh43@ep-orange-cloud-a57aagvj-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

const db = drizzle(pool, { schema });

async function seedFakeUsers() {
  console.log('🌱 Seeding fake users...');

  const fakePassword = await bcrypt.hash('Password123!', 10);
  console.log('Generated password hash:', fakePassword);

  const userValues = {
    email: 'fakeathlete@example.com',
    passwordHash: fakePassword,
  };
  console.log('Inserting user with values:', userValues);

  const userInsert = await db.insert(schema.users).values(userValues).returning({ id: schema.users.id });

  const userId = userInsert[0].id;
  console.log('User inserted with ID:', userId);

  const profileValues = {
    userId,
    fullName: 'Fake Athlete',
    graduationYear: 2026,
    position: 'WR',
  };
  console.log('Inserting profile with values:', profileValues);

  await db.insert(schema.profiles).values(profileValues);

  console.log('✅ Fake user created with ID:', userId);
}

seedFakeUsers().then(() => {
  console.log('🌱 Seeding complete!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error seeding:', error);
  process.exit(1);
}); 