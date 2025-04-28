import { Router } from 'express';
import { db } from '../db.js';
import { users, profiles, metrics } from '../schema.js';
import { sql } from 'drizzle-orm';

const router = Router();

// Fetch public profile by user ID
router.get('/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const userProfile = await db
      .select()
      .from(profiles)
      .where(sql`user_id = ${userId}`);

    const userMetrics = await db
      .select()
      .from(metrics)
      .where(sql`user_id = ${userId}`);

    if (!userProfile.length) {
      return res.status(404).json({ error: 'Athlete profile not found' });
    }

    res.json({
      profile: userProfile[0],
      metrics: userMetrics[0] || {},
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch public profile' });
  }
});

export default router; 