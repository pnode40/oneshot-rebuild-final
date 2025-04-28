import { faker } from '@faker-js/faker';
import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Adjust if your local server runs elsewhere

async function createFakeAthlete() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName }).toLowerCase();
  const password = 'Password123!'; // Standardized password for all test users
  const gradYear = faker.date.future({ years: 4 }).getFullYear();
  const position = faker.helpers.arrayElement([
    'QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'K/P', 'ATH'
  ]);

  try {
    // 1. Register athlete
    const registerRes = await axios.post(`${API_URL}/api/auth/register`, {
      firstName,
      lastName,
      email,
      password,
    });

    const token = registerRes.data.token; // Adjust if your backend returns token differently

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Update profile
    await axios.patch(`${API_URL}/api/profile`, {
      graduationYear: gradYear,
      position,
    }, { headers });

    // 3. Start timeline
    await axios.post(`${API_URL}/api/journey/start`, {}, { headers });

    console.log(`✅ Created athlete: ${firstName} ${lastName} (${email})`);
  } catch (err) {
    console.error('❌ Error creating fake athlete:', err.response?.data || err.message);
  }
}

async function main() {
  const COUNT = 10; // Start small first!

  for (let i = 0; i < COUNT; i++) {
    await createFakeAthlete();
  }

  console.log(`🎉 Successfully created ${COUNT} fake athletes!`);
}

main(); 