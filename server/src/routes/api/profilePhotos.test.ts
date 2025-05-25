import request from 'supertest';
import { app } from '../../index';
import { db } from '../../db/client';
import { mediaItems, users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs/promises';

// Test utilities
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const createTestUser = async (userData = {}) => {
  const defaultData = {
    email: 'test@example.com',
    hashedPassword: 'hashedPassword123',
    firstName: 'Test',
    lastName: 'User',
    role: 'athlete' as const,
  };
  
  const [user] = await db.insert(users)
    .values({ ...defaultData, ...userData })
    .returning();
    
  return user;
};

const generateAuthToken = (userId: number, role: string = 'athlete') => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '1h' });
};

const createTestPhoto = async (userId: number) => {
  const [photo] = await db.insert(mediaItems).values({
    athleteProfileUserId: userId,
    title: 'Test Profile Photo',
    description: 'Test description',
    imageUrl: '/uploads/test-photo.jpg',
    mediaType: 'image',
    isFeatured: false,
    isPublic: true,
  }).returning();
  
  return photo;
};

// Test setup and teardown
beforeEach(async () => {
  // Clear test data
  await db.delete(mediaItems);
  await db.delete(users);
});

afterAll(async () => {
  // Clean up test data
  await db.delete(mediaItems);
  await db.delete(users);
});

describe('POST /api/profile-photos/:userId', () => {
  describe('✅ Success Cases', () => {
    it('should upload profile photo successfully for own account', async () => {
      const user = await createTestUser();
      const token = generateAuthToken(user.id);
      
      // Create a test image file
      const testImagePath = path.join(__dirname, '../../../test-assets/test-image.jpg');
      
      const response = await request(app)
        .post(`/api/profile-photos/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .attach('profilePhoto', Buffer.from('fake-image-data'), 'test.jpg')
        .field('title', 'My Profile Photo')
        .field('description', 'Test description')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Profile photo uploaded successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe('My Profile Photo');
      expect(response.body.data.mediaType).toBe('image');
    });

    it('should allow admin to upload photo for any user', async () => {
      const user = await createTestUser();
      const admin = await createTestUser({ email: 'admin@example.com', role: 'admin' });
      const adminToken = generateAuthToken(admin.id, 'admin');
      
      const response = await request(app)
        .post(`/api/profile-photos/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('profilePhoto', Buffer.from('fake-image-data'), 'test.jpg')
        .field('title', 'Admin Upload')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.athleteProfileUserId).toBe(user.id);
    });
  });

  describe('❌ Error Cases', () => {
    it('should reject upload without authentication', async () => {
      const user = await createTestUser();
      
      await request(app)
        .post(`/api/profile-photos/${user.id}`)
        .attach('profilePhoto', Buffer.from('fake-image-data'), 'test.jpg')
        .expect(401);
    });

    it('should reject user trying to upload for different user', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser({ email: 'user2@example.com' });
      const token = generateAuthToken(user1.id);
      
      await request(app)
        .post(`/api/profile-photos/${user2.id}`)
        .set('Authorization', `Bearer ${token}`)
        .attach('profilePhoto', Buffer.from('fake-image-data'), 'test.jpg')
        .expect(403);
    });

    it('should reject upload without file', async () => {
      const user = await createTestUser();
      const token = generateAuthToken(user.id);
      
      const response = await request(app)
        .post(`/api/profile-photos/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'Test Photo')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No file uploaded');
    });

    it('should reject when photo limit exceeded', async () => {
      const user = await createTestUser();
      const token = generateAuthToken(user.id);
      
      // Create 5 existing photos
      for (let i = 0; i < 5; i++) {
        await createTestPhoto(user.id);
      }
      
      const response = await request(app)
        .post(`/api/profile-photos/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .attach('profilePhoto', Buffer.from('fake-image-data'), 'test.jpg')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Photo limit exceeded');
    });

    it('should reject invalid userId parameter', async () => {
      const token = generateAuthToken(1);
      
      await request(app)
        .post('/api/profile-photos/invalid')
        .set('Authorization', `Bearer ${token}`)
        .attach('profilePhoto', Buffer.from('fake-image-data'), 'test.jpg')
        .expect(400);
    });
  });
});

