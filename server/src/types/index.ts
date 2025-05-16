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