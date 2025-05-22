import { db } from '../db/client';
import { mediaItems } from '../db/schema/mediaItems';
import { eq, and } from 'drizzle-orm';
import { athleteProfiles } from '../db/schema/athleteProfiles';
import {
  AthleteProfileCreateMediaItemInput,
  AthleteProfileUpdateMediaItemInput,
} from '../validations/mediaItemSchemas';

export async function createMediaItemForAthlete(userId: number, data: AthleteProfileCreateMediaItemInput) {
  const profile = await db.query.athleteProfiles.findFirst({
    where: eq(athleteProfiles.userId, userId),
  });

  if (!profile) {
    throw new Error('Athlete profile not found for user');
  }

  const [created] = await db
    .insert(mediaItems)
    .values({
      athleteProfileUserId: profile.userId,
      ...data,
    })
    .returning();

  return created;
}

export async function getMediaItemsForAthleteProfile(userId: number) {
  const profile = await db.query.athleteProfiles.findFirst({
    where: eq(athleteProfiles.userId, userId),
  });

  if (!profile) {
    throw new Error('Athlete profile not found');
  }

  return db
    .select()
    .from(mediaItems)
    .where(eq(mediaItems.athleteProfileUserId, profile.userId));
}

export async function updateMediaItemForAthlete(id: number, userId: number, data: AthleteProfileUpdateMediaItemInput) {
  const profile = await db.query.athleteProfiles.findFirst({
    where: eq(athleteProfiles.userId, userId),
  });

  if (!profile) {
    throw new Error('Athlete profile not found');
  }

  const [updated] = await db
    .update(mediaItems)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(mediaItems.id, id),
        eq(mediaItems.athleteProfileUserId, profile.userId)
      )
    )
    .returning();

  return updated;
}

export async function deleteMediaItemForAthlete(id: number, userId: number) {
  const profile = await db.query.athleteProfiles.findFirst({
    where: eq(athleteProfiles.userId, userId),
  });

  if (!profile) {
    throw new Error('Athlete profile not found');
  }

  const deleted = await db
    .delete(mediaItems)
    .where(
      and(
        eq(mediaItems.id, id),
        eq(mediaItems.athleteProfileUserId, profile.userId)
      )
    );

  return deleted;
}
