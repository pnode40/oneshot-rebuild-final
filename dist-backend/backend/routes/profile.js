import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
const profileRouter = Router();
// In-memory database for profiles
const mockDbProfiles = {};
// GET /api/profile/me - Fetch current user's profile
profileRouter.get('/me', requireAuth, (req, res) => {
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
profileRouter.post('/update', requireAuth, (req, res) => {
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
