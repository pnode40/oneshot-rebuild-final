import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import { requireSelfOrAdmin } from '../middleware/rbacMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { athleteProfileSchemas } from '../validations/athleteProfileSchemas';
import * as athleteProfileService from '../services/athleteProfileService';
import { z } from 'zod';
import { db } from '../db/client';
import { athleteProfiles, profiles } from '../db/schema';
import { eq, or } from 'drizzle-orm';

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

/**
 * GET /profile/check-slug/:slug
 * Check if a custom URL slug is available
 */
router.get('/check-slug/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    // Basic validation
    if (!slug || slug.length < 3 || slug.length > 50) {
      return res.json({
        available: false,
        message: 'Slug must be between 3 and 50 characters'
      });
    }
    
    // Check if slug contains only valid characters (letters, numbers, hyphens)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.json({
        available: false,
        message: 'Slug can only contain lowercase letters, numbers, and hyphens'
      });
    }
    
    // Check against both athlete profiles and legacy profiles tables
    const [existingAthleteProfile, existingLegacyProfile] = await Promise.all([
      // Check new athlete profiles table (when we add slug field)
      // For now, just return null since the schema doesn't have slug yet
      Promise.resolve(null),
      
      // Check legacy profiles table
      db.query.profiles.findFirst({
        where: or(
          eq(profiles.customUrlSlug, slug),
          eq(profiles.slug, slug)
        ),
        columns: { id: true }
      })
    ]);
    
    const isAvailable = !existingAthleteProfile && !existingLegacyProfile;
    
    res.json({
      available: isAvailable,
      message: isAvailable 
        ? 'This slug is available!' 
        : 'This slug is already taken'
    });
  } catch (err) {
    console.error('Error checking slug availability:', err);
    res.status(500).json({
      available: false,
      message: 'Error checking slug availability'
    });
  }
});

/**
 * GET /by-user
 * Get the athlete profile for the currently authenticated user
 * This is used by the frontend to get the athlete profile ID
 */
router.get('/by-user', authenticateJWT, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    const user = getAuthUser(req);
    
    // First, try to get the athlete profile by user ID
    const profile = await db.query.athleteProfiles.findFirst({
      where: eq(athleteProfiles.userId, user.userId),
      columns: {
        userId: true,
        firstName: true,
        lastName: true,
        sport: true,
        primaryPosition: true,
        secondaryPosition: true,
        graduationYear: true,
      }
    });
    
    if (!profile) {
      return res.status(404).json({ 
        success: false,
        message: 'No athlete profile found for this user' 
      });
    }
    
    res.json({
      success: true,
      data: {
        id: profile.userId, // Use userId as the id for frontend compatibility
        ...profile
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router; 