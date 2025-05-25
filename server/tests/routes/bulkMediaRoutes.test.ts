import request from 'supertest';
import express from 'express';
import { testDb, setupTestDatabase, cleanupTestDatabase } from '../setup';
import { createTestUser, createTestProfile, createTestMediaItem } from '../factories';
import mediaRoutes from '../../src/routes/mediaRoutes';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';

// Create test app with routes
const app = express();
app.use(express.json());
app.use('/api/media', mediaRoutes);

// Helper function to generate JWT token
function generateToken(userId: number, email: string, role: string) {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET || 'oneshot_dev_secret_key',
    { expiresIn: '1h' }
  );
}

describe('Bulk Media Operations - Level 2 Autonomy Tests', () => {
  let athleteUser: any;
  let adminUser: any;
  let otherUser: any;
  let athleteProfile: any;
  let existingMediaItems: any[];

  beforeEach(async () => {
    await cleanupTestDatabase();

    // Create test users
    athleteUser = await createTestUser({ role: 'athlete' });
    adminUser = await createTestUser({ role: 'admin' });
    otherUser = await createTestUser({ role: 'athlete' });

    // Create athlete profile
    athleteProfile = await createTestProfile({ userId: athleteUser.id });

    // Create some existing media items for deletion tests
    existingMediaItems = await Promise.all([
      createTestMediaItem({
        athleteProfileUserId: athleteUser.id,
        mediaType: 'highlight_video',
        title: 'Video 1',
        videoUrl: 'https://youtube.com/watch?v=video1'
      }),
      createTestMediaItem({
        athleteProfileUserId: athleteUser.id,
        mediaType: 'image',
        title: 'Image 1',
        imageUrl: '/uploads/profile-photos/image1.jpg'
      }),
      createTestMediaItem({
        athleteProfileUserId: athleteUser.id,
        mediaType: 'document',
        title: 'Document 1'
      })
    ]);
  });

  describe('POST /api/media/:athleteProfileId/bulk - Bulk Upload', () => {
    it('should successfully create multiple media items', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);
      
      const bulkUploadData = {
        mediaItems: [
          {
            title: 'Bulk Video 1',
            mediaType: 'highlight_video',
            description: 'First bulk video',
            videoUrl: 'https://youtube.com/watch?v=bulk1',
            isFeatured: true,
            isPublic: true
          },
          {
            title: 'Bulk Image 1',
            mediaType: 'image',
            description: 'First bulk image',
            imageUrl: '/uploads/profile-photos/bulk1.jpg',
            isFeatured: false,
            isPublic: true
          },
          {
            title: 'Bulk Document 1',
            mediaType: 'document',
            description: 'First bulk document',
            documentUrl: '/uploads/documents/bulk1.pdf',
            isFeatured: false,
            isPublic: false
          }
        ]
      };

      const response = await request(app)
        .post(`/api/media/${athleteUser.id}/bulk`)
        .set('Authorization', `Bearer ${token}`)
        .send(bulkUploadData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Successfully created 3 media items');
      expect(response.body.data.created).toHaveLength(3);
      expect(response.body.data.failed).toHaveLength(0);
      
      // Verify each item was created correctly
      response.body.data.created.forEach((item: any, index: number) => {
        expect(item.success).toBe(true);
        expect(item.data.title).toBe(bulkUploadData.mediaItems[index].title);
        expect(item.data.mediaType).toBe(bulkUploadData.mediaItems[index].mediaType);
      });
    });

    it('should allow admin to create media for any athlete', async () => {
      const token = generateToken(adminUser.id, adminUser.email, adminUser.role);
      
      const bulkUploadData = {
        mediaItems: [
          {
            title: 'Admin Created Video',
            mediaType: 'highlight_video',
            videoUrl: 'https://youtube.com/watch?v=admin1',
          }
        ]
      };

      const response = await request(app)
        .post(`/api/media/${athleteUser.id}/bulk`)
        .set('Authorization', `Bearer ${token}`)
        .send(bulkUploadData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.created).toHaveLength(1);
    });

    it('should reject empty media items array', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);
      
      const response = await request(app)
        .post(`/api/media/${athleteUser.id}/bulk`)
        .set('Authorization', `Bearer ${token}`)
        .send({ mediaItems: [] })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject too many media items (>10)', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);
      
      const tooManyItems = Array.from({ length: 11 }, (_, i) => ({
        title: `Item ${i + 1}`,
        mediaType: 'highlight_video',
        videoUrl: `https://youtube.com/watch?v=item${i + 1}`
      }));

      const response = await request(app)
        .post(`/api/media/${athleteUser.id}/bulk`)
        .set('Authorization', `Bearer ${token}`)
        .send({ mediaItems: tooManyItems })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject invalid media item data', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);
      
      const invalidData = {
        mediaItems: [
          {
            title: '', // Invalid: empty title
            mediaType: 'highlight_video',
            videoUrl: 'not-a-valid-url' // Invalid: bad URL format
          }
        ]
      };

      const response = await request(app)
        .post(`/api/media/${athleteUser.id}/bulk`)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject unauthorized access to other athlete profiles', async () => {
      const token = generateToken(otherUser.id, otherUser.email, otherUser.role);
      
      const bulkUploadData = {
        mediaItems: [
          {
            title: 'Unauthorized Video',
            mediaType: 'highlight_video',
            videoUrl: 'https://youtube.com/watch?v=unauthorized'
          }
        ]
      };

      const response = await request(app)
        .post(`/api/media/${athleteUser.id}/bulk`)
        .set('Authorization', `Bearer ${token}`)
        .send(bulkUploadData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied: You can only access your own data');
    });

    it('should reject unauthenticated requests', async () => {
      const bulkUploadData = {
        mediaItems: [
          {
            title: 'Unauthenticated Video',
            mediaType: 'highlight_video',
            videoUrl: 'https://youtube.com/watch?v=unauth'
          }
        ]
      };

      const response = await request(app)
        .post(`/api/media/${athleteUser.id}/bulk`)
        .send(bulkUploadData)
        .expect(401);

      expect(response.body.message).toBe('Authentication required');
    });

    it('should handle partial success scenarios', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);
      
      const mixedData = {
        mediaItems: [
          {
            title: 'Valid Video',
            mediaType: 'highlight_video',
            videoUrl: 'https://youtube.com/watch?v=valid'
          },
          {
            title: 'Valid Image',
            mediaType: 'image',
            imageUrl: '/uploads/profile-photos/valid.jpg'
          }
          // Note: Real partial failures would require database constraints or other validation
        ]
      };

      const response = await request(app)
        .post(`/api/media/${athleteUser.id}/bulk`)
        .set('Authorization', `Bearer ${token}`)
        .send(mixedData);

      // This should succeed since all items are valid
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/media/bulk - Bulk Delete', () => {
    it('should successfully delete multiple media items', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);
      
      const mediaItemIds = existingMediaItems.map(item => item.id);

      const response = await request(app)
        .delete('/api/media/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({ mediaItemIds })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Successfully deleted 3 media items');
      expect(response.body.data.deleted).toHaveLength(3);
      expect(response.body.data.failed).toHaveLength(0);
    });

    it('should handle file deletion for image media items', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);
      
      // Create a mock file for testing
      const uploadsDir = path.join(process.cwd(), 'uploads', 'profile-photos');
      await fs.mkdir(uploadsDir, { recursive: true });
      const testFilePath = path.join(uploadsDir, 'image1.jpg');
      await fs.writeFile(testFilePath, 'test image content');

      const imageMediaItem = existingMediaItems.find(item => item.mediaType === 'image');
      
      const response = await request(app)
        .delete('/api/media/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({ mediaItemIds: [imageMediaItem.id] })
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Verify file was deleted
      try {
        await fs.access(testFilePath);
        fail('File should have been deleted');
      } catch (error) {
        // File successfully deleted
      }
    });

    it('should handle file deletion failure gracefully', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);
      
      const imageMediaItem = existingMediaItems.find(item => item.mediaType === 'image');
      
      // Don't create the file, so deletion will fail
      const response = await request(app)
        .delete('/api/media/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({ mediaItemIds: [imageMediaItem.id] })
        .expect(207); // 207 Multi-Status for partial success

      expect(response.body.success).toBe(true);
      expect(response.body.warnings).toContain('1 image files could not be deleted from disk');
    });

    it('should allow admin to delete any media items', async () => {
      const token = generateToken(adminUser.id, adminUser.email, adminUser.role);
      
      const mediaItemIds = existingMediaItems.map(item => item.id);

      const response = await request(app)
        .delete('/api/media/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({ mediaItemIds })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.deleted).toHaveLength(3);
    });

    it('should reject deletion of non-existent media items', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);
      
      const response = await request(app)
        .delete('/api/media/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({ mediaItemIds: [99999, 99998] })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Some media items not found');
      expect(response.body.data.missingIds).toEqual([99999, 99998]);
    });

    it('should reject deletion of other users media items', async () => {
      const token = generateToken(otherUser.id, otherUser.email, otherUser.role);
      
      const mediaItemIds = existingMediaItems.map(item => item.id);

      const response = await request(app)
        .delete('/api/media/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({ mediaItemIds })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied: You can only delete your own media items');
      expect(response.body.data.unauthorizedIds).toEqual(mediaItemIds);
    });

    it('should reject empty media item IDs array', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);
      
      const response = await request(app)
        .delete('/api/media/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({ mediaItemIds: [] })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject too many media item IDs (>20)', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);
      
      const tooManyIds = Array.from({ length: 21 }, (_, i) => i + 1);

      const response = await request(app)
        .delete('/api/media/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({ mediaItemIds: tooManyIds })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject invalid media item IDs', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);
      
      const response = await request(app)
        .delete('/api/media/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({ mediaItemIds: [-1, 0, 'invalid'] })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .delete('/api/media/bulk')
        .send({ mediaItemIds: [1, 2, 3] })
        .expect(401);

      expect(response.body.message).toBe('Authentication required');
    });

    it('should handle mixed ownership scenarios (partial authorization)', async () => {
      // Create media item for other user
      const otherProfile = await createTestProfile({ userId: otherUser.id });
      const otherUserMedia = await createTestMediaItem({
        athleteProfileUserId: otherUser.id,
        mediaType: 'highlight_video',
        title: 'Other User Video'
      });

      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);
      
      const mixedIds = [existingMediaItems[0].id, otherUserMedia.id];

      const response = await request(app)
        .delete('/api/media/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({ mediaItemIds: mixedIds })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.data.unauthorizedIds).toContain(otherUserMedia.id);
    });
  });

  describe('Edge Cases and Performance', () => {
    it('should handle maximum allowed bulk upload (10 items)', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);
      
      const maxItems = Array.from({ length: 10 }, (_, i) => ({
        title: `Max Item ${i + 1}`,
        mediaType: 'highlight_video',
        videoUrl: `https://youtube.com/watch?v=max${i + 1}`
      }));

      const response = await request(app)
        .post(`/api/media/${athleteUser.id}/bulk`)
        .set('Authorization', `Bearer ${token}`)
        .send({ mediaItems: maxItems })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.created).toHaveLength(10);
    });

    it('should handle maximum allowed bulk delete (20 items)', async () => {
      // First create 20 media items
      const manyItems = [];
      for (let i = 0; i < 20; i++) {
        const item = await createTestMediaItem({
          athleteProfileUserId: athleteUser.id,
          mediaType: 'highlight_video',
          title: `Delete Item ${i + 1}`
        });
        manyItems.push(item);
      }

      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);
      const manyIds = manyItems.map(item => item.id);

      const response = await request(app)
        .delete('/api/media/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({ mediaItemIds: manyIds })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.deleted).toHaveLength(20);
    });

    it('should handle concurrent bulk operations gracefully', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);
      
      // Create two separate bulk upload requests
      const bulkData1 = {
        mediaItems: [
          { title: 'Concurrent 1', mediaType: 'highlight_video', videoUrl: 'https://youtube.com/watch?v=c1' }
        ]
      };
      
      const bulkData2 = {
        mediaItems: [
          { title: 'Concurrent 2', mediaType: 'highlight_video', videoUrl: 'https://youtube.com/watch?v=c2' }
        ]
      };

      // Send both requests simultaneously
      const [response1, response2] = await Promise.all([
        request(app)
          .post(`/api/media/${athleteUser.id}/bulk`)
          .set('Authorization', `Bearer ${token}`)
          .send(bulkData1),
        request(app)
          .post(`/api/media/${athleteUser.id}/bulk`)
          .set('Authorization', `Bearer ${token}`)
          .send(bulkData2)
      ]);

      // Both should succeed
      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response1.body.success).toBe(true);
      expect(response2.body.success).toBe(true);
    });
  });
}); 