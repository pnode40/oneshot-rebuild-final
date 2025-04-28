import { Router } from 'express';
import { db } from '../db.js';
import { profiles } from '../schema.js';
import { sql } from 'drizzle-orm';

const router = Router();

router.get('/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const athlete = await db
      .select()
      .from(profiles)
      .where(sql`user_id = ${userId}`);

    if (!athlete.length) {
      return res.status(404).json({ error: 'Athlete not found' });
    }

    const profile = athlete[0];
    const baseUrl = process.env.BASE_URL || 'https://oneshotrecruits.com'; // fallback if env not set
    const profileUrl = `${baseUrl}/athlete/${userId}`;
    const twitterUrl = profile.twitterHandle ? `https://twitter.com/${profile.twitterHandle.replace('@', '')}` : '';

    const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${profile.fullName}
EMAIL:${profile.contactEmail || ''}
TEL:${profile.contactPhone || ''}
TITLE:Class of ${profile.graduationYear || ''}
ROLE:${profile.position || ''}
${twitterUrl ? `URL:${twitterUrl}` : ''}
URL:${profileUrl}
END:VCARD
    `.trim();

    res.setHeader('Content-Type', 'text/vcard');
    if (profile.fullName) {
      res.setHeader('Content-Disposition', `attachment; filename="${profile.fullName.replace(/\s+/g, '_')}_OneShot.vcf"`);
    } else {
      res.setHeader('Content-Disposition', 'attachment; filename="OneShot.vcf"');
    }

    res.send(vcard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate vCard' });
  }
});

router.get('/coach/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const athlete = await db
      .select()
      .from(profiles)
      .where(sql`user_id = ${userId}`);

    if (!athlete.length) {
      return res.status(404).json({ error: 'Athlete profile not found' });
    }

    const profile = athlete[0];

    const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${profile.coachName || 'Coach'}
EMAIL:${profile.coachEmail || ''}
TEL:${profile.coachPhone || ''}
TITLE:High School Coach
END:VCARD
    `.trim();

    res.setHeader('Content-Type', 'text/vcard');
    res.setHeader('Content-Disposition', `attachment; filename="${profile.coachName?.replace(/\s+/g, '_') || 'Coach'}_OneShot.vcf"`);

    res.send(vcard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate coach vCard' });
  }
});

export default router; 