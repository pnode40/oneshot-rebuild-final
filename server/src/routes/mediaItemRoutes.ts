import express, { Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import * as mediaItemService from '../services/mediaItemService';
import {
  athleteProfileCreateMediaItemSchema, AthleteProfileCreateMediaItemInput,
  athleteProfileUpdateMediaItemSchema, AthleteProfileUpdateMediaItemInput
} from '../validations/mediaItemSchemas';
import { z } from 'zod';

interface AuthUser {
  userId: number; // This userId is the athleteProfileUserId for these operations
  email: string;
  role: string;
}

const router = express.Router();

const getAuthUser = (req: Request): AuthUser => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  return req.user as AuthUser;
};

// Params schema for routes needing a media item ID
const mediaItemIdParamSchema = z.object({ 
  mediaItemId: z.string().transform(val => parseInt(val, 10))
});
type MediaItemIdParams = z.infer<typeof mediaItemIdParamSchema>;

// GET /api/media (Get all media items for the authenticated user's athlete profile)
router.get('/', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = getAuthUser(req);
    // req.user.userId IS the athleteProfileUserId in this context
    const items = await mediaItemService.getMediaItemsForAthleteProfile(user.userId);
    res.json({
      success: true,
      data: items
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/media (Create a media item for the authenticated user's athlete profile)
router.post(
  '/',
  authenticateJWT,
  // The schema expects athleteProfileUserId, but we will supply it from req.user.userId
  // So, we can omit athleteProfileUserId from the body validation if it's always set by the route.
  // For now, let's assume the body schema is used as is, and service reconciles if needed.
  validateRequest({ body: athleteProfileCreateMediaItemSchema }), 
  async (req: Request<any, any, AthleteProfileCreateMediaItemInput>, res: Response, next: NextFunction) => {
    try {
      const user = getAuthUser(req);
      // req.user.userId IS the athleteProfileUserId
      // The service function createMediaItemForAthlete takes athleteProfileUserId as first param.
      // The Zod schema AthleteProfileCreateMediaItemInput also has athleteProfileUserId.
      // We ensure the one from the authenticated user (user.userId) is used.
      const inputData = req.body;
      if (inputData.athleteProfileUserId !== user.userId) {
        // Optionally, enforce that if athleteProfileUserId is in body, it must match user.userId
        // Or, simply ignore inputData.athleteProfileUserId and always use user.userId
        console.warn('athleteProfileUserId in request body mismatched authenticated user. Using authenticated user ID.');
      }

      const item = await mediaItemService.createMediaItemForAthlete(user.userId, {
        ...inputData,
        athleteProfileUserId: user.userId, // Explicitly set/override from auth context
      });
      res.status(201).json({ 
        success: true, 
        data: item 
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/media/:mediaItemId (Update a media item for the authenticated user's athlete profile)
router.put(
  '/:mediaItemId',
  authenticateJWT,
  validateRequest({
    params: mediaItemIdParamSchema,
    body: athleteProfileUpdateMediaItemSchema,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = getAuthUser(req);
      const params = req.params as unknown as MediaItemIdParams;
      const body = req.body as AthleteProfileUpdateMediaItemInput;
      const mediaItemId = params.mediaItemId;

      const item = await mediaItemService.updateMediaItemForAthlete(
        mediaItemId,
        user.userId, // This is athleteProfileUserId for ownership check
        body
      );
      if (!item) {
        return res.status(404).json({ success: false, message: 'Media item not found or access denied' });
      }
      res.json({ 
        success: true, 
        data: item 
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/media/:mediaItemId (Delete a media item for the authenticated user's athlete profile)
router.delete(
  '/:mediaItemId',
  authenticateJWT,
  validateRequest({ params: mediaItemIdParamSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = getAuthUser(req);
      const params = req.params as unknown as MediaItemIdParams;
      const mediaItemId = params.mediaItemId;

      const success = await mediaItemService.deleteMediaItemForAthlete(
        mediaItemId, 
        user.userId // This is athleteProfileUserId for ownership check
      );
      if (!success) {
        return res.status(404).json({ success: false, message: 'Media item not found or access denied' });
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router; 