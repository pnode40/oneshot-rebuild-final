import { Router } from 'express';
import { db } from '../db.js';
import { profiles } from '../schema.js';
import { sql } from 'drizzle-orm';
import sharp from 'sharp';

const router = Router();

// Upload Profile Picture
router.post('/profile-pic', async (req, res) => {
  const { userId, url } = req.body;

  try {
    const existing = await db.select().from(profiles).where(sql`user_id = ${userId}`);
    if (!existing.length) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const currentPictures = existing[0].profilePictures || [];

    const newPicture = {
      url,
      uploadedAt: new Date().toISOString(),
      active: currentPictures.length === 0, // Auto-activate first upload
    };

    let updatedPictures = [newPicture, ...currentPictures];

    if (updatedPictures.length > 5) {
      updatedPictures = updatedPictures.slice(0, 5); // Keep only latest 5
    }

    await db.update(profiles)
      .set({ profilePictures: updatedPictures })
      .where(sql`user_id = ${userId}`);

    res.json({ success: true });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

// Set Active Profile Picture
router.post('/profile-pic/activate', async (req, res) => {
  const { userId, url } = req.body;

  try {
    const existing = await db.select().from(profiles).where(sql`user_id = ${userId}`);
    if (!existing.length) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const currentPictures = existing[0].profilePictures || [];

    const updatedPictures = currentPictures.map((pic: { url: string; uploadedAt: string; active: boolean }) => ({
      ...pic,
      active: pic.url === url,
    }));

    await db.update(profiles)
      .set({ profilePictures: updatedPictures })
      .where(sql`user_id = ${userId}`);

    res.json({ success: true });
  } catch (error) {
    console.error('Activate profile picture error:', error);
    res.status(500).json({ error: 'Failed to activate profile picture' });
  }
});

export default router; 