import { testDb } from '../setup';
import { users, athleteProfiles, mediaItems } from '../../src/db/schema';
import bcrypt from 'bcrypt';

// User factory
export interface CreateUserOptions {
  email?: string;
  password?: string;
  role?: 'athlete' | 'admin';
  verified?: boolean;
}

export async function createTestUser(options: CreateUserOptions = {}) {
  const {
    email = `test-${Date.now()}@example.com`,
    password = 'password123',
    role = 'athlete',
    verified = true
  } = options;

  const hashedPassword = await bcrypt.hash(password, 10);

  const [user] = await testDb.insert(users).values({
    email,
    hashedPassword,
    role,
    isVerified: verified,
    emailVerificationToken: verified ? null : 'test-verification-token',
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();

  return { ...user, plainPassword: password };
}

// Athlete Profile factory
export interface CreateProfileOptions {
  userId?: number;
  firstName?: string;
  lastName?: string;
  graduationYear?: number;
}

export async function createTestProfile(options: CreateProfileOptions = {}) {
  const {
    userId,
    firstName = 'Test',
    lastName = 'Athlete',
    graduationYear = 2025
  } = options;

  // Create user if not provided
  let profileUserId = userId;
  if (!profileUserId) {
    const user = await createTestUser({ role: 'athlete' });
    profileUserId = user.id;
  }

  const [profile] = await testDb.insert(athleteProfiles).values({
    userId: profileUserId,
    firstName,
    lastName,
    sport: 'Football',
    graduationYear,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();

  return profile;
}

// Media Item factory
export interface CreateMediaOptions {
  athleteProfileUserId?: number;
  mediaType?: 'highlight_video' | 'image' | 'document';
  title?: string;
  description?: string;
  videoUrl?: string;
  imageUrl?: string;
  documentUrl?: string;
  isFeatured?: boolean;
  isPublic?: boolean;
}

export async function createTestMediaItem(options: CreateMediaOptions = {}) {
  const {
    athleteProfileUserId,
    mediaType = 'highlight_video',
    title = `Test ${mediaType}`,
    description = `Test ${mediaType} description`,
    videoUrl,
    imageUrl,
    documentUrl,
    isFeatured = false,
    isPublic = true
  } = options;

  // Create profile if not provided
  let profileUserId = athleteProfileUserId;
  if (!profileUserId) {
    const profile = await createTestProfile();
    profileUserId = profile.userId;
  }

  const [mediaItem] = await testDb.insert(mediaItems).values({
    athleteProfileUserId: profileUserId,
    title,
    description,
    mediaType,
    videoUrl: mediaType === 'highlight_video' ? (videoUrl || 'https://example.com/test-video.mp4') : null,
    imageUrl: mediaType === 'image' ? (imageUrl || '/uploads/profile-photos/test-image.jpg') : null,
    documentUrl: mediaType === 'document' ? (documentUrl || '/uploads/documents/test-document.pdf') : null,
    isFeatured,
    isPublic,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();

  return mediaItem;
}

// Convenience function to create complete test scenario
export async function createTestScenario() {
  const user = await createTestUser({
    email: 'athlete@example.com',
    role: 'athlete',
    verified: true
  });

  const profile = await createTestProfile({
    userId: user.id,
    firstName: 'John',
    lastName: 'Doe'
  });

  const videoMedia = await createTestMediaItem({
    athleteProfileUserId: user.id,
    mediaType: 'highlight_video',
    title: 'Season Highlights',
    isFeatured: true
  });

  const imageMedia = await createTestMediaItem({
    athleteProfileUserId: user.id,
    mediaType: 'image',
    title: 'Profile Photo'
  });

  const documentMedia = await createTestMediaItem({
    athleteProfileUserId: user.id,
    mediaType: 'document',
    title: 'Academic Transcript'
  });

  return {
    user,
    profile,
    media: {
      video: videoMedia,
      image: imageMedia,
      document: documentMedia
    }
  };
}

// Admin user factory
export async function createTestAdmin() {
  return createTestUser({
    email: 'admin@example.com',
    role: 'admin',
    verified: true
  });
} 