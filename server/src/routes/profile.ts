import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/client';
import { profiles, athleteRoleEnum } from '../db/schema';
import { eq, and, sql, SQL } from 'drizzle-orm';
import { PgColumn } from 'drizzle-orm/pg-core';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { successResponse, errorResponse, validationErrorResponse } from '../utils/responses';
import slugify from 'slugify';

const router = Router();

// Helper function to generate and validate slug
async function generateUniqueSlug(fullName: string, id?: number): Promise<string> {
  // Generate base slug from full name
  let baseSlug = slugify(fullName, {
    lower: true,           // Convert to lowercase
    strict: true,          // Remove special characters
    trim: true             // Trim leading/trailing whitespace
  });
  
  // Ensure minimum length
  if (baseSlug.length < 3) {
    baseSlug = `${baseSlug}-profile`;
  }
  
  // Check if slug already exists (excluding this profile's ID if updating)
  let slug = baseSlug;
  let counter = 0;
  let isUnique = false;
  
  while (!isUnique) {
    // Query to check if slug exists
    const queryOptions = id 
      ? and(eq(profiles.customUrlSlug, slug), sql`${profiles.id} != ${id}`)
      : eq(profiles.customUrlSlug, slug);
      
    const existing = await db.query.profiles.findFirst({
      where: queryOptions,
      columns: { id: true }
    });
    
    if (!existing) {
      isUnique = true;
    } else {
      // Append counter to make unique
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
    
    // Safety check to prevent infinite loops
    if (counter > 100) {
      // Add random string if we hit too many iterations
      slug = `${baseSlug}-${Date.now().toString(36)}`;
      isUnique = true;
    }
  }
  
  return slug;
}

// Define enhanced validation schema for profile submission
const profileSchema = z.object({
  // Original fields
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
  
  // Basic Information Fields
  jerseyNumber: z.string().optional(),
  athleteRole: z.enum(['high_school', 'transfer_portal']).default('high_school'),
  customUrlSlug: z.string().optional(),
  highSchoolName: z.string().optional(),
  graduationYear: z.string().optional()
    .transform((val) => {
      if (!val) return null;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? null : parsed;
    }),
  gpa: z.string().optional()
    .transform((val) => {
      if (!val) return null;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? null : parsed;
    }),
  
  // Media URL Fields
  profilePhotoUrl: z.string().optional(),
  transcriptUrl: z.string().optional(),
  highlightVideoUrl: z.string().url("Must be a valid URL").optional(),
  
  // NCAA/Transfer Portal Fields
  ncaaId: z.string().optional(),
  eligibilityYearsRemaining: z.string().optional()
    .transform((val) => {
      if (!val) return null;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? null : parsed;
    }),
  transferPortalEntryDate: z.string().optional(), // We'll parse this into a Date
  
  // Visibility Control Flags
  isHeightVisible: z.boolean().default(true),
  isWeightVisible: z.boolean().default(true),
  isGpaVisible: z.boolean().default(true),
  isTranscriptVisible: z.boolean().default(true),
  isNcaaInfoVisible: z.boolean().default(true)
});

// Define type for validated profile data
type ProfileData = z.infer<typeof profileSchema>;

// Type guards for numeric fields to ensure type safety
const isNumber = (value: unknown): value is number => 
  typeof value === 'number' && !isNaN(value);

// Helper function to create profile data object with proper types
function createProfileDataObject(validatedData: ProfileData, userId: number, customUrlSlug: string, transferPortalEntryDate: Date | null) {
  // Convert numeric types to strings for Drizzle ORM
  const graduationYear = validatedData.graduationYear !== null 
    ? String(validatedData.graduationYear) 
    : null;
  
  const gpa = validatedData.gpa !== null 
    ? String(validatedData.gpa) 
    : null;
  
  const eligibilityYearsRemaining = validatedData.eligibilityYearsRemaining !== null
    ? String(validatedData.eligibilityYearsRemaining)
    : null;

  return {
    // Original fields
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
    userId: userId,
    
    // New fields
    jerseyNumber: validatedData.jerseyNumber,
    athleteRole: validatedData.athleteRole,
    customUrlSlug: customUrlSlug,
    highSchoolName: validatedData.highSchoolName,
    graduationYear, // Use string conversion
    gpa, // Use string conversion
    
    // Media URLs
    profilePhotoUrl: validatedData.profilePhotoUrl,
    transcriptUrl: validatedData.transcriptUrl,
    highlightVideoUrl: validatedData.highlightVideoUrl,
    
    // NCAA fields
    ncaaId: validatedData.ncaaId,
    eligibilityYearsRemaining, // Use string conversion
    transferPortalEntryDate: transferPortalEntryDate,
    
    // Visibility flags
    isHeightVisible: validatedData.isHeightVisible,
    isWeightVisible: validatedData.isWeightVisible,
    isGpaVisible: validatedData.isGpaVisible,
    isTranscriptVisible: validatedData.isTranscriptVisible,
    isNcaaInfoVisible: validatedData.isNcaaInfoVisible
  };
}

// Define handler function for creating a profile
async function createProfile(req: AuthRequest, res: Response) {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json(errorResponse('Authentication required'));
    }

    // Validate request body
    const validationResult = profileSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      // Convert zod error format to Record<string, string> format
      const formattedErrors: Record<string, string> = {};
      const errors = validationResult.error.flatten().fieldErrors;
      
      // Convert arrays of error messages to single strings
      Object.entries(errors).forEach(([key, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          formattedErrors[key] = messages[0];
        }
      });
      
      return res.status(400).json(validationErrorResponse(
        'Invalid profile data', 
        formattedErrors
      ));
    }

    const validatedData = validationResult.data;
    
    // Log the types of numeric fields to verify they are JavaScript numbers after Zod transformation
    console.log('--- Numeric field types after Zod validation ---');
    console.log(`graduationYear: ${typeof validatedData.graduationYear}`, validatedData.graduationYear);
    console.log(`gpa: ${typeof validatedData.gpa}`, validatedData.gpa);
    console.log(`eligibilityYearsRemaining: ${typeof validatedData.eligibilityYearsRemaining}`, validatedData.eligibilityYearsRemaining);
    
    try {
      // Check if user already has a profile
      const existingProfile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, req.user.userId)
      });

      if (existingProfile) {
        return res.status(409).json(errorResponse(
          'User already has a profile',
          { profileId: existingProfile.id }
        ));
      }

      // Generate a unique slug if not provided or empty
      const customUrlSlug = validatedData.customUrlSlug || 
        await generateUniqueSlug(validatedData.fullName);
      
      // Convert date string to Date object if provided
      let transferPortalEntryDate: Date | null = null;
      if (validatedData.transferPortalEntryDate) {
        transferPortalEntryDate = new Date(validatedData.transferPortalEntryDate);
      }
      
      // Insert the validated data into the profiles table
      // NOTE: We use sql`${...}` for numeric fields because Drizzle's TypeScript interface
      // expects string | SQL | PgColumn, not JavaScript numbers, despite the database schema
      // defining these as numeric types. This is a TypeScript type mapping quirk in Drizzle.
      const result = await db.insert(profiles)
        .values({
          // Text fields
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
          userId: req.user.userId,
          jerseyNumber: validatedData.jerseyNumber,
          athleteRole: validatedData.athleteRole,
          customUrlSlug,
          highSchoolName: validatedData.highSchoolName,
          
          // For numeric fields, we use sql`${...}` to properly handle the type conversion
          // between JavaScript numbers and PostgreSQL numeric types
          graduationYear: validatedData.graduationYear !== null 
            ? sql`${validatedData.graduationYear}` 
            : null,
          gpa: validatedData.gpa !== null 
            ? sql`${validatedData.gpa}` 
            : null,
          
          // Text URL fields
          profilePhotoUrl: validatedData.profilePhotoUrl,
          transcriptUrl: validatedData.transcriptUrl,
          highlightVideoUrl: validatedData.highlightVideoUrl,
          
          // Mixed fields
          ncaaId: validatedData.ncaaId,
          eligibilityYearsRemaining: validatedData.eligibilityYearsRemaining !== null 
            ? sql`${validatedData.eligibilityYearsRemaining}` 
            : null,
          transferPortalEntryDate,
          
          // Boolean fields
          isHeightVisible: validatedData.isHeightVisible,
          isWeightVisible: validatedData.isWeightVisible,
          isGpaVisible: validatedData.isGpaVisible,
          isTranscriptVisible: validatedData.isTranscriptVisible,
          isNcaaInfoVisible: validatedData.isNcaaInfoVisible
        })
        .returning();
      
      // Check if insertion was successful
      if (result && result[0]) {
        res.status(201).json(successResponse(
          'Profile created successfully',
          { profile: result[0] },
          201
        ));
      } else {
        throw new Error('Failed to retrieve inserted profile data');
      }
    } catch (error) {
      console.error('Database insertion failed:', error);
      res.status(500).json(errorResponse(
        'Failed to save profile to database.',
        error
      ));
    }
  } catch (error) {
    console.error('Request processing error:', error);
    res.status(500).json(errorResponse(
      'An unexpected error occurred.',
      error
    ));
  }
}

