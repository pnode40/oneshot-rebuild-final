import { db } from '../db/client';
import { athleteProfiles } from '../db/schema/athleteProfiles';
import { eq, sql } from 'drizzle-orm';
import { AthleteProfileUpdate } from '../validations/athleteProfileSchemas';

/**
 * Get athlete profile by user ID
 * 
 * @param userId User ID to fetch profile for
 * @returns The athlete profile or null if not found
 */
export async function getAthleteProfileByUserId(userId: number) {
  try {
    const profile = await db.query.athleteProfiles.findFirst({
      where: eq(athleteProfiles.userId, userId)
    });
    
    return profile;
  } catch (error) {
    console.error('Error fetching athlete profile:', error);
    throw new Error('Failed to fetch athlete profile');
  }
}

/**
 * Create or update an athlete profile
 * 
 * @param userId User ID to create/update profile for
 * @param data Profile data to upsert
 * @returns The created or updated profile
 */
export async function upsertAthleteProfile(userId: number, data: AthleteProfileUpdate) {
  try {
    // First check if a profile exists
    const existingProfile = await getAthleteProfileByUserId(userId);
    
    // Convert numeric fields to SQL literals
    const prepareNumericValue = <T extends number | undefined>(value: T) => {
      return value !== undefined ? sql`${value}` : undefined;
    };
    
    if (existingProfile) {
      // Update existing profile
      // Create update object with proper handling of numeric fields
      const updateData: Record<string, any> = {
        ...data,
        updatedAt: new Date()
      };
      
      // Handle numeric fields properly
      if (data.graduationYear !== undefined) updateData.graduationYear = sql`${data.graduationYear}`;
      if (data.heightInches !== undefined) updateData.heightInches = sql`${data.heightInches}`;
      if (data.weightLbs !== undefined) updateData.weightLbs = sql`${data.weightLbs}`;
      if (data.gpa !== undefined) updateData.gpa = sql`${data.gpa}`;
      if (data.fortyYardDash !== undefined) updateData.fortyYardDash = sql`${data.fortyYardDash}`;
      if (data.benchPressMax !== undefined) updateData.benchPressMax = sql`${data.benchPressMax}`;
      if (data.verticalLeap !== undefined) updateData.verticalLeap = sql`${data.verticalLeap}`;
      if (data.shuttleRun !== undefined) updateData.shuttleRun = sql`${data.shuttleRun}`;
      
      const updatedProfile = await db
        .update(athleteProfiles)
        .set(updateData)
        .where(eq(athleteProfiles.userId, userId))
        .returning();
      
      return updatedProfile[0];
    } else {
      // Create new profile with required fields
      // We need to handle these separately due to typing issues
      const insertData: any = {
        userId,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        sport: data.sport || 'Football',
        visibility: data.visibility || 'public',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add optional fields if present
      if (data.phoneNumber !== undefined) insertData.phoneNumber = data.phoneNumber;
      if (data.dateOfBirth !== undefined) insertData.dateOfBirth = data.dateOfBirth;
      if (data.city !== undefined) insertData.city = data.city;
      if (data.state !== undefined) insertData.state = data.state;
      if (data.highSchoolName !== undefined) insertData.highSchoolName = data.highSchoolName;
      if (data.profileImageUrl !== undefined) insertData.profileImageUrl = data.profileImageUrl;
      if (data.primaryPosition !== undefined) insertData.primaryPosition = data.primaryPosition;
      if (data.secondaryPosition !== undefined) insertData.secondaryPosition = data.secondaryPosition;
      if (data.commitmentStatus !== undefined) insertData.commitmentStatus = data.commitmentStatus;
      if (data.otherAthleticStats !== undefined) insertData.otherAthleticStats = data.otherAthleticStats;
      
      // Handle numeric fields properly with SQL literals
      if (data.graduationYear !== undefined) insertData.graduationYear = sql`${data.graduationYear}`;
      if (data.heightInches !== undefined) insertData.heightInches = sql`${data.heightInches}`;
      if (data.weightLbs !== undefined) insertData.weightLbs = sql`${data.weightLbs}`;
      if (data.gpa !== undefined) insertData.gpa = sql`${data.gpa}`;
      if (data.fortyYardDash !== undefined) insertData.fortyYardDash = sql`${data.fortyYardDash}`;
      if (data.benchPressMax !== undefined) insertData.benchPressMax = sql`${data.benchPressMax}`;
      if (data.verticalLeap !== undefined) insertData.verticalLeap = sql`${data.verticalLeap}`;
      if (data.shuttleRun !== undefined) insertData.shuttleRun = sql`${data.shuttleRun}`;
      
      const newProfile = await db
        .insert(athleteProfiles)
        .values(insertData)
        .returning();
      
      return newProfile[0];
    }
  } catch (error) {
    console.error('Error upserting athlete profile:', error);
    throw new Error('Failed to create or update athlete profile');
  }
} 