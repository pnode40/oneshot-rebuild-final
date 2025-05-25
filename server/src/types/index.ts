// Common type definitions for the application

/**
 * User role enum type matching the database enum
 */
export enum UserRole {
  ATHLETE = 'athlete',
  RECRUITER = 'recruiter',
  ADMIN = 'admin',
  PARENT = 'parent'
}

/**
 * Authenticated user object structure attached to Express requests
 */
export interface AuthenticatedUser {
  userId: number;
  email: string;
  role: 'athlete' | 'recruiter' | 'admin' | 'parent';
}

/** * Express Request interface augmentation to include authenticated user * Extending the existing User interface to avoid conflicts */declare global {  namespace Express {    interface User extends AuthenticatedUser {}  }}

/**
 * Type alias for Express requests with guaranteed authenticated user
 */
export interface AuthRequest extends Express.Request {
  user: AuthenticatedUser;
}

/**
 * Athlete role enum type matching the database enum
 */
export enum AthleteRole {
  HIGH_SCHOOL = 'high_school',
  TRANSFER_PORTAL = 'transfer_portal'
}

/**
 * Upload file type for type checking
 */
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

/**
 * Profile image file metadata
 */
export interface ProfileMedia {
  profilePhoto?: UploadedFile;
  transcript?: UploadedFile;
} 