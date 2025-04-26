// src/backend/index.ts

import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/health', (_req, res) => {
  res.json({ status: 'Server is healthy!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
