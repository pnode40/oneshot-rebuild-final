import { Router, Response, Request } from 'express';
import { authenticateJWT } from '../../middleware/authMiddleware';
import { requireSelfOrAdmin } from '../../middleware/rbacMiddleware';
import { validateRequest } from '../../middleware/validationMiddleware';
import { successResponse, errorResponse } from '../../utils/responses';
import { uploadProfilePhoto, getPublicFileUrl, deleteUploadedFile } from '../../utils/fileUpload';
import {
  profilePhotoUploadSchema,
  profilePhotoUpdateSchema,
  userIdParamSchema,
  profilePhotoIdParamSchema,
  profilePhotoFileRules
} from '../../validations/profilePhotoSchemas';
import {
  addProfilePhoto,
  getProfilePhotos,
  getProfilePhotoByIdForAuth,
  updateProfilePhoto,
  deleteProfilePhoto,
  countProfilePhotos
} from '../../services/profilePhotoService';
import path from 'path';

const router = Router();

/**
 * @route POST /api/profile-photos/:userId
 * @desc Upload a profile photo
 * @access Private - Self or Admin
 */
router.post(
  '/:userId',
  authenticateJWT,
  validateRequest({
    params: userIdParamSchema,
  }),
  (req: Request, res: Response) => {
    const userId = req.params.userId;
    
    // Apply authorization middleware
    requireSelfOrAdmin(req, res, async () => {
      // Check photo limit before upload
      try {
        const photoCount = await countProfilePhotos(Number(userId));
        if (photoCount >= 5) {
          return res.status(400).json(errorResponse(
            'Photo limit exceeded',
            'Maximum 5 profile photos allowed per user'
          ));
        }

        // Handle file upload with multer
        uploadProfilePhoto(req, res, async (err) => {
          try {
            // Handle multer errors
            if (err) {
              return res.status(400).json(errorResponse(
                'Profile photo upload failed',
                err.message
              ));
            }

            // Check if file was uploaded
            if (!req.file) {
              return res.status(400).json(errorResponse(
                'No file uploaded',
                'Please select an image file to upload'
              ));
            }

            // Validate and parse body data
            const bodyValidation = profilePhotoUploadSchema.safeParse(req.body);
            if (!bodyValidation.success) {
              return res.status(400).json(errorResponse(
                'Validation failed',
                bodyValidation.error.errors
              ));
            }

            // Get URL for the uploaded file
            const imageUrl = getPublicFileUrl(req.file.path);

            // Save photo metadata to database
            const result = await addProfilePhoto(
              Number(userId),
              bodyValidation.data,
              imageUrl
            );

            return res.status(201).json(successResponse(
              'Profile photo uploaded successfully',
              {
                ...result[0],
                filename: req.file.filename,
                originalName: req.file.originalname
              }
            ));
          } catch (error) {
            console.error('Error saving profile photo:', error);
            return res.status(500).json(errorResponse(
              'Failed to save profile photo',
              error
            ));
          }
        });
      } catch (error) {
        console.error('Error checking photo count:', error);
        return res.status(500).json(errorResponse(
          'Failed to check photo limits',
          error
        ));
      }
    });
  }
);

/**
 * @route GET /api/profile-photos/:userId
 * @desc Get all profile photos for a user
 * @access Private - Self or Admin
 */
router.get(
  '/:userId',
  authenticateJWT,
  validateRequest({
    params: userIdParamSchema,
  }),
  (req: Request, res: Response) => {
    const userId = req.params.userId;
    
    requireSelfOrAdmin(req, res, async () => {
      try {
        const photos = await getProfilePhotos(Number(userId));
        
        return res.status(200).json(successResponse(
          'Profile photos retrieved successfully',
          photos
        ));
      } catch (error) {
        console.error('Error retrieving profile photos:', error);
        return res.status(500).json(errorResponse(
          'Failed to retrieve profile photos',
          error
        ));
      }
    });
  }
);

/**
 * @route PATCH /api/profile-photos/item/:mediaItemId
 * @desc Update a profile photo's metadata
 * @access Private - Self or Admin
 */
