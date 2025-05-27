import { Router, Request, Response } from 'express';
import { validateRequest } from '../middleware/validationMiddleware';
import { successResponse, errorResponse } from '../utils/responses';
import { publicProfileParamsSchema, slugAvailabilitySchema } from '../validations/publicProfileSchemas';
import { getPublicProfileBySlug, isSlugAvailable } from '../services/publicProfileService';

const router = Router();

/**
 * @route GET /public/:slug
 * @desc Get a public profile by slug
 * @access Public
 */
router.get(
  '/:slug',
  validateRequest({
    params: publicProfileParamsSchema
  }),
  async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      
      // Get the public profile
      const profile = await getPublicProfileBySlug(slug);
      
      if (!profile) {
        return res.status(404).json(errorResponse(
          'Profile not found or not public'
        ));
      }
      
      return res.status(200).json(successResponse(
        'Profile fetched successfully',
        profile
      ));
    } catch (error) {
      console.error('Error fetching public profile:', error);
      return res.status(500).json(errorResponse(
        'Failed to fetch profile',
        error
      ));
    }
  }
);

/**
 * @route GET /public/slug/check
 * @desc Check if a slug is available
 * @access Public
 */
router.get(
  '/slug/check',
  validateRequest({
    query: slugAvailabilitySchema
  }),
  async (req: Request, res: Response) => {
    try {
      const { slug } = req.query as { slug: string };
      
      // Check if the slug is available
      const available = await isSlugAvailable(slug);
      
      return res.status(200).json(successResponse(
        'Slug availability checked',
        { available }
      ));
    } catch (error) {
      console.error('Error checking slug availability:', error);
      return res.status(500).json(errorResponse(
        'Failed to check slug availability',
        error
      ));
    }
  }
);

export default router; 