// Helper function to create update object with proper types
function createProfileUpdateObject(
  validatedData: Partial<ProfileData>,
  existingProfile: any,
  customUrlSlug: string | null,
  transferPortalEntryDate: Date | null | undefined
) {
  const updateValues: Record<string, any> = {};
  
  // Only include fields that have changed
  if (validatedData.fullName !== undefined) updateValues.fullName = validatedData.fullName;
  if (validatedData.email !== undefined) updateValues.email = validatedData.email;
  if (validatedData.highSchool !== undefined) updateValues.highSchool = validatedData.highSchool;
  if (validatedData.position !== undefined) updateValues.position = validatedData.position;
  if (validatedData.gradYear !== undefined) updateValues.gradYear = validatedData.gradYear;
  if (validatedData.cityState !== undefined) updateValues.cityState = validatedData.cityState;
  if (validatedData.heightFt !== undefined) updateValues.heightFt = validatedData.heightFt;
  if (validatedData.heightIn !== undefined) updateValues.heightIn = validatedData.heightIn;
  if (validatedData.weight !== undefined) updateValues.weight = validatedData.weight;
  if (validatedData.fortyYardDash !== undefined) updateValues.fortyYardDash = validatedData.fortyYardDash;
  if (validatedData.benchPress !== undefined) updateValues.benchPress = validatedData.benchPress;
  
  if (validatedData.jerseyNumber !== undefined) updateValues.jerseyNumber = validatedData.jerseyNumber;
  if (validatedData.athleteRole !== undefined) updateValues.athleteRole = validatedData.athleteRole;
  if (customUrlSlug !== null && customUrlSlug !== existingProfile.customUrlSlug) {
    updateValues.customUrlSlug = customUrlSlug;
  }
  if (validatedData.highSchoolName !== undefined) updateValues.highSchoolName = validatedData.highSchoolName;
  
  // Numeric fields - convert to strings for Drizzle ORM
  if (validatedData.graduationYear !== undefined) {
    updateValues.graduationYear = validatedData.graduationYear !== null 
      ? sql`${validatedData.graduationYear}` 
      : null;
  }
  
  if (validatedData.gpa !== undefined) {
    updateValues.gpa = validatedData.gpa !== null 
      ? sql`${validatedData.gpa}` 
      : null;
  }
  
  if (validatedData.profilePhotoUrl !== undefined) updateValues.profilePhotoUrl = validatedData.profilePhotoUrl;
  if (validatedData.transcriptUrl !== undefined) updateValues.transcriptUrl = validatedData.transcriptUrl;
  if (validatedData.highlightVideoUrl !== undefined) updateValues.highlightVideoUrl = validatedData.highlightVideoUrl;
  
  if (validatedData.ncaaId !== undefined) updateValues.ncaaId = validatedData.ncaaId;
  
  if (validatedData.eligibilityYearsRemaining !== undefined) {
    updateValues.eligibilityYearsRemaining = validatedData.eligibilityYearsRemaining !== null
      ? sql`${validatedData.eligibilityYearsRemaining}`
      : null;
  }
  
  if (transferPortalEntryDate !== undefined && transferPortalEntryDate !== existingProfile.transferPortalEntryDate) {
    updateValues.transferPortalEntryDate = transferPortalEntryDate;
  }
  
  if (validatedData.isHeightVisible !== undefined) updateValues.isHeightVisible = validatedData.isHeightVisible;
  if (validatedData.isWeightVisible !== undefined) updateValues.isWeightVisible = validatedData.isWeightVisible;
  if (validatedData.isGpaVisible !== undefined) updateValues.isGpaVisible = validatedData.isGpaVisible;
  if (validatedData.isTranscriptVisible !== undefined) updateValues.isTranscriptVisible = validatedData.isTranscriptVisible;
  if (validatedData.isNcaaInfoVisible !== undefined) updateValues.isNcaaInfoVisible = validatedData.isNcaaInfoVisible;
  
  return updateValues;
}

