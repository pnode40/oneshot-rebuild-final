import { drizzle } from 'drizzle-orm/neon-serverless';
import { neonConfig, Pool } from '@neondatabase/serverless';
import * as schema from '../src/backend/schema';
import { sql } from 'drizzle-orm';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_XVumNeiOjh43@ep-orange-cloud-a57aagvj-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

const db = drizzle(pool, { schema });

async function simulateJourney() {
  console.log('🎯 Simulating timeline journey...');

  const user = await db.select().from(schema.users).limit(1);
  if (!user.length) {
    console.error('❌ No users found. Run seed script first.');
    process.exit(1);
  }

  const userId = user[0].id;
  console.log('Found user with ID:', userId);

  const startingTasks = [
    { task: 'Gather game film', completed: false },
    { task: 'List coach references', completed: false },
    { task: 'Set initial recruiting goals', completed: false },
  ];

  const timelineValues = {
    userId,
    phase: 'Getting Started',
    tasks: startingTasks,
  };
  console.log('Inserting timeline with values:', timelineValues);

  await db.insert(schema.timelines).values(timelineValues);

  console.log('✅ Timeline created for user ID:', userId);

  // Now simulate task completion
  await db.execute(sql`
    UPDATE timelines
    SET tasks = jsonb_set(tasks::jsonb, '{0,completed}', 'true')
    WHERE user_id = ${userId}
  `);

  console.log('✅ First task marked complete for user ID:', userId);
}

simulateJourney().then(() => {
  console.log('🎯 Simulation complete!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error simulating journey:', error);
  process.exit(1);
}); 