import { GeneralMetrics, PositionMetrics } from './metricsTypes.js';

export type PublicProfile = {
  fullName: string;
  graduationYear?: number;
  position?: string;
  profilePictures?: Array<{
    url: string;
    uploadedAt: string;
    active: boolean;
  }>;
  contactEmail?: string;
  contactPhone?: string;
  twitterHandle?: string;
  coachName?: string;
  coachEmail?: string;
  coachPhone?: string;
  highlightVideos?: Array<{
    title: string;
    url: string;
    visible: boolean;
  }>;
  awards?: string[];
  extracurriculars?: string[];
};

export type PublicMetrics = GeneralMetrics & PositionMetrics; 