import { Router } from 'express';
import { db } from '../db';
import { profiles } from '../schema';
import { sql } from 'drizzle-orm';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const router = Router();

const fontPath = join(process.cwd(), 'public', 'fonts', 'Inter-Bold.ttf');
const fontData = readFileSync(fontPath);

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const userRecord = await db
      .select()
      .from(profiles)
      .where(sql`user_id = ${userId}`);

    if (!userRecord.length) {
      return res.status(404).send('User not found');
    }

    const profile = userRecord[0];

    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '1200px',
            height: '630px',
            backgroundColor: '#0f172a', // OneShot navy dark
            color: 'white',
            fontFamily: 'Inter',
            padding: '40px',
          },
          children: [
            profile.profilePictures?.length ? {
              type: 'img',
              props: {
                src: profile.profilePictures.find((pic: any) => pic.active)?.url || '',
                width: '200',
                height: '200',
                style: { borderRadius: '100px', marginBottom: '20px' },
              },
            } : null,
            {
              type: 'div',
              props: {
                style: { fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' },
                children: profile.firstName + ' ' + profile.lastName,
              },
            },
            {
              type: 'div',
              props: {
                style: { fontSize: '32px', marginBottom: '10px' },
                children: profile.position,
              },
            },
            {
              type: 'div',
              props: {
                style: { fontSize: '24px', color: '#93c5fd' }, // Light blue for accent
                children: 'Powered by OneShot Recruiting',
              },
            },
          ],
        },
      },
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Inter',
            data: fontData,
            weight: 700,
            style: 'normal',
          },
        ],
      }
    );

    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
    });

    const pngBuffer = resvg.render().asPng();

    res.setHeader('Content-Type', 'image/png');
    res.send(pngBuffer);
  } catch (error) {
    console.error('OG Image generation error:', error);
    res.status(500).send('Failed to generate OG image');
  }
});

export default router; 