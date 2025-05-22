import request from 'supertest';
import express from 'express';
import { authenticateJWT } from '../../src/middleware/authMiddleware';
import { requireSelfOrAdmin } from '../../src/middleware/rbacMiddleware';
import mediaRoutes from '../../src/routes/mediaRoutes';
import fs from 'fs/promises';
import { db } from '../../src/db/client';
import path from 'path';

// Mock dependencies
jest.mock('../../src/middleware/authMiddleware', () => ({
  authenticateJWT: jest.fn((req, res, next) => next())
}));

jest.mock('../../src/middleware/rbacMiddleware', () => ({
  requireSelfOrAdmin: jest.fn((req, res, next) => next())
}));

jest.mock('fs/promises', () => ({
  access: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('../../src/db/client', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([{
      id: 1,
      athleteProfileUserId: 123,
      title: 'Test Media',
      description: 'Test description',
      mediaType: 'image',
      videoUrl: null,
      imageUrl: '/uploads/profile-photos/test-image.jpg',
      documentUrl: null,
      thumbnailUrl: null,
      isFeatured: false,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }]),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([{
      id: 1,
      athleteProfileUserId: 123,
      title: 'Updated Media',
      mediaType: 'image',
      updatedAt: new Date()
    }]),
    delete: jest.fn().mockReturnThis()
  }
}));

// Create test app with routes
const app = express();
app.use(express.json());
app.use('/', mediaRoutes);

describe('Media Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup authentication mocks for each test
    (authenticateJWT as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { userId: 123, email: 'test@example.com', role: 'athlete' };
      next();
    });
  });

  describe('PATCH /:mediaItemId', () => {
    test('should update a media item successfully', async () => {
      const res = await request(app)
        .patch('/1')
        .send({ title: 'Updated Media' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Media item updated successfully');
      expect(res.body.data.title).toBe('Updated Media');
    });

    test('should reject invalid update payload', async () => {
      const res = await request(app)
        .patch('/1')
        .send({ title: '' }); // Empty title is invalid

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should handle media item not found', async () => {
      // Mock DB to return empty array (no media found)
      const mockDb = db as any;
      mockDb.limit.mockResolvedValueOnce([]);

      const res = await request(app)
        .patch('/999')
        .send({ title: 'Updated Media' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Media item not found');
    });

    test('should handle unauthorized access', async () => {
      // Mock authentication middleware to simulate unauthorized access
      (authenticateJWT as jest.Mock).mockImplementation((req, res) => {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      });

      const res = await request(app)
        .patch('/1')
        .send({ title: 'Updated Media' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Authentication required');
    });

    test('should restrict updates for non-video media types', async () => {
      const mockDb = db as any;
      
      // Mock a PDF document
      mockDb.limit.mockResolvedValueOnce([{
        id: 2,
        athleteProfileUserId: 123,
        title: 'PDF Document',
        mediaType: 'PDF',
        documentUrl: 'document.pdf',
      }]);
      
      // Try to update URL for PDF (should be ignored)
      const res = await request(app)
        .patch('/2')
        .send({ 
          title: 'Updated PDF', 
          url: 'https://example.com/new.pdf' 
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // Only title should be updated, not URL
      expect(res.body.data.title).toBe('Updated PDF');
    });
  });

  describe('DELETE /:mediaItemId', () => {
    test('should delete a media item successfully', async () => {
      // Mock successful deletion
      const mockDb = db as any;
      mockDb.returning.mockResolvedValueOnce([{ id: 1, mediaType: 'image' }]);

      const res = await request(app)
        .delete('/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Media item deleted successfully');
      // File deletion should have been attempted for image
      expect(fs.unlink).toHaveBeenCalled();
    });

    test('should handle media item not found', async () => {
      // Mock DB to return empty array (no media found)
      const mockDb = db as any;
      mockDb.limit.mockResolvedValueOnce([]);

      const res = await request(app)
        .delete('/999');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Media item not found');
    });

    test('should handle file deletion failure', async () => {
      // Mock DB to return a media item
      const mockDb = db as any;
      mockDb.limit.mockResolvedValueOnce([{
        id: 1,
        athleteProfileUserId: 123,
        mediaType: 'image',
        imageUrl: '/uploads/profile-photos/test-image.jpg'
      }]);
      
      // Mock successful DB deletion
      mockDb.returning.mockResolvedValueOnce([{
        id: 1,
        mediaType: 'image'
      }]);
      
      // Mock file deletion failure
      (fs.access as jest.Mock).mockRejectedValueOnce(new Error('File not found'));

      const res = await request(app)
        .delete('/1');

      expect(res.status).toBe(207); // Partial success
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Media item record deleted, but file deletion failed');
      expect(res.body.warnings).toContain('Physical file could not be deleted');
    });

    test('should handle unauthorized access', async () => {
      // Mock authentication middleware to simulate unauthorized access
      (authenticateJWT as jest.Mock).mockImplementation((req, res) => {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      });

      const res = await request(app)
        .delete('/1');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Authentication required');
    });

    test('should not attempt file deletion for non-image media types', async () => {
      // Mock a video link media item
      const mockDb = db as any;
      mockDb.limit.mockResolvedValueOnce([{
        id: 3,
        athleteProfileUserId: 123,
        mediaType: 'highlight_video',
        videoUrl: 'https://example.com/video.mp4'
      }]);
      
      // Mock successful DB deletion
      mockDb.returning.mockResolvedValueOnce([{
        id: 3,
        mediaType: 'highlight_video'
      }]);

      const res = await request(app)
        .delete('/3');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Media item deleted successfully');
      // File deletion should NOT have been attempted for video
      expect(fs.unlink).not.toHaveBeenCalled();
    });
  });
}); 