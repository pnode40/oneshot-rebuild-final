import { eq, and, not } from 'drizzle-orm';
import { db } from '../db/client';
import { athleteProfiles } from '../db/schema/athleteProfiles';
import { mediaItems } from '../db/schema/mediaItems';

/**
 * Get public profile by slug
 * @param slug - The profile slug
 * @returns The public profile if found and public, null otherwise
 */
export const getPublicProfileBySlug = async (slug: string) => {
  try {
    // Find the athlete profile by slug
    const profile = await db.query.athleteProfiles.findFirst({
      where: eq(athleteProfiles.slug, slug)
    });

    // If profile doesn't exist or isn't public, return null
    if (!profile || !profile.isPublic) {
      return null;
    }

    // Apply visibility filters to the profile data
    const filteredProfile = applyVisibilityFilters(profile);

    // Get profile photos
    const photos = await db.query.mediaItems.findMany({
      where: eq(mediaItems.athleteProfileUserId, profile.userId),
      orderBy: (mediaItems, { desc }) => [desc(mediaItems.createdAt)]
    });

    // Return the public profile with photos
    return {
      ...filteredProfile,
      photos: photos || []
    };
  } catch (error) {
    console.error('Error fetching public profile by slug:', error);
    throw new Error('Failed to fetch public profile');
  }
};

/**
 * Check if a slug is available
 * @param slug - The slug to check
 * @param excludeUserId - Optional user ID to exclude from the check (for updates)
 * @returns True if the slug is available, false otherwise
 */
export const isSlugAvailable = async (slug: string, excludeUserId?: number): Promise<boolean> => {
  try {
    let query;
    
    if (excludeUserId) {
      // If we're updating a profile, exclude the current user's ID from the check
      query = db.select()
        .from(athleteProfiles)
        .where(and(
          eq(athleteProfiles.slug, slug),
          not(eq(athleteProfiles.userId, excludeUserId))
        ));
    } else {
      // For new profiles, just check if the slug exists
      query = db.select()
        .from(athleteProfiles)
        .where(eq(athleteProfiles.slug, slug));
    }
    
    const existingProfiles = await query;
    return existingProfiles.length === 0;
  } catch (error) {
    console.error('Error checking slug availability:', error);
    throw new Error('Failed to check slug availability');
  }
};

/**
 * Generate a slug from a name
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Generated slug
 */
export const generateSlug = (firstName: string, lastName: string): string => {
  // Convert to lowercase and replace non-alphanumeric characters with hyphens
  let slug = `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  // Remove consecutive hyphens
  slug = slug.replace(/-+/g, '-');
  
  // Remove leading and trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');
  
  return slug;
};

/**
 * Apply visibility filters to a profile based on its visibility settings
 * @param profile - The complete athlete profile
 * @returns The filtered profile with only visible fields
 */
const applyVisibilityFilters = (profile: any) => {
  const filteredProfile = { ...profile };
  
  // Apply field-level visibility filters
  if (!profile.showHeight) {
    filteredProfile.heightInches = null;
  }
  
  if (!profile.showWeight) {
    filteredProfile.weightLbs = null;
  }
  
  if (!profile.showGPA) {
    filteredProfile.gpa = null;
  }
  
  if (!profile.showTranscript) {
    filteredProfile.transcriptUrl = null;
  }
  
  if (!profile.showNcaaInfo || profile.athleteRole !== 'transfer_portal') {
    filteredProfile.ncaaId = null;
    filteredProfile.eligibilityStatus = null;
  }
  
  if (!profile.showPerformanceMetrics) {
    filteredProfile.fortyYardDash = null;
    filteredProfile.benchPressMax = null;
    filteredProfile.verticalLeap = null;
    filteredProfile.shuttleRun = null;
    filteredProfile.broadJump = null;
    filteredProfile.proAgility = null;
    filteredProfile.squat = null;
    filteredProfile.deadlift = null;
    filteredProfile.otherAthleticStats = null;
  }
  
  if (!profile.showCoachInfo) {
    filteredProfile.coachFirstName = null;
    filteredProfile.coachLastName = null;
    filteredProfile.coachEmail = null;
    filteredProfile.coachPhone = null;
    filteredProfile.isCoachVerified = null;
  }
  
  return filteredProfile;
};

/**
 * Generate a unique slug for a user
 * @param firstName - First name
 * @param lastName - Last name
 * @param userId - Optional user ID to exclude from uniqueness check
 * @returns A unique slug
 */
export const generateUniqueSlug = async (firstName: string, lastName: string, userId?: number): Promise<string> => {
  let baseSlug = generateSlug(firstName, lastName);
  let finalSlug = baseSlug;
  let counter = 1;
  
  // Check if the slug is already taken
  while (!(await isSlugAvailable(finalSlug, userId))) {
    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return finalSlug;
}; 