// Define handler function for updating a profile
async function updateProfile(req: AuthRequest, res: Response) {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json(errorResponse('Authentication required'));
    }

    // Validate request body
    const validationResult = profileSchema.partial().safeParse(req.body);
    
    if (!validationResult.success) {
      // Convert zod error format to Record<string, string> format
      const formattedErrors: Record<string, string> = {};
      const errors = validationResult.error.flatten().fieldErrors;
      
      // Convert arrays of error messages to single strings
      Object.entries(errors).forEach(([key, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          formattedErrors[key] = messages[0];
        }
      });
      
      return res.status(400).json(validationErrorResponse(
        'Invalid profile data', 
        formattedErrors
      ));
    }

    const validatedData = validationResult.data;
    
    // Log the types of numeric fields to verify they are JavaScript numbers
    console.log('--- Numeric field types in update operation ---');
    if (validatedData.graduationYear !== undefined) {
      console.log(`graduationYear: ${typeof validatedData.graduationYear}`, validatedData.graduationYear);
    }
    if (validatedData.gpa !== undefined) {
      console.log(`gpa: ${typeof validatedData.gpa}`, validatedData.gpa);
    }
    if (validatedData.eligibilityYearsRemaining !== undefined) {
      console.log(`eligibilityYearsRemaining: ${typeof validatedData.eligibilityYearsRemaining}`, validatedData.eligibilityYearsRemaining);
    }
    
    try {
      // Get user's existing profile
      const existingProfile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, req.user.userId)
      });

      if (!existingProfile) {
        return res.status(404).json(errorResponse(
          'Profile not found. Please create a profile first.'
        ));
      }

      // Generate a unique slug if provided but empty, or keep existing if not changing
      let customUrlSlug: string | null = null;
      
      if (validatedData.customUrlSlug !== undefined) {
        if (validatedData.customUrlSlug === '') {
          // Generate from name if empty string provided
          customUrlSlug = await generateUniqueSlug(
            validatedData.fullName || existingProfile.fullName, 
            existingProfile.id
          );
        } else {
          // Use the provided value
          customUrlSlug = validatedData.customUrlSlug;
        }
      }
      
      // Convert date string to Date object if provided
      let transferPortalEntryDate: Date | null | undefined = undefined;
      if (validatedData.transferPortalEntryDate !== undefined) {
        transferPortalEntryDate = validatedData.transferPortalEntryDate ? 
          new Date(validatedData.transferPortalEntryDate) : 
          null;
      }
      
      // Prepare the update values
      // NOTE: Using Record<string, any> is necessary here due to Drizzle's type system requirements
      const updateValues: Record<string, any> = {};
      
      // Text and other basic fields
      if (validatedData.fullName !== undefined) updateValues.fullName = validatedData.fullName;
      if (validatedData.email !== undefined) updateValues.email = validatedData.email;
      if (validatedData.highSchool !== undefined) updateValues.highSchool = validatedData.highSchool;
      if (validatedData.position !== undefined) updateValues.position = validatedData.position;
      if (validatedData.gradYear !== undefined) updateValues.gradYear = validatedData.gradYear;
      if (validatedData.cityState !== undefined) updateValues.cityState = validatedData.cityState;
      if (validatedData.heightFt !== undefined) updateValues.heightFt = validatedData.heightFt;
      if (validatedData.heightIn !== undefined) updateValues.heightIn = validatedData.heightIn;
      if (validatedData.weight !== undefined) updateValues.weight = validatedData.weight;
      if (validatedData.fortyYardDash !== undefined) updateValues.fortyYardDash = validatedData.fortyYardDash;
      if (validatedData.benchPress !== undefined) updateValues.benchPress = validatedData.benchPress;
      
      if (validatedData.jerseyNumber !== undefined) updateValues.jerseyNumber = validatedData.jerseyNumber;
      if (validatedData.athleteRole !== undefined) updateValues.athleteRole = validatedData.athleteRole;
      if (customUrlSlug !== null && customUrlSlug !== existingProfile.customUrlSlug) {
        updateValues.customUrlSlug = customUrlSlug;
      }
      if (validatedData.highSchoolName !== undefined) updateValues.highSchoolName = validatedData.highSchoolName;
      
      // Numeric fields using sql`${...}` to handle type conversions between
      // JavaScript numbers and PostgreSQL numeric types
      if (validatedData.graduationYear !== undefined) {
        updateValues.graduationYear = validatedData.graduationYear !== null 
          ? sql`${validatedData.graduationYear}` 
          : null;
      }
      
      if (validatedData.gpa !== undefined) {
        updateValues.gpa = validatedData.gpa !== null 
          ? sql`${validatedData.gpa}` 
          : null;
      }
      
      if (validatedData.profilePhotoUrl !== undefined) updateValues.profilePhotoUrl = validatedData.profilePhotoUrl;
      if (validatedData.transcriptUrl !== undefined) updateValues.transcriptUrl = validatedData.transcriptUrl;
      if (validatedData.highlightVideoUrl !== undefined) updateValues.highlightVideoUrl = validatedData.highlightVideoUrl;
      
      if (validatedData.ncaaId !== undefined) updateValues.ncaaId = validatedData.ncaaId;
      
      if (validatedData.eligibilityYearsRemaining !== undefined) {
        updateValues.eligibilityYearsRemaining = validatedData.eligibilityYearsRemaining !== null
          ? sql`${validatedData.eligibilityYearsRemaining}`
          : null;
      }
      
      if (transferPortalEntryDate !== undefined && transferPortalEntryDate !== existingProfile.transferPortalEntryDate) {
        updateValues.transferPortalEntryDate = transferPortalEntryDate;
      }
      
      if (validatedData.isHeightVisible !== undefined) updateValues.isHeightVisible = validatedData.isHeightVisible;
      if (validatedData.isWeightVisible !== undefined) updateValues.isWeightVisible = validatedData.isWeightVisible;
      if (validatedData.isGpaVisible !== undefined) updateValues.isGpaVisible = validatedData.isGpaVisible;
      if (validatedData.isTranscriptVisible !== undefined) updateValues.isTranscriptVisible = validatedData.isTranscriptVisible;
      if (validatedData.isNcaaInfoVisible !== undefined) updateValues.isNcaaInfoVisible = validatedData.isNcaaInfoVisible;
      
      // Update the profile with the valid fields
      const result = await db.update(profiles)
        .set(updateValues)
        .where(eq(profiles.userId, req.user.userId))
        .returning();
      
      // Check if update was successful
      if (result && result[0]) {
        res.status(200).json(successResponse(
          'Profile updated successfully',
          { profile: result[0] }
        ));
      } else {
        throw new Error('Failed to retrieve updated profile data');
      }
    } catch (error) {
      console.error('Database update failed:', error);
      res.status(500).json(errorResponse(
        'Failed to update profile in database.',
        error
      ));
    }
  } catch (error) {
    console.error('Request processing error:', error);
    res.status(500).json(errorResponse(
      'An unexpected error occurred.',
      error
    ));
  }
}

