import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { AthleteProfile } from '../../shared/types/profileTypes.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
    }
  }
}

const profileRouter = Router();

// In-memory database for profiles
const mockDbProfiles: Record<string, AthleteProfile> = {};

// GET /api/profile/me - Fetch current user's profile
profileRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const profile = mockDbProfiles[userId];

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  res.json(profile);
});

// POST /api/profile/update - Create or update user's profile
profileRouter.post('/update', requireAuth, (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const profileData = req.body;

  // Validate required fields
  const requiredFields = [
    'fullName',
    'phoneNumber',
    'highSchool',
    'gradYear',
    'position',
    'gpa',
    'ncaaId',
    'twitterHandle',
    'coachName',
    'coachPhone',
    'coachEmail',
  ];

  for (const field of requiredFields) {
    if (!profileData[field]) {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }

  // Create or update profile
  mockDbProfiles[userId] = {
    userId,
    ...profileData,
    highlightVideos: profileData.highlightVideos || [],
  };

  res.json(mockDbProfiles[userId]);
});

export default profileRouter; 