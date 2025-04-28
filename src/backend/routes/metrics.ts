import { Router } from 'express';
import { db } from '../db.js';
import { metrics } from '../schema.js';
import { sql } from 'drizzle-orm';

const router = Router();

// Fetch metrics
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.select().from(metrics).where(sql`user_id = ${userId}`);
    res.json(result[0] || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Update metrics
router.patch('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const input = req.body;

    const existing = await db.select().from(metrics).where(sql`user_id = ${userId}`);

    if (existing.length) {
      await db.update(metrics).set(input).where(sql`user_id = ${userId}`);
    } else {
      await db.insert(metrics).values({ userId, ...input });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save metrics' });
  }
});

export default router; 