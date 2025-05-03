import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/client';
import { profiles } from '../db/schema';

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
async function createProfile(req: Request, res: Response) {
  try {
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
      // Insert the validated data into the profiles table
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
          benchPress: validatedData.benchPress
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

// GET all profiles
router.get('/all', async (req, res) => {
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

// POST /api/profile - Create a new athlete profile
router.post('/', createProfile);

export default router; 