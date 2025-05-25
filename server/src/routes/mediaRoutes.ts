import { Router, Response, Request, NextFunction } from 'express';
import { z } from 'zod';
import { authenticateJWT } from '../middleware/authMiddleware';
import { requireSelfOrAdmin } from '../middleware/rbacMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { successResponse, errorResponse } from '../utils/responses';
import { db } from '../db/client';
import { mediaItems } from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import path from 'path';
import fs from 'fs/promises';
import { AuthRequest } from '../types';

// Create router
const router = Router();

// Schema for updating media items
const updateMediaSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  url: z.string().url('Invalid URL format').optional(),
});

// Schema for bulk operations
const bulkUploadSchema = z.object({
  mediaItems: z.array(z.object({
    title: z.string().min(1, 'Title is required'),
    mediaType: z.enum(['highlight_video', 'image', 'document']),
    description: z.string().optional(),
    videoUrl: z.string().url('Invalid URL format').optional(),
    imageUrl: z.string().optional(),
    documentUrl: z.string().optional(),
    isFeatured: z.boolean().default(false),
    isPublic: z.boolean().default(true)
  })).min(1, 'At least one media item is required').max(10, 'Maximum 10 items per batch')
});

const bulkDeleteSchema = z.object({
  mediaItemIds: z.array(z.number().positive('Media item ID must be positive')).min(1, 'At least one media item ID is required').max(20, 'Maximum 20 items per batch')
});

// Parameter schemas
const mediaIdParamSchema = z.object({
  mediaItemId: z.string().transform((val) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) {
      throw new Error('Media item ID must be a number');
    }
    return parsed;
  }),
});

const athleteProfileIdSchema = z.object({
  athleteProfileId: z.string().transform((val) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) {
      throw new Error('Athlete profile ID must be a number');
    }
    return parsed;
  }),
});

/**
 * Get a media item by ID
 */
async function getMediaItemById(id: number) {
  return db.select()
    .from(mediaItems)
    .where(eq(mediaItems.id, id))
    .limit(1);
}

/**
 * Get multiple media items by IDs
 */
async function getMediaItemsByIds(ids: number[]) {
  return db.select()
    .from(mediaItems)
    .where(inArray(mediaItems.id, ids));
}

/**
 * Get athlete profile ID for a media item
 */
async function getAthleteProfileId(mediaItemId: number) {
  const result = await getMediaItemById(mediaItemId);
  if (!result.length) {
    return null;
  }
  return result[0].athleteProfileUserId;
}

/**
 * Create multiple media items in a transaction
 */
