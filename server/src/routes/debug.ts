import { Router } from 'express';
import { db } from '../db/client';

const router = Router();

// GET /api/debug/health - Check server health
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// GET /api/debug/db - Test database connection
router.get('/db', async (req, res) => {
  try {
    const result = await db.query.profiles.findMany();
    res.json({ 
      status: 'ok', 
      profiles: result.length,
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: String(error),
      details: 'Database connection failed'
    });
  }
});

export default router; 