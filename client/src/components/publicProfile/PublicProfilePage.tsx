import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { AthleteProfile } from '../../types/athleteProfile';
import PublicProfileHeader from './PublicProfileHeader';
import PublicProfileVideo from './PublicProfileVideo';
import PublicProfileMetrics from './PublicProfileMetrics';
import PublicProfileCoach from './PublicProfileCoach';
import { generateAthleteVCard, downloadVCard } from '../../utils/vCardGenerator';

const PublicProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if this is a QR scan (recruiter version)
  const isQRScan = searchParams.get('qr') === 'true';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/public/${slug}`);
        
        if (response.data.success) {
          setProfile(response.data.data);
        } else {
          setError(response.data.message || 'Failed to load profile');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Profile not found or not public');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProfile();
    }
  }, [slug]);

  // Meta tags for social sharing
  useEffect(() => {
    if (profile) {
      // Update page title
      document.title = `${profile.firstName} ${profile.lastName} | OneShot Athlete Profile`;
      
      // Update meta tags (would be better with a dedicated helmet component)
      const metaTags = {
        description: `${profile.firstName} ${profile.lastName} - ${profile.primaryPosition || ''} from ${profile.highSchoolName || ''} Class of ${profile.graduationYear || ''}`,
        image: profile.profileImageUrl || '',
      };
      
      // Update meta tags
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', metaTags.description);
      
      // Open Graph tags
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', document.title);
      
      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.setAttribute('content', metaTags.description);
      
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage && metaTags.image) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      if (ogImage && metaTags.image) {
        ogImage.setAttribute('content', metaTags.image);
      }
    }
  }, [profile]);
  
  // Handle vCard download
  const handleDownloadVCard = () => {
    if (!profile) return;
    
    const vCardString = generateAthleteVCard(profile, true);
    const filename = `${profile.firstName}_${profile.lastName}_OneShot.vcf`;
    downloadVCard(vCardString, filename);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This athlete profile does not exist or is not public.'}</p>
          <a href="/" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* vCard download button for QR scans */}
        {isQRScan && (
          <div className="mb-6">
            <button
              onClick={handleDownloadVCard}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              Save Contact Info
            </button>
          </div>
        )}
        
        {/* Header section */}
        <div className="mb-8">
          <PublicProfileHeader profile={profile} />
        </div>
        
        {/* Video section */}
        {profile.featuredVideoUrl && (
          <div className="mb-8">
            <PublicProfileVideo 
              videoUrl={profile.featuredVideoUrl} 
              videoType={profile.featuredVideoType || 'youtube'} 
              thumbnailUrl={profile.featuredVideoThumbnail} 
            />
          </div>
        )}
        
        {/* Metrics section - conditionally rendered based on visibility */}
        {profile.showPerformanceMetrics && (
          <div className="mb-8">
            <PublicProfileMetrics profile={profile} />
          </div>
        )}
        
        {/* Coach information - conditionally rendered based on visibility */}
        {profile.showCoachInfo && profile.coachFirstName && profile.coachLastName && (
          <div className="mb-8">
            <PublicProfileCoach profile={profile} />
          </div>
        )}
        
        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-12">
          <p>© {new Date().getFullYear()} OneShot • Athlete Recruiting Platform</p>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage; 