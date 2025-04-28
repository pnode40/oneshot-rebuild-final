import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });
console.log("DATABASE_URL from .env:", process.env.DATABASE_URL);  // This will log the value

import './index.ts'; 