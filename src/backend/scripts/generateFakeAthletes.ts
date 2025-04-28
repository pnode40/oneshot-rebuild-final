import { faker } from '@faker-js/faker';
import { db, schema } from '../db.js';
import { eq } from 'drizzle-orm';

const generateFakeAthlete = () => {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    position: faker.helpers.arrayElement(['Quarterback', 'Running Back', 'Wide Receiver', 'Defensive Back', 'Linebacker']),
    graduationYear: faker.date.future({ years: 2 }).getFullYear(),
  };
};

const generateFakeData = async (numAthletes: number) => {
  console.log(`Generating ${numAthletes} fake athletes...`);

  for (let i = 0; i < numAthletes; i++) {
    const athlete = generateFakeAthlete();

    try {
      // Create user first
      const [newUser] = await db.insert(schema.users).values({
        email: athlete.email,
        passwordHash: 'TestPassword123!', // Simulated password hash
      }).returning();

      // Then create profile
      await db.insert(schema.profiles).values({
        userId: newUser.id,
        fullName: athlete.name,
        position: athlete.position,
        graduationYear: athlete.graduationYear,
      });

      console.log(`Successfully created athlete ${athlete.name}`);
    } catch (error) {
      console.error(`Error creating athlete ${athlete.name}:`, error);
    }
  }
  console.log(`${numAthletes} fake athletes created successfully!`);
};

(async () => {
  const numAthletes = 50; // Change this to 100 for 100 fake athletes
  await generateFakeData(numAthletes);
})();
