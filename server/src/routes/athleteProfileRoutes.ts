import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import { requireSelfOrAdmin } from '../middleware/rbacMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { athleteProfileSchemas } from '../validations/athleteProfileSchemas';
import * as athleteProfileService from '../services/athleteProfileService';
import { z } from 'zod';

// Define the user type expected from authentication middleware
interface AuthUser {
  userId: number;
  email: string;
  role: 'athlete' | 'recruiter' | 'admin' | 'parent';
}

// Add type assertion function to safely extract user
const getAuthUser = (req: express.Request): AuthUser => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  return req.user as AuthUser;
};

const router = express.Router();

/**
 * GET /profile/me
 * Get the current user's athlete profile
 */
router.get('/me', authenticateJWT, async (req, res, next) => {
  try {
    // User will be set by authenticateJWT middleware
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    const user = getAuthUser(req);
    const profile = await athleteProfileService.getAthleteProfileByUserId(user.userId);
    
    if (!profile) {
      return res.status(404).json({ 
        success: false,
        message: 'Profile not found' 
      });
    }
    
    res.json({
      success: true,
      data: profile
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /profile/me
 * Create or update the current user's athlete profile
 */
router.put(
  '/me',
  authenticateJWT,
  validateRequest({ body: athleteProfileSchemas.updateAthleteProfileSchema }),
  async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
      
      const user = getAuthUser(req);
      const data = req.body;
      
      const profile = await athleteProfileService.upsertAthleteProfile(user.userId, data);
      
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: profile
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /profile/:userId
 * Get a user's athlete profile by ID (requires self or admin permission)
 */
router.get(
  '/:userId',
  authenticateJWT,
  validateRequest({
    params: z.object({ 
      userId: z.string().transform(val => parseInt(val, 10)) 
    }),
  }),
  requireSelfOrAdmin,
  async (req, res, next) => {
    try {
      // The userId param has been transformed to a number by the validation middleware
      const userId = Number(req.params.userId);
      const profile = await athleteProfileService.getAthleteProfileByUserId(userId);
      
      if (!profile) {
        return res.status(404).json({ 
          success: false,
          message: 'Profile not found' 
        });
      }
      
      res.json({
        success: true,
        data: profile
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router; 