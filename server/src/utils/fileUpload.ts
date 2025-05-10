import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { AuthRequest } from '../middleware/auth';

// Define upload directories
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const PROFILE_PHOTOS_DIR = path.join(UPLOAD_DIR, 'profiles', 'photos');
const PROFILE_TRANSCRIPTS_DIR = path.join(UPLOAD_DIR, 'profiles', 'transcripts');

// Ensure upload directories exist
[PROFILE_PHOTOS_DIR, PROFILE_TRANSCRIPTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage for different file types
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Determine destination based on fieldname
    if (file.fieldname === 'profilePhoto') {
      cb(null, PROFILE_PHOTOS_DIR);
    } else if (file.fieldname === 'transcript') {
      cb(null, PROFILE_TRANSCRIPTS_DIR);
    } else {
      cb(new Error('Invalid file field'), '');
    }
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename with timestamp and user ID
    const authReq = req as unknown as AuthRequest;
    const userId = authReq.user?.userId || 'unknown';
    const timestamp = Date.now();
    const fileExtension = path.extname(file.originalname);
    const sanitizedFilename = `${userId}_${timestamp}${fileExtension}`;
    cb(null, sanitizedFilename);
  }
});

// File type validation
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === 'profilePhoto') {
    // Allow only images for profile photos
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Profile photo must be an image file'));
    }
    
    // Ensure allowed image types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG and WebP images are allowed for profile photos'));
    }
  } else if (file.fieldname === 'transcript') {
    // Allow only PDFs for transcripts
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Transcript must be a PDF file'));
    }
  }
  
  cb(null, true);
};

// Configure multer upload settings
const uploadConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  }
};

// Create multer instance with configuration
const upload = multer(uploadConfig);

// Export configured uploader with specific field handling
export const uploadProfilePhoto = upload.single('profilePhoto');
export const uploadTranscript = upload.single('transcript');
export const uploadProfileMedia = upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'transcript', maxCount: 1 }
]);

/**
 * Generate a public URL for an uploaded file
 * @param filePath The path to the uploaded file
 * @returns A URL that can be used to access the file
 */
export const getPublicFileUrl = (filePath: string): string => {
  // If we're using local storage, generate a relative URL
  // This would change if using a cloud storage provider like S3
  if (!filePath) return '';
  const relativePath = path.relative(UPLOAD_DIR, filePath);
  return `/uploads/${relativePath.replace(/\\/g, '/')}`;
};

/**
 * Delete a file from the upload directory
 * @param filePath The path to the file to delete
 */
export const deleteUploadedFile = async (filePath: string): Promise<void> => {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

export default {
  uploadProfilePhoto,
  uploadTranscript,
  uploadProfileMedia,
  getPublicFileUrl,
  deleteUploadedFile,
  PROFILE_PHOTOS_DIR,
  PROFILE_TRANSCRIPTS_DIR
}; 