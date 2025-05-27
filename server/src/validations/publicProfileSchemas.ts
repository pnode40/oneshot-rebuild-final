import { z } from 'zod';

// Public profile params (slug)
export const publicProfileParamsSchema = z.object({
  slug: z.string().min(1, 'Profile slug is required')
});

// Slug validation schema
export const slugValidationSchema = z.object({
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must be at most 100 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen')
});

// Slug availability check schema
export const slugAvailabilitySchema = z.object({
  slug: z.string().min(1, 'Slug is required')
});

// Profile visibility toggle schema
export const profileVisibilitySchema = z.object({
  isPublic: z.boolean(),
  showHeight: z.boolean().optional(),
  showWeight: z.boolean().optional(),
  showGPA: z.boolean().optional(),
  showTranscript: z.boolean().optional(),
  showNcaaInfo: z.boolean().optional(),
  showPerformanceMetrics: z.boolean().optional(),
  showCoachInfo: z.boolean().optional()
});

// Coach information schema
export const coachInfoSchema = z.object({
  coachFirstName: z.string().min(1, 'Coach first name is required'),
  coachLastName: z.string().min(1, 'Coach last name is required'),
  coachEmail: z.string().email('Valid coach email is required'),
  coachPhone: z.string().min(10, 'Valid coach phone number is required')
});

// Featured video schema
export const featuredVideoSchema = z.object({
  featuredVideoUrl: z.string().url('Valid video URL is required'),
  featuredVideoType: z.enum(['youtube', 'hudl'], {
    required_error: 'Video type must be either "youtube" or "hudl"'
  }),
  featuredVideoThumbnail: z.string().url().optional()
});

// Public profile response schema (what gets returned to the client)
export const publicProfileResponseSchema = z.object({
  // Basic info (always visible)
  firstName: z.string(),
  lastName: z.string(),
  slug: z.string(),
  athleteRole: z.enum(['high_school', 'transfer_portal']),
  jerseyNumber: z.string().nullable().optional(),
  highSchoolName: z.string().nullable().optional(),
  graduationYear: z.number().nullable().optional(),
  positions: z.array(z.string()).nullable().optional(),
  primaryPosition: z.string().nullable().optional(),
  secondaryPosition: z.string().nullable().optional(),
  sport: z.string(),
  profileImageUrl: z.string().nullable().optional(),
  
  // Conditionally visible fields
  heightInches: z.number().nullable().optional(),
  weightLbs: z.number().nullable().optional(),
  gpa: z.number().nullable().optional(),
  transcriptUrl: z.string().nullable().optional(),
  
  // NCAA Info (only for transfer portal)
  ncaaId: z.string().nullable().optional(),
  eligibilityStatus: z.string().nullable().optional(),
  
  // Performance metrics
  fortyYardDash: z.number().nullable().optional(),
  benchPressMax: z.number().nullable().optional(),
  verticalLeap: z.number().nullable().optional(),
  shuttleRun: z.number().nullable().optional(),
  broadJump: z.number().nullable().optional(),
  proAgility: z.number().nullable().optional(),
  squat: z.number().nullable().optional(),
  deadlift: z.number().nullable().optional(),
  
  // Coach info
  coachFirstName: z.string().nullable().optional(),
  coachLastName: z.string().nullable().optional(),
  coachEmail: z.string().nullable().optional(),
  coachPhone: z.string().nullable().optional(),
  isCoachVerified: z.boolean().optional(),
  
  // Video info
  featuredVideoUrl: z.string().nullable().optional(),
  featuredVideoType: z.string().nullable().optional(),
  featuredVideoThumbnail: z.string().nullable().optional(),
  
  // Visibility flags (included for frontend filtering)
  showHeight: z.boolean().optional(),
  showWeight: z.boolean().optional(),
  showGPA: z.boolean().optional(),
  showTranscript: z.boolean().optional(),
  showNcaaInfo: z.boolean().optional(),
  showPerformanceMetrics: z.boolean().optional(),
  showCoachInfo: z.boolean().optional()
}); 