router.patch(
  '/item/:mediaItemId',
  authenticateJWT,
  validateRequest({
    params: profilePhotoIdParamSchema,
    body: profilePhotoUpdateSchema,
  }),
  async (req: Request, res: Response) => {
    try {
      const mediaItemId = req.params.mediaItemId;
      const updateData = req.body;
      
      // Check if at least one field is provided for update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json(errorResponse(
          'Validation failed',
          'At least one field must be provided for update'
        ));
      }
      
      // Get photo for authorization check
      const photoResult = await getProfilePhotoByIdForAuth(Number(mediaItemId));
      if (!photoResult.length) {
        return res.status(404).json(errorResponse(
          'Profile photo not found',
          `No profile photo found with ID ${mediaItemId}`
        ));
      }
      
      const photo = photoResult[0];
      
      // Set userId for authorization middleware
      req.params.userId = photo.athleteProfileUserId.toString();
      
      requireSelfOrAdmin(req, res, async () => {
        try {
          // Update photo metadata
          const result = await updateProfilePhoto(
            Number(mediaItemId),
            photo.athleteProfileUserId,
            updateData
          );
          
          if (!result.length) {
            return res.status(400).json(errorResponse(
              'No updates applied',
              'No valid fields to update'
            ));
          }
          
          return res.status(200).json(successResponse(
            'Profile photo updated successfully',
            result[0]
          ));
        } catch (error) {
          console.error('Error updating profile photo:', error);
          return res.status(500).json(errorResponse(
            'Failed to update profile photo',
            error
          ));
        }
      });
    } catch (error) {
      console.error('Error in profile photo update:', error);
      return res.status(500).json(errorResponse(
        'Failed to process update request',
        error
      ));
    }
  }
);

/**
 * @route DELETE /api/profile-photos/item/:mediaItemId
 * @desc Delete a profile photo
 * @access Private - Self or Admin
 */
router.delete(
  '/item/:mediaItemId',
  authenticateJWT,
  validateRequest({
    params: profilePhotoIdParamSchema,
  }),
  async (req: Request, res: Response) => {
    try {
      const mediaItemId = req.params.mediaItemId;
      
      // Get photo for authorization check and file deletion
      const photoResult = await getProfilePhotoByIdForAuth(Number(mediaItemId));
      if (!photoResult.length) {
        return res.status(404).json(errorResponse(
          'Profile photo not found',
          `No profile photo found with ID ${mediaItemId}`
        ));
      }
      
      const photo = photoResult[0];
      
      // Set userId for authorization middleware
      req.params.userId = photo.athleteProfileUserId.toString();
      
      requireSelfOrAdmin(req, res, async () => {
        try {
          // Delete from database first
          const result = await deleteProfilePhoto(
            Number(mediaItemId),
            photo.athleteProfileUserId
          );
          
          if (!result.length) {
            return res.status(404).json(errorResponse(
              'Profile photo not found',
              'Photo may have already been deleted'
            ));
          }
          
          // Try to delete physical file
          let fileDeleted = false;
          if (photo.imageUrl) {
            try {
              const relativePath = photo.imageUrl.replace('/uploads/', '');
              const filePath = path.join(process.cwd(), 'uploads', relativePath);
              await deleteUploadedFile(filePath);
              fileDeleted = true;
            } catch (fileError) {
              console.warn('Failed to delete physical file:', fileError);
            }
          }
          
          // Return success even if file deletion failed
          if (!fileDeleted && photo.imageUrl) {
            return res.status(207).json({
              success: true,
              message: 'Profile photo record deleted, but file deletion failed',
              data: result[0],
              warnings: ['Physical file could not be deleted']
            });
          }
          
          return res.status(200).json(successResponse(
            'Profile photo deleted successfully',
            result[0]
          ));
        } catch (error) {
          console.error('Error deleting profile photo:', error);
          return res.status(500).json(errorResponse(
            'Failed to delete profile photo',
            error
          ));
        }
      });
    } catch (error) {
      console.error('Error in profile photo deletion:', error);
      return res.status(500).json(errorResponse(
        'Failed to process delete request',
        error
      ));
    }
  }
);

export default router; 