// GET user's own profile
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Ensure user is authenticated (redundant with middleware but keeping for clarity)
    if (!req.user) {
      return res.status(401).json(errorResponse('Authentication required'));
    }

    // Get the authenticated user's profile
    const userProfile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, req.user.userId)
    });

    if (!userProfile) {
      return res.status(404).json(errorResponse('Profile not found for this user'));
    }

    res.json(successResponse('Profile retrieved successfully', { profile: userProfile }));
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json(errorResponse(
      'Failed to retrieve profile from database.',
      error
    ));
  }
});

// GET public profile by slug
router.get('/public/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    if (!slug) {
      return res.status(400).json(errorResponse('Profile slug is required'));
    }

    // Get the profile by slug
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.customUrlSlug, slug)
    });

    if (!profile) {
      return res.status(404).json(errorResponse('Profile not found'));
    }

    // Apply visibility rules to create a public-safe version
    const publicProfile = {
      id: profile.id,
      fullName: profile.fullName,
      email: profile.email,
      highSchool: profile.highSchool,
      position: profile.position,
      gradYear: profile.gradYear,
      cityState: profile.cityState,
      
      // Apply visibility rules
      heightFt: profile.isHeightVisible ? profile.heightFt : null,
      heightIn: profile.isHeightVisible ? profile.heightIn : null,
      weight: profile.isWeightVisible ? profile.weight : null,
      
      // Other physical stats always visible
      fortyYardDash: profile.fortyYardDash,
      benchPress: profile.benchPress,
      
      // Basic Info Fields
      jerseyNumber: profile.jerseyNumber,
      athleteRole: profile.athleteRole,
      customUrlSlug: profile.customUrlSlug,
      highSchoolName: profile.highSchoolName,
      graduationYear: profile.graduationYear,
      gpa: profile.isGpaVisible ? profile.gpa : null,
      
      // Media URLs with visibility control
      profilePhotoUrl: profile.profilePhotoUrl,
      transcriptUrl: profile.isTranscriptVisible ? profile.transcriptUrl : null,
      highlightVideoUrl: profile.highlightVideoUrl,
      
      // NCAA fields with visibility control
      ncaaId: profile.isNcaaInfoVisible ? profile.ncaaId : null,
      eligibilityYearsRemaining: profile.isNcaaInfoVisible ? profile.eligibilityYearsRemaining : null,
      transferPortalEntryDate: profile.isNcaaInfoVisible ? profile.transferPortalEntryDate : null,
      
      // Hide all visibility flags
      createdAt: profile.createdAt
    };

    res.json(successResponse('Profile retrieved successfully', { profile: publicProfile }));
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json(errorResponse(
      'Failed to retrieve profile from database.',
      error
    ));
  }
});