describe('GET /api/profile-photos/:userId', () => {
  describe('✅ Success Cases', () => {
    it('should get all profile photos for user', async () => {
      const user = await createTestUser();
      const token = generateAuthToken(user.id);
      
      // Create test photos
      await createTestPhoto(user.id);
      await createTestPhoto(user.id);
      
      const response = await request(app)
        .get(`/api/profile-photos/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('imageUrl');
      expect(response.body.data[0].mediaType).toBe('image');
    });

    it('should allow admin to get photos for any user', async () => {
      const user = await createTestUser();
      const admin = await createTestUser({ email: 'admin@example.com', role: 'admin' });
      const adminToken = generateAuthToken(admin.id, 'admin');
      
      await createTestPhoto(user.id);
      
      const response = await request(app)
        .get(`/api/profile-photos/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should return empty array when user has no photos', async () => {
      const user = await createTestUser();
      const token = generateAuthToken(user.id);
      
      const response = await request(app)
        .get(`/api/profile-photos/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('❌ Error Cases', () => {
    it('should reject unauthorized access', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser({ email: 'user2@example.com' });
      const token = generateAuthToken(user1.id);
      
      await request(app)
        .get(`/api/profile-photos/${user2.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should reject requests without authentication', async () => {
      const user = await createTestUser();
      
      await request(app)
        .get(`/api/profile-photos/${user.id}`)
        .expect(401);
    });
  });
});

describe('PATCH /api/profile-photos/item/:mediaItemId', () => {
  describe('✅ Success Cases', () => {
    it('should update profile photo metadata', async () => {
      const user = await createTestUser();
      const token = generateAuthToken(user.id);
      const photo = await createTestPhoto(user.id);
      
      const response = await request(app)
        .patch(`/api/profile-photos/item/${photo.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Title',
          description: 'Updated description'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
      expect(response.body.data.description).toBe('Updated description');
    });

    it('should allow partial updates', async () => {
      const user = await createTestUser();
      const token = generateAuthToken(user.id);
      const photo = await createTestPhoto(user.id);
      
      const response = await request(app)
        .patch(`/api/profile-photos/item/${photo.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Only Title Updated'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Only Title Updated');
      expect(response.body.data.description).toBe('Test description'); // Unchanged
    });
  });

  describe('❌ Error Cases', () => {
    it('should reject update with no fields', async () => {
      const user = await createTestUser();
      const token = generateAuthToken(user.id);
      const photo = await createTestPhoto(user.id);
      
      const response = await request(app)
        .patch(`/api/profile-photos/item/${photo.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject update of non-existent photo', async () => {
      const user = await createTestUser();
      const token = generateAuthToken(user.id);
      
      const response = await request(app)
        .patch('/api/profile-photos/item/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'New Title' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Profile photo not found');
    });

    it('should reject unauthorized update', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser({ email: 'user2@example.com' });
      const token = generateAuthToken(user1.id);
      const photo = await createTestPhoto(user2.id);
      
      await request(app)
        .patch(`/api/profile-photos/item/${photo.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Unauthorized Update' })
        .expect(403);
    });
  });
});

describe('DELETE /api/profile-photos/item/:mediaItemId', () => {
  describe('✅ Success Cases', () => {
    it('should delete profile photo successfully', async () => {
      const user = await createTestUser();
      const token = generateAuthToken(user.id);
      const photo = await createTestPhoto(user.id);
      
      const response = await request(app)
        .delete(`/api/profile-photos/item/${photo.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Profile photo deleted successfully');
      
      // Verify photo was deleted from database
      const deletedPhoto = await db.select()
        .from(mediaItems)
        .where(eq(mediaItems.id, photo.id));
      
      expect(deletedPhoto).toHaveLength(0);
    });

    it('should allow admin to delete any photo', async () => {
      const user = await createTestUser();
      const admin = await createTestUser({ email: 'admin@example.com', role: 'admin' });
      const adminToken = generateAuthToken(admin.id, 'admin');
      const photo = await createTestPhoto(user.id);
      
      const response = await request(app)
        .delete(`/api/profile-photos/item/${photo.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('❌ Error Cases', () => {
    it('should reject deletion of non-existent photo', async () => {
      const user = await createTestUser();
      const token = generateAuthToken(user.id);
      
      const response = await request(app)
        .delete('/api/profile-photos/item/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Profile photo not found');
    });

    it('should reject unauthorized deletion', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser({ email: 'user2@example.com' });
      const token = generateAuthToken(user1.id);
      const photo = await createTestPhoto(user2.id);
      
      await request(app)
        .delete(`/api/profile-photos/item/${photo.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should reject deletion without authentication', async () => {
      const user = await createTestUser();
      const photo = await createTestPhoto(user.id);
      
      await request(app)
        .delete(`/api/profile-photos/item/${photo.id}`)
        .expect(401);
    });
  });
});

describe('🧨 Edge Cases', () => {
  it('should handle database connection failures gracefully', async () => {
    const user = await createTestUser();
    const token = generateAuthToken(user.id);
    
    // Mock database failure - properly type the mock
    const mockSelect = jest.spyOn(db, 'select').mockImplementation(() => {
      throw new Error('Database connection failed');
    });
    
    const response = await request(app)
      .get(`/api/profile-photos/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(500);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Failed to retrieve profile photos');
    
    // Restore mock
    mockSelect.mockRestore();
  });

  it('should handle file upload errors gracefully', async () => {
    const user = await createTestUser();
    const token = generateAuthToken(user.id);
    
    // Test with invalid file type
    const response = await request(app)
      .post(`/api/profile-photos/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .attach('profilePhoto', Buffer.from('not-an-image'), 'test.txt')
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('should handle concurrent photo uploads correctly', async () => {
    const user = await createTestUser();
    const token = generateAuthToken(user.id);
    
    // Create 4 existing photos
    for (let i = 0; i < 4; i++) {
      await createTestPhoto(user.id);
    }
    
    // Try to upload 2 photos simultaneously (should hit limit)
    const promises = [
      request(app)
        .post(`/api/profile-photos/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .attach('profilePhoto', Buffer.from('fake-image-1'), 'test1.jpg'),
      request(app)
        .post(`/api/profile-photos/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .attach('profilePhoto', Buffer.from('fake-image-2'), 'test2.jpg')
    ];
    
    const results = await Promise.all(promises);
    
    // One should succeed (201), one should fail due to limit (400)
    const statusCodes = results.map(r => r.status).sort();
    expect(statusCodes).toEqual([201, 400]);
  });
}); 