import { Router, Response, Request } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import { requireSelfOrAdmin } from '../middleware/rbacMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { videoLinkUploadSchema } from '../validations/videoLinkSchemas';
import { z } from 'zod';
import { successResponse, errorResponse } from '../utils/responses';
import {
  addVideoLink,
  getVideoLinks,
  getVideoLinkById,
  updateVideoLink,
  deleteVideoLink
} from '../services/videoLinkService';

// Create router
const router = Router();

/**
 * @route POST /api/athlete/:athleteProfileId/videos
 * @desc Add a new video link to an athlete profile
 * @access Private - Self or Admin
 */
router.post(
  '/:athleteProfileId/videos',
  authenticateJWT,
  validateRequest({
    params: z.object({
      athleteProfileId: z.string().min(1, 'Athlete profile ID is required')
    }),
    body: videoLinkUploadSchema
  }),
  requireSelfOrAdmin,
  async (req: Request, res: Response) => {
    try {
      const athleteProfileId = parseInt(req.params.athleteProfileId, 10);
      const videoData = req.body;
      
      // Add video link to the database
      const result = await addVideoLink(athleteProfileId, videoData);
      
      return res.status(201).json(successResponse(
        'Video link added successfully',
        result[0]
      ));
    } catch (error) {
      console.error('Error adding video link:', error);
      return res.status(500).json(errorResponse(
        'Failed to add video link',
        error
      ));
    }
  }
);

/**
 * @route GET /api/athlete/:athleteProfileId/videos
 * @desc Get all video links for an athlete profile
 * @access Private - Self or Admin
 */
router.get(
  '/:athleteProfileId/videos',
  authenticateJWT,
  validateRequest({
    params: z.object({
      athleteProfileId: z.string().min(1, 'Athlete profile ID is required')
    })
  }),
  requireSelfOrAdmin,
  async (req: Request, res: Response) => {
    try {
      const athleteProfileId = parseInt(req.params.athleteProfileId, 10);
      
      // Get all video links for the profile
      const videos = await getVideoLinks(athleteProfileId);
      
      return res.status(200).json(successResponse(
        'Video links retrieved successfully',
        videos
      ));
    } catch (error) {
      console.error('Error retrieving video links:', error);
      return res.status(500).json(errorResponse(
        'Failed to retrieve video links',
        error
      ));
    }
  }
);

/**
 * @route GET /api/athlete/:athleteProfileId/videos/:videoId
 * @desc Get a specific video link
 * @access Private - Self or Admin
 */
router.get(
  '/:athleteProfileId/videos/:videoId',
  authenticateJWT,
  validateRequest({
    params: z.object({
      athleteProfileId: z.string().min(1, 'Athlete profile ID is required'),
      videoId: z.string().min(1, 'Video ID is required')
    })
  }),
  requireSelfOrAdmin,
  async (req: Request, res: Response) => {
    try {
      const athleteProfileId = parseInt(req.params.athleteProfileId, 10);
      const videoId = parseInt(req.params.videoId, 10);
      
      // Get the specific video link
      const result = await getVideoLinkById(videoId, athleteProfileId);
      
      if (!result.length) {
        return res.status(404).json(errorResponse(
          'Video not found',
          'No video exists with the provided ID for this athlete profile'
        ));
      }
      
      return res.status(200).json(successResponse(
        'Video retrieved successfully',
        result[0]
      ));
    } catch (error) {
      console.error('Error retrieving video:', error);
      return res.status(500).json(errorResponse(
        'Failed to retrieve video',
        error
      ));
    }
  }
);

/**
 * @route PUT /api/athlete/:athleteProfileId/videos/:videoId
 * @desc Update a video link
 * @access Private - Self or Admin
 */
router.put(
  '/:athleteProfileId/videos/:videoId',
  authenticateJWT,
  validateRequest({
    params: z.object({
      athleteProfileId: z.string().min(1, 'Athlete profile ID is required'),
      videoId: z.string().min(1, 'Video ID is required')
    }),
    body: videoLinkUploadSchema.partial()
  }),
  requireSelfOrAdmin,
  async (req: Request, res: Response) => {
    try {
      const athleteProfileId = parseInt(req.params.athleteProfileId, 10);
      const videoId = parseInt(req.params.videoId, 10);
      const updateData = req.body;
      
      // Update the video link
      const result = await updateVideoLink(videoId, athleteProfileId, updateData);
      
      if (!result.length) {
        return res.status(404).json(errorResponse(
          'Video not found',
          'No video exists with the provided ID for this athlete profile'
        ));
      }
      
      return res.status(200).json(successResponse(
        'Video updated successfully',
        result[0]
      ));
    } catch (error) {
      console.error('Error updating video:', error);
      return res.status(500).json(errorResponse(
        'Failed to update video',
        error
      ));
    }
  }
);

/**
 * @route DELETE /api/athlete/:athleteProfileId/videos/:videoId
 * @desc Delete a video link
 * @access Private - Self or Admin
 */
router.delete(
  '/:athleteProfileId/videos/:videoId',
  authenticateJWT,
  validateRequest({
    params: z.object({
      athleteProfileId: z.string().min(1, 'Athlete profile ID is required'),
      videoId: z.string().min(1, 'Video ID is required')
    })
  }),
  requireSelfOrAdmin,
  async (req: Request, res: Response) => {
    try {
      const athleteProfileId = parseInt(req.params.athleteProfileId, 10);
      const videoId = parseInt(req.params.videoId, 10);
      
      // Delete the video link
      const result = await deleteVideoLink(videoId, athleteProfileId);
      
      if (!result.length) {
        return res.status(404).json(errorResponse(
          'Video not found',
          'No video exists with the provided ID for this athlete profile'
        ));
      }
      
      return res.status(200).json(successResponse(
        'Video deleted successfully'
      ));
    } catch (error) {
      console.error('Error deleting video:', error);
      return res.status(500).json(errorResponse(
        'Failed to delete video',
        error
      ));
    }
  }
);

export default router; 