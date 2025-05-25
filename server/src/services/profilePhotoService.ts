import { db } from '../db/client';
import { mediaItems } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { ProfilePhotoUploadData, ProfilePhotoUpdateData } from '../validations/profilePhotoSchemas';

/**
 * Add a new profile photo to the media items table
 */
export async function addProfilePhoto(
  userId: number, 
  photoData: ProfilePhotoUploadData, 
  imageUrl: string
) {
  return db.insert(mediaItems).values({
    athleteProfileUserId: userId,
    title: photoData.title || 'Profile Photo',
    description: photoData.description || null,
    imageUrl: imageUrl,
    mediaType: 'image',
    isFeatured: false,
    isPublic: true,
  }).returning();
}

/**
 * Get all profile photos for a user
 */
export async function getProfilePhotos(userId: number) {
  return db.select()
    .from(mediaItems)
    .where(
      and(
        eq(mediaItems.athleteProfileUserId, userId),
        eq(mediaItems.mediaType, 'image')
      )
    )
    .orderBy(mediaItems.createdAt);
}

/**
 * Get a specific profile photo by ID and user
 */
export async function getProfilePhotoById(mediaItemId: number, userId: number) {
  return db.select()
    .from(mediaItems)
    .where(
      and(
        eq(mediaItems.id, mediaItemId),
        eq(mediaItems.athleteProfileUserId, userId),
        eq(mediaItems.mediaType, 'image')
      )
    )
    .limit(1);
}

/**
 * Get a profile photo by ID (for authorization purposes)
 */
export async function getProfilePhotoByIdForAuth(mediaItemId: number) {
  return db.select()
    .from(mediaItems)
    .where(
      and(
        eq(mediaItems.id, mediaItemId),
        eq(mediaItems.mediaType, 'image')
      )
    )
    .limit(1);
}

/**
 * Update a profile photo
 */
export async function updateProfilePhoto(
  mediaItemId: number, 
  userId: number, 
  updateData: ProfilePhotoUpdateData
) {
  // Prepare update object with only the fields that were provided
  const updates: Record<string, any> = {};
  
  if (updateData.title !== undefined) updates.title = updateData.title;
  if (updateData.description !== undefined) updates.description = updateData.description;
  
  // Add updatedAt timestamp
  updates.updatedAt = new Date();
  
  return db.update(mediaItems)
    .set(updates)
    .where(
      and(
        eq(mediaItems.id, mediaItemId),
        eq(mediaItems.athleteProfileUserId, userId),
        eq(mediaItems.mediaType, 'image')
      )
    )
    .returning();
}

/**
 * Delete a profile photo
 */
export async function deleteProfilePhoto(mediaItemId: number, userId: number) {
  return db.delete(mediaItems)
    .where(
      and(
        eq(mediaItems.id, mediaItemId),
        eq(mediaItems.athleteProfileUserId, userId),
        eq(mediaItems.mediaType, 'image')
      )
    )
    .returning();
}

/**
 * Count profile photos for a user (to enforce limits)
 */
export async function countProfilePhotos(userId: number): Promise<number> {
  const result = await db.select({ count: db.$count(mediaItems) })
    .from(mediaItems)
    .where(
      and(
        eq(mediaItems.athleteProfileUserId, userId),
        eq(mediaItems.mediaType, 'image')
      )
    );
  
  return result[0]?.count || 0;
} 