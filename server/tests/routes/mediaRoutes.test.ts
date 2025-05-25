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

describe('Media Routes - Edit & Delete', () => {
  let athleteUser: any;
  let adminUser: any;
  let otherUser: any;
  let athleteProfile: any;
  let videoMediaItem: any;
  let imageMediaItem: any;
  let pdfMediaItem: any;

  beforeEach(async () => {
    await cleanupTestDatabase();

    // Create test users
    athleteUser = await createTestUser({ role: 'athlete' });
    adminUser = await createTestUser({ role: 'admin' });
    otherUser = await createTestUser({ role: 'athlete' });

    // Create athlete profile
    athleteProfile = await createTestProfile({ userId: athleteUser.id });

    // Create test media items
    videoMediaItem = await createTestMediaItem({
      athleteProfileUserId: athleteUser.id,
      mediaType: 'highlight_video',
      title: 'Original Video Title',
      videoUrl: 'https://youtube.com/watch?v=original'
    });

    imageMediaItem = await createTestMediaItem({
      athleteProfileUserId: athleteUser.id,
      mediaType: 'image',
      title: 'Original Image Title',
      imageUrl: '/uploads/profile-photos/test-image.jpg'
    });

    pdfMediaItem = await createTestMediaItem({
      athleteProfileUserId: athleteUser.id,
      mediaType: 'document',
      title: 'Original PDF Title'
    });
  });

  describe('PATCH /api/media/:mediaItemId', () => {
    it('should successfully update video media title and URL', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);
      
      const updateData = {
        title: 'Updated Video Title',
        url: 'https://youtube.com/watch?v=updated'
      };

      const response = await request(app)
        .patch(`/api/media/${videoMediaItem.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Media item updated successfully');
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.videoUrl).toBe(updateData.url);
    });

    it('should successfully update PDF title only', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);
      
      const updateData = {
        title: 'Updated PDF Title'
      };

      const response = await request(app)
        .patch(`/api/media/${pdfMediaItem.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
    });

    it('should successfully update image title only', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);
      
      const updateData = {
        title: 'Updated Image Title'
      };

      const response = await request(app)
        .patch(`/api/media/${imageMediaItem.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
    });

    it('should allow admin to update any media item', async () => {
      const token = generateToken(adminUser.id, adminUser.email, adminUser.role);
      
      const updateData = {
        title: 'Admin Updated Title'
      };

      const response = await request(app)
        .patch(`/api/media/${videoMediaItem.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
    });

    it('should reject invalid update payload', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);
      
      const invalidData = {
        title: '', // Empty title should be invalid
        url: 'not-a-valid-url'
      };

      const response = await request(app)
        .patch(`/api/media/${videoMediaItem.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject unauthorized access', async () => {
      const token = generateToken(otherUser.id, otherUser.email, otherUser.role);
      
      const updateData = {
        title: 'Unauthorized Update'
      };

      const response = await request(app)
        .patch(`/api/media/${videoMediaItem.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied: You can only access your own data');
    });

    it('should reject unauthenticated requests', async () => {
      const updateData = {
        title: 'Unauthenticated Update'
      };

      const response = await request(app)
        .patch(`/api/media/${videoMediaItem.id}`)
        .send(updateData)
        .expect(401);

      expect(response.body.message).toBe('Authentication required');
    });

    it('should return 404 for non-existent media item', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);
      
      const updateData = {
        title: 'Update Non-existent'
      };

      const response = await request(app)
        .patch('/api/media/99999')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Media item not found');
    });

    it('should reject invalid media item ID', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);
      
      const updateData = {
        title: 'Invalid ID Update'
      };

      const response = await request(app)
        .patch('/api/media/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/media/:mediaItemId', () => {
    it('should successfully delete video media item', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);

      const response = await request(app)
        .delete(`/api/media/${videoMediaItem.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Media item deleted successfully');
    });

    it('should successfully delete PDF media item', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);

      const response = await request(app)
        .delete(`/api/media/${pdfMediaItem.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Media item deleted successfully');
    });

    it('should successfully delete image media item (file deletion success)', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);

      // Create a mock file for testing
      const uploadsDir = path.join(process.cwd(), 'uploads', 'profile-photos');
      await fs.mkdir(uploadsDir, { recursive: true });
      const testFilePath = path.join(uploadsDir, 'test-image.jpg');
      await fs.writeFile(testFilePath, 'test image content');

      const response = await request(app)
        .delete(`/api/media/${imageMediaItem.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Media item deleted successfully');

      // Verify file was deleted
      try {
        await fs.access(testFilePath);
        fail('File should have been deleted');
      } catch (error) {
        // File successfully deleted
      }
    });

    it('should handle image media item deletion with file deletion failure', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);

      // Don't create the file, so deletion will fail
      const response = await request(app)
        .delete(`/api/media/${imageMediaItem.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(207); // 207 Multi-Status for partial success

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Media item record deleted, but file deletion failed');
      expect(response.body.warnings).toContain('Physical file could not be deleted');
    });

    it('should allow admin to delete any media item', async () => {
      const token = generateToken(adminUser.id, adminUser.email, adminUser.role);

      const response = await request(app)
        .delete(`/api/media/${videoMediaItem.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Media item deleted successfully');
    });

    it('should reject unauthorized access', async () => {
      const token = generateToken(otherUser.id, otherUser.email, otherUser.role);

      const response = await request(app)
        .delete(`/api/media/${videoMediaItem.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied: You can only access your own data');
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .delete(`/api/media/${videoMediaItem.id}`)
        .expect(401);

      expect(response.body.message).toBe('Authentication required');
    });

    it('should return 404 for non-existent media item', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);

      const response = await request(app)
        .delete('/api/media/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Media item not found');
    });

    it('should reject invalid media item ID', async () => {
      const token = generateToken(athleteUser.id, athleteUser.email, athleteUser.role);

      const response = await request(app)
        .delete('/api/media/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
}); 