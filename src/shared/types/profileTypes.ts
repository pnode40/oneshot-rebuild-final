export interface HighlightVideo {
  title: string;
  url: string;
  visible: boolean;
}

export interface AthleteProfile {
  userId: string;
  fullName: string;
  phoneNumber: string;
  highSchool: string;
  gradYear: number;
  position: string;
  gpa: number;
  ncaaId: string;
  twitterHandle: string;
  coachName: string;
  coachPhone: string;
  coachEmail: string;
  highlightVideos: HighlightVideo[];
} 