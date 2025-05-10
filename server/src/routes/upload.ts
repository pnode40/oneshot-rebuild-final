import { Router, Response } from 'express';
import path from 'path';
import { AuthRequest, authenticate } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/responses';
import { db } from '../db/client';
import { profiles } from '../db/schema';
import { eq } from 'drizzle-orm';
import fileUpload, { uploadProfilePhoto, uploadTranscript } from '../utils/fileUpload';

const router = Router();

/**
 * Upload a profile photo
 * POST /api/upload/profile-photo
 */
router.post('/profile-photo', authenticate, (req: AuthRequest, res: Response) => {
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
          'Please select a file to upload'
        ));
      }

      // Get URL for the uploaded file
      const fileUrl = fileUpload.getPublicFileUrl(req.file.path);

      // Update user profile with the new photo URL
      if (req.user?.userId) {
        await db.update(profiles)
          .set({ profilePhotoUrl: fileUrl })
          .where(eq(profiles.userId, req.user.userId));
      }

      // Return success response with file path
      return res.status(200).json(successResponse(
        'Profile photo uploaded successfully',
        {
          filename: req.file.filename,
          url: fileUrl
        }
      ));
    } catch (error) {
      console.error('Profile photo upload error:', error);
      return res.status(500).json(errorResponse(
        'Failed to process profile photo',
        error
      ));
    }
  });
});

/**
 * Upload a transcript
 * POST /api/upload/transcript
 */
router.post('/transcript', authenticate, (req: AuthRequest, res: Response) => {
  uploadTranscript(req, res, async (err) => {
    try {
      // Handle multer errors
      if (err) {
        return res.status(400).json(errorResponse(
          'Transcript upload failed', 
          err.message
        ));
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json(errorResponse(
          'No file uploaded', 
          'Please select a file to upload'
        ));
      }

      // Get URL for the uploaded file
      const fileUrl = fileUpload.getPublicFileUrl(req.file.path);

      // Update user profile with the new transcript URL
      if (req.user?.userId) {
        await db.update(profiles)
          .set({ transcriptPdfUrl: fileUrl })
          .where(eq(profiles.userId, req.user.userId));
      }

      // Return success response with file path
      return res.status(200).json(successResponse(
        'Transcript uploaded successfully',
        {
          filename: req.file.filename,
          url: fileUrl
        }
      ));
    } catch (error) {
      console.error('Transcript upload error:', error);
      return res.status(500).json(errorResponse(
        'Failed to process transcript',
        error
      ));
    }
  });
});

/**
 * Combined upload of profile media (photo and transcript)
 * POST /api/upload/profile-media
 */
router.post('/profile-media', authenticate, (req: AuthRequest, res: Response) => {
  fileUpload.uploadProfileMedia(req, res, async (err) => {
    try {
      // Handle multer errors
      if (err) {
        return res.status(400).json(errorResponse(
          'File upload failed', 
          err.message
        ));
      }

      const files = req.files as { 
        [fieldname: string]: Express.Multer.File[] 
      } | undefined;
      
      if (!files || (
        !files['profilePhoto']?.length && 
        !files['transcript']?.length
      )) {
        return res.status(400).json(errorResponse(
          'No files uploaded', 
          'Please select at least one file to upload'
        ));
      }

      // Process uploaded files
      const profilePhoto = files['profilePhoto']?.[0];
      const transcript = files['transcript']?.[0];

      // Generate URLs for the uploaded files
      const profilePhotoUrl = profilePhoto 
        ? fileUpload.getPublicFileUrl(profilePhoto.path) 
        : undefined;
      
      const transcriptUrl = transcript 
        ? fileUpload.getPublicFileUrl(transcript.path) 
        : undefined;

      // Update user profile with the new file URLs
      if (req.user?.userId && (profilePhotoUrl || transcriptUrl)) {
        const updateData: any = {};
        
        if (profilePhotoUrl) {
          updateData.profilePhotoUrl = profilePhotoUrl;
        }
        
        if (transcriptUrl) {
          updateData.transcriptPdfUrl = transcriptUrl;
        }
        
        await db.update(profiles)
          .set(updateData)
          .where(eq(profiles.userId, req.user.userId));
      }

      // Return success response with file paths
      return res.status(200).json(successResponse(
        'Files uploaded successfully',
        {
          profilePhoto: profilePhoto ? {
            filename: profilePhoto.filename,
            url: profilePhotoUrl
          } : undefined,
          transcript: transcript ? {
            filename: transcript.filename,
            url: transcriptUrl
          } : undefined
        }
      ));
    } catch (error) {
      console.error('File upload error:', error);
      return res.status(500).json(errorResponse(
        'Failed to process uploaded files',
        error
      ));
    }
  });
});

/**
 * Delete a profile photo
 * DELETE /api/upload/profile-photo
 */
router.delete('/profile-photo', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Get user profile
    const userProfile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, req.user?.userId || 0)
    });

    if (!userProfile || !userProfile.profilePhotoUrl) {
      return res.status(404).json(errorResponse(
        'No profile photo found',
        'There is no profile photo to delete'
      ));
    }

    // Get file path from URL
    const relativePath = userProfile.profilePhotoUrl.replace('/uploads/', '');
    const filePath = path.join(process.cwd(), 'uploads', relativePath);

    // Delete file
    await fileUpload.deleteUploadedFile(filePath);

    // Update profile
    await db.update(profiles)
      .set({ profilePhotoUrl: null })
      .where(eq(profiles.userId, req.user?.userId || 0));

    return res.status(200).json(successResponse(
      'Profile photo deleted successfully'
    ));
  } catch (error) {
    console.error('Delete profile photo error:', error);
    return res.status(500).json(errorResponse(
      'Failed to delete profile photo',
      error
    ));
  }
});

/**
 * Delete a transcript
 * DELETE /api/upload/transcript
 */
router.delete('/transcript', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Get user profile
    const userProfile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, req.user?.userId || 0)
    });

    if (!userProfile || !userProfile.transcriptPdfUrl) {
      return res.status(404).json(errorResponse(
        'No transcript found',
        'There is no transcript to delete'
      ));
    }

    // Get file path from URL
    const relativePath = userProfile.transcriptPdfUrl.replace('/uploads/', '');
    const filePath = path.join(process.cwd(), 'uploads', relativePath);

    // Delete file
    await fileUpload.deleteUploadedFile(filePath);

    // Update profile
    await db.update(profiles)
      .set({ transcriptPdfUrl: null })
      .where(eq(profiles.userId, req.user?.userId || 0));

    return res.status(200).json(successResponse(
      'Transcript deleted successfully'
    ));
  } catch (error) {
    console.error('Delete transcript error:', error);
    return res.status(500).json(errorResponse(
      'Failed to delete transcript',
      error
    ));
  }
});

export default router; 