async function createMultipleMediaItems(athleteProfileUserId: number, mediaItemsData: any[]) {
  const results = [];
  const errors = [];

  // Process each media item
  for (let i = 0; i < mediaItemsData.length; i++) {
    const item = mediaItemsData[i];
    try {
      const [result] = await db.insert(mediaItems).values({
        athleteProfileUserId,
        title: item.title,
        description: item.description || null,
        mediaType: item.mediaType,
        videoUrl: item.mediaType === 'highlight_video' ? item.videoUrl : null,
        imageUrl: item.mediaType === 'image' ? item.imageUrl : null,
        documentUrl: item.mediaType === 'document' ? item.documentUrl : null,
        isFeatured: item.isFeatured,
        isPublic: item.isPublic,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      results.push({ index: i, success: true, data: result });
        } catch (error) {      errors.push({ index: i, success: false, error: error instanceof Error ? error.message : 'Unknown error' });    }
  }

  return { results, errors };
}

/**
 * Update a media item
 */
async function updateMediaItem(id: number, mediaType: string, updateData: any) {
  // Prepare update object based on media type
  const updates: Record<string, any> = {};
  
  // Common update: title can be updated for all media types
  if (updateData.title !== undefined) {
    updates.title = updateData.title;
  }
  
  // Media-specific updates
  if (mediaType === 'highlight_video' || 
      mediaType === 'game_film' || 
      mediaType === 'training_clip') {
    // Video links can have URL updated
    if (updateData.url !== undefined) {
      updates.videoUrl = updateData.url;
    }
  }
  
  // Add updatedAt timestamp
  updates.updatedAt = new Date();
  
  // Only update if we have changes
  if (Object.keys(updates).length === 0) {
    return [];
  }
  
  // Perform the update
  return db.update(mediaItems)
    .set(updates)
    .where(eq(mediaItems.id, id))
    .returning();
}

/**
 * Delete file from disk
 */
async function deleteFile(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error(`Error deleting file: ${filePath}`, error);
    return false;
  }
}

/**
 * Delete a media item by ID
 */
async function deleteMediaItem(id: number, mediaType: string, imageUrl?: string) {
  // For images, delete the file from disk
  let fileDeleted = true;
  if (mediaType === 'image' && imageUrl) {
    // Convert URL to file path
    const relativePath = imageUrl.replace('/uploads/', '');
    const filePath = path.join(process.cwd(), 'uploads', relativePath);
    fileDeleted = await deleteFile(filePath);
  }
  
  // Delete from database
  const result = await db.delete(mediaItems)
    .where(eq(mediaItems.id, id))
    .returning();
  
  return { result, fileDeleted };
}

/**
 * Delete multiple media items with file cleanup
 */
async function deleteMultipleMediaItems(mediaItemsToDelete: any[]) {
  const results = [];
  const errors = [];

  for (const item of mediaItemsToDelete) {
    try {
      const { result, fileDeleted } = await deleteMediaItem(
        item.id,
        item.mediaType,
        item.imageUrl || undefined
      );

      if (result.length > 0) {
        results.push({
          id: item.id,
          success: true,
          fileDeleted: item.mediaType === 'image' ? fileDeleted : true,
          data: result[0]
        });
      } else {
        errors.push({
          id: item.id,
          success: false,
          error: 'Database deletion failed'
        });
      }
        } catch (error) {      errors.push({        id: item.id,        success: false,        error: error instanceof Error ? error.message : 'Unknown error'      });    }
  }

  return { results, errors };
}

/**
 * @route POST /api/media/:athleteProfileId/bulk
 * @desc Upload multiple media items
 * @access Private - Self or Admin
 */
router.post(
  '/:athleteProfileId/bulk',
  authenticateJWT,
  validateRequest({
    params: athleteProfileIdSchema,
    body: bulkUploadSchema,
  }),
  (req: Request, res: Response) => {
    try {
      const athleteProfileUserId = parseInt(req.params.athleteProfileId, 10);
      
      // Add userId param for requireSelfOrAdmin middleware
      req.params.userId = athleteProfileUserId.toString();
      
      requireSelfOrAdmin(req, res, async () => {
        const { mediaItems: mediaItemsData } = req.body;
        
        // Create multiple media items
        const { results, errors } = await createMultipleMediaItems(athleteProfileUserId, mediaItemsData);
        
        // Determine response status
        const totalItems = mediaItemsData.length;
        const successCount = results.length;
        const errorCount = errors.length;
        
        if (successCount === totalItems) {
          // All succeeded
          return res.status(201).json(successResponse(
            `Successfully created ${successCount} media items`,
            { created: results, failed: [] }
          ));
        } else if (successCount > 0) {
          // Partial success
          return res.status(207).json({
            success: true,
            message: `Created ${successCount} of ${totalItems} media items`,
            data: { created: results, failed: errors },
            warnings: [`${errorCount} items failed to create`]
          });
        } else {
          // All failed
          return res.status(400).json(errorResponse(
            'Failed to create any media items',
            { created: [], failed: errors }
          ));
        }
      });
    } catch (error) {
      console.error('Error creating bulk media items:', error);
      return res.status(500).json(errorResponse(
        'Failed to create bulk media items',
        error
      ));
    }
  }
);

/**
 * @route DELETE /api/media/bulk
 * @desc Delete multiple media items
 * @access Private - Self or Admin
 */
router.delete(
  '/bulk',
  authenticateJWT,
  validateRequest({
    body: bulkDeleteSchema,
  }),
  (req: Request, res: Response) => {
    try {
      const { mediaItemIds } = req.body;
      
      // Get all media items to validate ownership
      getMediaItemsByIds(mediaItemIds).then(async (mediaItemsToDelete) => {
        if (mediaItemsToDelete.length !== mediaItemIds.length) {
          const foundIds = mediaItemsToDelete.map(item => item.id);
          const missingIds = mediaItemIds.filter((id: number) => !foundIds.includes(id));
          return res.status(404).json(errorResponse(
            'Some media items not found',
            { missingIds }
          ));
        }
        
        // Validate user owns all media items (or is admin)
        const user = req.user;
        if (!user) {
          return res.status(401).json(errorResponse(
            'Authentication required',
            null
          ));
        }
        
        // Check ownership for each item
        const unauthorizedItems = [];
        if (user.role !== 'admin') {
          for (const item of mediaItemsToDelete) {
            if (item.athleteProfileUserId !== user.userId) {
              unauthorizedItems.push(item.id);
            }
          }
        }
        
        if (unauthorizedItems.length > 0) {
          return res.status(403).json(errorResponse(
            'Access denied: You can only delete your own media items',
            { unauthorizedIds: unauthorizedItems }
          ));
        }
        
        // Delete all media items
        const { results, errors } = await deleteMultipleMediaItems(mediaItemsToDelete);
        
        // Determine response
        const totalItems = mediaItemIds.length;
        const successCount = results.length;
        const errorCount = errors.length;
        
        if (successCount === totalItems) {
          // All succeeded
          const fileIssues = results.filter(r => !r.fileDeleted).length;
          if (fileIssues > 0) {
            return res.status(207).json({
              success: true,
              message: `Successfully deleted ${successCount} media items`,
              data: { deleted: results, failed: [] },
              warnings: [`${fileIssues} image files could not be deleted from disk`]
            });
          }
          return res.status(200).json(successResponse(
            `Successfully deleted ${successCount} media items`,
            { deleted: results, failed: [] }
          ));
        } else if (successCount > 0) {
          // Partial success
          return res.status(207).json({
            success: true,
            message: `Deleted ${successCount} of ${totalItems} media items`,
            data: { deleted: results, failed: errors },
            warnings: [`${errorCount} items failed to delete`]
          });
        } else {
          // All failed
          return res.status(400).json(errorResponse(
            'Failed to delete any media items',
            { deleted: [], failed: errors }
          ));
        }
      }).catch(error => {
        console.error('Error retrieving media items for bulk delete:', error);
        return res.status(500).json(errorResponse(
          'Failed to retrieve media items',
          error
        ));
      });
    } catch (error) {
      console.error('Error deleting bulk media items:', error);
      return res.status(500).json(errorResponse(
        'Failed to delete bulk media items',
        error
      ));
    }
  }
);

/**
 * @route PATCH /api/media/:mediaItemId
 * @desc Update a media item
 * @access Private - Self or Admin
 */
router.patch(
  '/:mediaItemId',
  authenticateJWT,
  validateRequest({
    params: mediaIdParamSchema,
    body: updateMediaSchema,
  }),
  (req: Request, res: Response) => {
    try {
      const mediaItemId = parseInt(req.params.mediaItemId, 10);
      
      // Get media item
      getMediaItemById(mediaItemId).then(mediaItemResult => {
        if (!mediaItemResult.length) {
          return res.status(404).json(errorResponse(
            'Media item not found',
            `No media item found with ID ${mediaItemId}`
          ));
        }
        
        const mediaItem = mediaItemResult[0];
        
        // For authorization, we need to check if the user owns this media item
        // Add userId param for the requireSelfOrAdmin middleware to check
        req.params.userId = mediaItem.athleteProfileUserId.toString();
        
        // Apply self or admin check middleware
        requireSelfOrAdmin(req, res, async () => {
          const updateData = req.body;
          
          // Update media item
          const result = await updateMediaItem(mediaItemId, mediaItem.mediaType, updateData);
          
          if (!result.length) {
            return res.status(400).json(errorResponse(
              'No updates applied',
              'No valid fields to update for this media type'
            ));
          }
          
          return res.status(200).json(successResponse(
            'Media item updated successfully',
            result[0]
          ));
        });
      }).catch(error => {
        console.error('Error retrieving media item:', error);
        return res.status(500).json(errorResponse(
          'Failed to retrieve media item',
          error
        ));
      });
    } catch (error) {
      console.error('Error updating media item:', error);
      return res.status(500).json(errorResponse(
        'Failed to update media item',
        error
      ));
    }
  }
);

/**
 * @route DELETE /api/media/:mediaItemId
 * @desc Delete a media item
 * @access Private - Self or Admin
 */
router.delete(
  '/:mediaItemId',
  authenticateJWT,
  validateRequest({
    params: mediaIdParamSchema,
  }),
  (req: Request, res: Response) => {
    try {
      const mediaItemId = parseInt(req.params.mediaItemId, 10);
      
      // Get media item
      getMediaItemById(mediaItemId).then(mediaItemResult => {
        if (!mediaItemResult.length) {
          return res.status(404).json(errorResponse(
            'Media item not found',
            `No media item found with ID ${mediaItemId}`
          ));
        }
        
        const mediaItem = mediaItemResult[0];
        
        // For authorization, we need to check if the user owns this media item
        // Add userId param for the requireSelfOrAdmin middleware to check
        req.params.userId = mediaItem.athleteProfileUserId.toString();
        
        // Apply self or admin check middleware
        requireSelfOrAdmin(req, res, async () => {
          // Delete media item
          const { result, fileDeleted } = await deleteMediaItem(
            mediaItemId, 
            mediaItem.mediaType, 
            // Fix the type error by providing undefined if imageUrl is null
            mediaItem.imageUrl || undefined
          );
          
          if (!result.length) {
            return res.status(500).json(errorResponse(
              'Failed to delete media item',
              'Database operation failed'
            ));
          }
          
          // If it was an image but file deletion failed
          if (mediaItem.mediaType === 'image' && !fileDeleted) {
            // Still return success for the DB operation, but note the file issue
            return res.status(207).json({
              success: true,
              message: 'Media item record deleted, but file deletion failed',
              data: result[0],
              warnings: ['Physical file could not be deleted']
            });
          }
          
          return res.status(200).json(successResponse(
            'Media item deleted successfully',
            result[0]
          ));
        });
      }).catch(error => {
        console.error('Error retrieving media item:', error);
        return res.status(500).json(errorResponse(
          'Failed to retrieve media item',
          error
        ));
      });
    } catch (error) {
      console.error('Error deleting media item:', error);
      return res.status(500).json(errorResponse(
        'Failed to delete media item',
        error
      ));
    }
  }
);

export default router; 