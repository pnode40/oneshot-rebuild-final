import { z } from 'zod';

/**
 * Zod enums that align with the Drizzle enum definitions
 */
export const footballPositions = z.enum([
  'QB', 'WR', 'RB', 'TE', 'OL', 'DL', 'LB', 'DB', 'K', 'P', 'LS', 'ATH'
]);

export const sports = z.enum(['Football']);

export const profileVisibility = z.enum(['public', 'private', 'recruiters_only']);

export const commitmentStatus = z.enum([
  'uncommitted', 'committed', 'signed', 'transfer_portal'
]);

/**
 * Position-specific metrics schemas
 */
export const qbMetricsSchema = z.object({
  passYards: z.number().int().min(0).optional(),
  passTDs: z.number().int().min(0).optional(),
  completionPercentage: z.number().min(0).max(100).optional(),
  interceptions: z.number().int().min(0).optional(),
  rushYards: z.number().int().optional(),
  rushTDs: z.number().int().min(0).optional(),
});

export const wrMetricsSchema = z.object({
  receptions: z.number().int().min(0).optional(),
  receivingYards: z.number().int().min(0).optional(),
  receivingTDs: z.number().int().min(0).optional(),
  yardsPerCatch: z.number().min(0).optional(),
});

export const rbMetricsSchema = z.object({
  rushingAttempts: z.number().int().min(0).optional(),
  rushingYards: z.number().int().min(0).optional(),
  rushingTDs: z.number().int().min(0).optional(),
  yardsPerCarry: z.number().min(0).optional(),
  receptions: z.number().int().min(0).optional(),
  receivingYards: z.number().int().min(0).optional(),
  receivingTDs: z.number().int().min(0).optional(),
});

/**
 * Base schema for athlete profile with common fields
 */
export const athleteProfileBaseSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(), // ISO date string
  city: z.string().optional(),
  state: z.string().optional(),
  highSchoolName: z.string().optional(),
  graduationYear: z.number().int().optional(),
  gpa: z.number().min(0).max(5).optional(),
  heightInches: z.number().int().min(36).max(96).optional(), // 3ft to 8ft
  weightLbs: z.number().int().min(50).max(500).optional(),
  sport: sports.default('Football'),
  primaryPosition: footballPositions,
  secondaryPosition: footballPositions.optional(),
  visibility: profileVisibility.default('public'),
  commitmentStatus: commitmentStatus.default('uncommitted'),
});

/**
 * Athletic metrics schema
 */
export const athleticMetricsSchema = z.object({
  fortyYardDash: z.number().min(3).max(10).optional(),
  benchPressMax: z.number().int().min(0).max(1000).optional(),
  verticalLeap: z.number().min(0).max(60).optional(),
  shuttleRun: z.number().min(0).max(20).optional(),
  otherAthleticStats: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
});

/**
 * Create athlete profile schema
 */
export const createAthleteProfileSchema = athleteProfileBaseSchema
  .merge(athleticMetricsSchema)
  .extend({
    profileImageUrl: z.string().url('Invalid profile image URL').optional(),
  });

/**
 * Update athlete profile schema
 * All fields are optional to allow for partial updates
 */
export const updateAthleteProfileSchema = athleteProfileBaseSchema
  .merge(athleticMetricsSchema)
  .partial()
  .extend({
    profileImageUrl: z.string().url('Invalid profile image URL').optional(),
  });

/**
 * Profile visibility settings schema
 */
export const visibilitySettingsSchema = z.object({
  visibility: profileVisibility,
});

/**
 * Filter/search schema for athlete profiles
 */
export const athleteProfileFilterSchema = z.object({
  sport: sports.optional(),
  position: footballPositions.optional(),
  graduationYearMin: z.number().int().optional(),
  graduationYearMax: z.number().int().optional(),
  state: z.string().optional(),
  heightInchesMin: z.number().int().optional(),
  heightInchesMax: z.number().int().optional(), 
  weightLbsMin: z.number().int().optional(),
  weightLbsMax: z.number().int().optional(),
  gpaMin: z.number().optional(),
  searchTerm: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

/**
 * Type definitions for the schemas
 */
export type AthleteProfileCreate = z.infer<typeof createAthleteProfileSchema>;
export type AthleteProfileUpdate = z.infer<typeof updateAthleteProfileSchema>;
export type AthleteProfileFilter = z.infer<typeof athleteProfileFilterSchema>;
export type VisibilitySettings = z.infer<typeof visibilitySettingsSchema>;
export type QBMetrics = z.infer<typeof qbMetricsSchema>;
export type WRMetrics = z.infer<typeof wrMetricsSchema>;
export type RBMetrics = z.infer<typeof rbMetricsSchema>;

/**
 * Export all schemas as a single object
 */
export const athleteProfileSchemas = {
  footballPositions,
  sports,
  profileVisibility,
  commitmentStatus,
  athleteProfileBaseSchema,
  athleticMetricsSchema,
  createAthleteProfileSchema,
  updateAthleteProfileSchema,
  visibilitySettingsSchema,
  athleteProfileFilterSchema,
  qbMetricsSchema,
  wrMetricsSchema,
  rbMetricsSchema
}; 