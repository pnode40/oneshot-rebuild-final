export type AthleteRole = 'high_school' | 'transfer_portal';

export interface MediaItem {
  id: number;
  title?: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  documentUrl?: string;
  imageUrl?: string;
  mediaType: string;
  isFeatured: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AthleteProfile {
  // User and profile info
  userId: number;
  slug: string;
  athleteRole: AthleteRole;
  
  // Personal information
  firstName: string;
  lastName: string;
  jerseyNumber?: string | null;
  profileImageUrl?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  
  // School information
  highSchoolName?: string | null;
  graduationYear?: number | null;
  city?: string | null;
  state?: string | null;
  
  // Academic information
  gpa?: number | null;
  transcriptUrl?: string | null;
  
  // NCAA Information (Transfer Portal)
  ncaaId?: string | null;
  eligibilityStatus?: string | null;
  
  // Position information
  sport: string;
  positions?: string[] | null;
  primaryPosition?: string | null;
  secondaryPosition?: string | null;
  
  // Physical measurements
  heightInches?: number | null;
  weightLbs?: number | null;
  
  // Performance metrics
  fortyYardDash?: number | null;
  benchPressMax?: number | null;
  verticalLeap?: number | null;
  shuttleRun?: number | null;
  broadJump?: number | null;
  proAgility?: number | null;
  squat?: number | null;
  deadlift?: number | null;
  otherAthleticStats?: Record<string, any> | null;
  
  // Coach information
  coachFirstName?: string | null;
  coachLastName?: string | null;
  coachEmail?: string | null;
  coachPhone?: string | null;
  isCoachVerified?: boolean;
  
  // Featured video
  featuredVideoUrl?: string | null;
  featuredVideoType?: string | null;
  featuredVideoThumbnail?: string | null;
  
  // Visibility flags
  showHeight?: boolean;
  showWeight?: boolean;
  showGPA?: boolean;
  showTranscript?: boolean;
  showNcaaInfo?: boolean;
  showPerformanceMetrics?: boolean;
  showCoachInfo?: boolean;
  isPublic: boolean;
  
  // Related data
  photos?: MediaItem[];
}

export interface AthleteProfileFormData extends Omit<AthleteProfile, 'userId' | 'photos'> {
  // Add any form-specific fields here
} 