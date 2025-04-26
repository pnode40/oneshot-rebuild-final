import 'dotenv/config';
import express from 'express';
import authRouter from './routes/auth.js';
import { getDbClient } from './db.js';


async function initializeServer() {
  const dbClient = await getDbClient();

  const app = express();
  const port = process.env.PORT || 3000;

  app.use(express.json());

  app.use((req, res, next) => {
    req.db = dbClient;
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'Server is healthy!' });
  });

  app.use('/api/auth', authRouter);

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

initializeServer().catch((error) => {
  console.error('Failed to initialize server', error);
  process.exit(1);
});