// GET all profiles - restricted to recruiters and admins
router.get('/all', authenticate, authorize(['recruiter', 'admin']), async (req, res) => {
  try {
    const allProfiles = await db.query.profiles.findMany();
    res.json(successResponse('All profiles retrieved successfully', { profiles: allProfiles }));
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json(errorResponse(
      'Failed to retrieve profiles from database.',
      error
    ));
  }
});

// POST /api/profile - Create a new athlete profile (protected route)
router.post('/', authenticate, createProfile);

// PUT /api/profile - Update an existing athlete profile (protected route)
router.put('/', authenticate, updateProfile);

// Validate if a slug is available
router.get('/slug-available/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    if (!slug) {
      return res.status(400).json(errorResponse('Slug is required'));
    }
    
    const existingProfile = await db.query.profiles.findFirst({
      where: eq(profiles.customUrlSlug, slug),
      columns: { id: true }
    });
    
    res.json(successResponse('Slug availability checked', {
      slug,
      available: !existingProfile,
      valid: /^[a-z0-9-]+$/.test(slug) && slug.length >= 3 && slug.length <= 100
    }));
  } catch (error) {
    console.error('Error checking slug availability:', error);
    res.status(500).json(errorResponse(
      'Failed to check slug availability.',
      error
    ));
  }
});

export default router; 