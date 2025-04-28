import { Router } from 'express';
import { db } from '../db';
import { users } from '../schema';
import { sql } from 'drizzle-orm';
import nodemailer from 'nodemailer';

const router = Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

router.post('/', async (req, res) => {
  const { userId } = req.body;

  try {
    const userRecord = await db
      .select()
      .from(users)
      .where(sql`id = ${userId}`);

    if (!userRecord.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userEmail = userRecord[0].email;

    await transporter.sendMail({
      from: `"OneShot Recruiting" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Your Recruiting Checklist',
      html: `
        <h1>OneShot Recruiting Checklist ✅</h1>
        <p>Here's what you should prepare next:</p>
        <ul>
          <li>🎥 Highlight Video Uploaded</li>
          <li>📈 Updated Athletic Metrics</li>
          <li>🏆 Awards and Achievements</li>
          <li>🏈 Coach Contact Information</li>
          <li>📚 GPA and Academic Info Ready</li>
          <li>📎 Share Your OneShot Profile Link!</li>
        </ul>
        <p>We're here to help you succeed!</p>
        <p><b>OneShot Recruiting</b></p>
      `,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Checklist email error:', error);
    res.status(500).json({ error: 'Failed to send checklist email' });
  }
});

export default router; 