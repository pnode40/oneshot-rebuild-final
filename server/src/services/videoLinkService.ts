import { db } from '../db/client';
import { mediaItems } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { VideoLinkUploadInput } from '../validations/videoLinkSchemas';

/**
 * Add a new video link to the media items table
 */
export async function addVideoLink(athleteProfileUserId: number, videoData: VideoLinkUploadInput) {
  return db.insert(mediaItems).values({
    athleteProfileUserId,
    title: videoData.title,
    description: videoData.description || null,
    videoUrl: videoData.url,
    mediaType: videoData.mediaType,
    isFeatured: false,
    isPublic: true,
  }).returning();
}

/**
 * Get all video links for an athlete profile
 */
export async function getVideoLinks(athleteProfileUserId: number) {
  return db.select()
    .from(mediaItems)
    .where(
      and(
        eq(mediaItems.athleteProfileUserId, athleteProfileUserId),
        eq(mediaItems.mediaType, 'highlight_video') ||
        eq(mediaItems.mediaType, 'game_film') ||
        eq(mediaItems.mediaType, 'training_clip')
      )
    );
}

/**
 * Get a single video link by ID
 */
export async function getVideoLinkById(id: number, athleteProfileUserId: number) {
  return db.select()
    .from(mediaItems)
    .where(
      and(
        eq(mediaItems.id, id),
        eq(mediaItems.athleteProfileUserId, athleteProfileUserId)
      )
    )
    .limit(1);
}

/**
 * Delete a video link
 */
export async function deleteVideoLink(id: number, athleteProfileUserId: number) {
  return db.delete(mediaItems)
    .where(
      and(
        eq(mediaItems.id, id),
        eq(mediaItems.athleteProfileUserId, athleteProfileUserId)
      )
    )
    .returning();
}

/**
 * Update a video link
 */
export async function updateVideoLink(id: number, athleteProfileUserId: number, updateData: Partial<VideoLinkUploadInput>) {
  // Prepare update object with only the fields that were provided
  const updates: Record<string, any> = {};
  
  if (updateData.title !== undefined) updates.title = updateData.title;
  if (updateData.description !== undefined) updates.description = updateData.description;
  if (updateData.url !== undefined) updates.videoUrl = updateData.url;
  if (updateData.mediaType !== undefined) updates.mediaType = updateData.mediaType;
  
  // Add updatedAt timestamp
  updates.updatedAt = new Date();
  
  return db.update(mediaItems)
    .set(updates)
    .where(
      and(
        eq(mediaItems.id, id),
        eq(mediaItems.athleteProfileUserId, athleteProfileUserId)
      )
    )
    .returning();
} 