export interface ProfileData {
  fullName: string;
  email: string;
  highSchool: string;
  position: string;
  gradYear?: string;
  cityState?: string;
  heightFt?: string;
  heightIn?: string;
  weight?: string;
  fortyYardDash?: string;
  benchPress?: string;
  bio?: string;
  socialMediaLinks?: {
    twitter?: string;
    instagram?: string;
    hudl?: string;
  };
  profileImageUrl?: string;
  bannerImageUrl?: string;
  mockUploads?: { 
    [key: string]: { 
      name: string; 
      type: string; 
      url?: string; 
      previewUrl?: string;
    } 
  };
  // Coach Information
  coachName?: string;
  coachEmail?: string;
  coachPhone?: string;
  coachTitle?: string;
} 