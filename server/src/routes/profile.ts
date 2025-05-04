import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/client';
import { profiles } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Define validation schema for profile submission
const profileSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  highSchool: z.string().min(1, "High school is required"),
  position: z.string().min(1, "Position is required"),
  gradYear: z.string().optional(),
  cityState: z.string().optional(),
  heightFt: z.string().optional(),
  heightIn: z.string().optional(),
  weight: z.string().optional(),
  fortyYardDash: z.string().optional(),
  benchPress: z.string().optional(),
});

// Define type for validated profile data
type ProfileData = z.infer<typeof profileSchema>;

// Define handler function separately
async function createProfile(req: AuthRequest, res: Response) {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Validate request body
    const validationResult = profileSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        errors: validationResult.error.errors 
      });
    }

    const validatedData = validationResult.data;
    
    try {
      // Check if user already has a profile
      const existingProfile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, req.user.userId)
      });

      if (existingProfile) {
        return res.status(409).json({
          success: false,
          message: 'User already has a profile',
          profileId: existingProfile.id
        });
      }

      // Insert the validated data into the profiles table with the user ID
      const result = await db.insert(profiles)
        .values({
          fullName: validatedData.fullName,
          email: validatedData.email,
          highSchool: validatedData.highSchool,
          position: validatedData.position,
          gradYear: validatedData.gradYear,
          cityState: validatedData.cityState,
          heightFt: validatedData.heightFt,
          heightIn: validatedData.heightIn,
          weight: validatedData.weight,
          fortyYardDash: validatedData.fortyYardDash,
          benchPress: validatedData.benchPress,
          userId: req.user.userId // Associate profile with the authenticated user
        })
        .returning();
      
      // Check if insertion was successful
      if (result && result[0]) {
        res.status(201).json({ 
          success: true, 
          profile: result[0]
        });
      } else {
        throw new Error('Failed to retrieve inserted profile data');
      }
    } catch (error) {
      console.error('Database insertion failed:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to save profile to database.' 
      });
    }
  } catch (error) {
    console.error('Request processing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An unexpected error occurred.' 
    });
  }
}

// GET user's own profile
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Ensure user is authenticated (redundant with middleware but keeping for clarity)
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Get the authenticated user's profile
    const userProfile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, req.user.userId)
    });

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found for this user'
      });
    }

    res.json({ 
      success: true, 
      profile: userProfile 
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve profile from database.' 
    });
  }
});

// GET all profiles - restricted to recruiters and admins
router.get('/all', authenticate, authorize(['recruiter', 'admin']), async (req, res) => {
  try {
    const allProfiles = await db.query.profiles.findMany();
    res.json({ success: true, profiles: allProfiles });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve profiles from database.' 
    });
  }
});

// POST /api/profile - Create a new athlete profile (protected route)
router.post('/', authenticate, createProfile);

export default router; 