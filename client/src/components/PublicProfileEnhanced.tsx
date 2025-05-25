import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { 
  ShareIcon, 
  EyeIcon, 
  HeartIcon, 
  DocumentTextIcon,
  PlayIcon,
  MapPinIcon,
  AcademicCapIcon,
  TrophyIcon,
  CalendarIcon,
  UserIcon,
  LinkIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface PublicProfile {
  id: number;
  slug: string;
  customUrlSlug: string;
  firstName?: string;
  lastName?: string;
  schoolName: string;
  graduationYear: number | null;
  position: string;
  jerseyNumber: number | null;
  athleteRole: string;
  profilePhotoUrl: string | null;
  highlightVideoUrl: string | null;
  height: number | null;
  weight: number | null;
  gpa: number | null;
  heightFormatted: string | null;
  bio?: string;
  sport?: string;
  cityState?: string;
  socialMediaLinks?: {
    twitter?: string;
    instagram?: string;
    hudl?: string;
    youtube?: string;
  };
  stats?: {
    views: number;
    favorites: number;
    shares: number;
  };
}

interface ProfileAnalytics {
  totalViews: number;
  uniqueViews: number;
  favorites: number;
  shares: number;
  viewsThisWeek: number;
  topReferrers: Array<{ source: string; count: number }>;
}

const fetchProfile = async (slug: string): Promise<PublicProfile> => {
  const { data } = await axios.get(`/api/v1/profiles/public/${slug}`);
  return data.data;
};

const trackProfileView = async (slug: string, referrer?: string) => {
  try {
    await axios.post(`/api/v1/analytics/profile-view`, {
      slug,
      referrer: referrer || document.referrer || 'direct',
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.log('Analytics tracking failed:', error);
  }
};

const PublicProfileEnhanced: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  
  const { 
    data: profile, 
    isLoading, 
    isError, 
    error
  } = useQuery({
    queryKey: ['profile', slug],
    queryFn: () => fetchProfile(slug as string),
    enabled: !!slug,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Track profile view on mount
  useEffect(() => {
    if (slug && profile) {
      const referrer = new URLSearchParams(location.search).get('ref') || document.referrer;
      trackProfileView(slug, referrer);
    }
  }, [slug, profile, location.search]);

  // Generate structured data for SEO
  const generateStructuredData = (profile: PublicProfile) => {
    const baseUrl = window.location.origin;
    const profileUrl = `${baseUrl}/profile/${profile.slug}`;
    
    return {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": profile.firstName && profile.lastName 
        ? `${profile.firstName} ${profile.lastName}` 
        : profile.schoolName,
      "url": profileUrl,
      "image": profile.profilePhotoUrl,
      "description": profile.bio || `${profile.position} from ${profile.schoolName}`,
      "alumniOf": {
        "@type": "EducationalOrganization",
        "name": profile.schoolName
      },
      "sport": profile.sport || "Football",
      "athlete": {
        "@type": "Person",
        "name": profile.firstName && profile.lastName 
          ? `${profile.firstName} ${profile.lastName}` 
          : profile.schoolName,
        "position": profile.position,
        "jerseyNumber": profile.jerseyNumber,
        "height": profile.heightFormatted,
        "weight": profile.weight ? `${profile.weight} lbs` : undefined
      }
    };
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = profile?.firstName && profile?.lastName 
      ? `${profile.firstName} ${profile.lastName} - ${profile.position}` 
      : `${profile?.schoolName} - ${profile?.position}`;
    const text = `Check out ${title} on OneShot!`;

    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        return;
      case 'qr':
        // Generate QR code (would need QR code library)
        alert('QR Code feature coming soon!');
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShareCount(prev => prev + 1);
    }
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // In real implementation, would call API to save favorite
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0a1128] via-[#1a2332] to-[#0a1128]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00c2ff]"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center bg-gradient-to-br from-[#0a1128] via-[#1a2332] to-[#0a1128] text-[#f9f9f9]">
        <h2 className="text-xl font-bold text-[#ff6b35] mb-4">
          {axios.isAxiosError(error) && error.response?.status === 404 
            ? 'Profile not found' 
            : 'Could not load profile. Try again later.'}
        </h2>
        <p className="text-[#e0e0e0]">
          {axios.isAxiosError(error) && error.response?.status === 404
            ? 'The profile you\'re looking for doesn\'t exist or was removed.'
            : 'There was a problem connecting to the server. Please try again.'}
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center bg-gradient-to-br from-[#0a1128] via-[#1a2332] to-[#0a1128] text-[#f9f9f9]">
        <h2 className="text-xl font-bold text-[#ff6b35] mb-4">Profile not found</h2>
        <p className="text-[#e0e0e0]">
          The profile you're looking for doesn't exist or was removed.
        </p>
      </div>
    );
  }

  const profileTitle = profile.firstName && profile.lastName 
    ? `${profile.firstName} ${profile.lastName}` 
    : profile.schoolName;
  const profileDescription = profile.bio || `${profile.position} from ${profile.schoolName} - Class of ${profile.graduationYear}`;

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{profileTitle} - {profile.position} | OneShot</title>
        <meta name="description" content={profileDescription} />
        <meta name="keywords" content={`${profile.sport || 'football'}, ${profile.position}, ${profile.schoolName}, recruiting, athlete, ${profile.graduationYear}`} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={`${profileTitle} - ${profile.position}`} />
        <meta property="og:description" content={profileDescription} />
        <meta property="og:image" content={profile.profilePhotoUrl || '/default-athlete.jpg'} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="profile" />
        <meta property="og:site_name" content="OneShot" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${profileTitle} - ${profile.position}`} />
        <meta name="twitter:description" content={profileDescription} />
        <meta name="twitter:image" content={profile.profilePhotoUrl || '/default-athlete.jpg'} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(generateStructuredData(profile))}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-[#0a1128] via-[#1a2332] to-[#0a1128] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Profile Photo */}
              <div className="relative">
                {profile.profilePhotoUrl ? (
                  <img 
                    src={profile.profilePhotoUrl} 
                    alt={profileTitle} 
                    className="w-32 h-32 lg:w-40 lg:h-40 object-cover rounded-full border-4 border-[#00c2ff]/50 shadow-2xl"
                  />
                ) : (
                  <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-[#00c2ff] to-[#ff6b35] rounded-full flex items-center justify-center border-4 border-white/20 shadow-2xl">
                    <span className="text-4xl lg:text-5xl font-bold text-white">
                      {(profile.firstName?.[0] || profile.schoolName?.[0] || '?')}
                    </span>
                  </div>
                )}
                
                {/* Jersey Number Badge */}
                {profile.jerseyNumber && (
                  <div className="absolute -bottom-2 -right-2 bg-[#ff6b35] text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg border-4 border-white">
                    #{profile.jerseyNumber}
                  </div>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  {profileTitle}
                </h1>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-4">
                  <span className="bg-[#00c2ff]/20 text-[#00c2ff] px-4 py-2 rounded-full font-semibold">
                    {profile.position}
                  </span>
                  <span className="bg-[#ff6b35]/20 text-[#ff6b35] px-4 py-2 rounded-full font-semibold">
                    {profile.sport || 'Football'}
                  </span>
                  <span className="bg-white/20 text-white px-4 py-2 rounded-full font-semibold">
                    Class of {profile.graduationYear || 'N/A'}
                  </span>
                </div>
                
                {/* School Info */}
                <div className="flex items-center justify-center lg:justify-start gap-2 text-[#e0e0e0] mb-4">
                  <AcademicCapIcon className="w-5 h-5" />
                  <span className="text-lg">{profile.schoolName}</span>
                  {profile.cityState && (
                    <>
                      <MapPinIcon className="w-4 h-4 ml-2" />
                      <span>{profile.cityState}</span>
                    </>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  <button
                    onClick={toggleFavorite}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      isFavorited 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {isFavorited ? (
                      <HeartSolidIcon className="w-5 h-5" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                    Favorite
                  </button>
                  
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#00c2ff] text-white rounded-full hover:bg-[#00a8d6] transition-all"
                  >
                    <ShareIcon className="w-5 h-5" />
                    Share
                  </button>
                  
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-full">
                    <EyeIcon className="w-5 h-5" />
                    <span>{profile.stats?.views || 0} views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {profile.bio && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-8 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <UserIcon className="w-6 h-6" />
                About
              </h2>
              <p className="text-[#e0e0e0] leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {profile.heightFormatted && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
                <div className="text-2xl font-bold text-[#00c2ff] mb-2">{profile.heightFormatted}</div>
                <div className="text-[#e0e0e0]">Height</div>
              </div>
            )}
            
            {profile.weight && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
                <div className="text-2xl font-bold text-[#ff6b35] mb-2">{profile.weight} lbs</div>
                <div className="text-[#e0e0e0]">Weight</div>
              </div>
            )}
            
            {profile.gpa && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
                <div className="text-2xl font-bold text-[#00ff88] mb-2">{profile.gpa}</div>
                <div className="text-[#e0e0e0]">GPA</div>
              </div>
            )}
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-2xl font-bold text-white mb-2">{profile.graduationYear || 'N/A'}</div>
              <div className="text-[#e0e0e0]">Graduation</div>
            </div>
          </div>

          {/* Highlight Video */}
          {profile.highlightVideoUrl && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-8 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <PlayIcon className="w-6 h-6" />
                Highlight Video
              </h2>
              <div className="aspect-video rounded-2xl overflow-hidden">
                <iframe
                  src={profile.highlightVideoUrl}
                  title="Highlight Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          )}

          {/* Social Media Links */}
          {profile.socialMediaLinks && Object.keys(profile.socialMediaLinks).length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-8 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <LinkIcon className="w-6 h-6" />
                Connect
              </h2>
              <div className="flex flex-wrap gap-4">
                {profile.socialMediaLinks.twitter && (
                  <a
                    href={`https://twitter.com/${profile.socialMediaLinks.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all"
                  >
                    Twitter
                  </a>
                )}
                {profile.socialMediaLinks.instagram && (
                  <a
                    href={`https://instagram.com/${profile.socialMediaLinks.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-all"
                  >
                    Instagram
                  </a>
                )}
                {profile.socialMediaLinks.hudl && (
                  <a
                    href={profile.socialMediaLinks.hudl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-all"
                  >
                    Hudl
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center py-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 inline-block">
              <p className="text-[#e0e0e0] mb-2">
                Powered by <span className="text-[#00c2ff] font-bold">OneShot</span>
              </p>
              <p className="text-sm text-[#a0a0a0]">
                Building the future of athletic recruiting
              </p>
            </div>
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Share Profile</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center justify-center gap-2 p-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all"
                >
                  Twitter
                </button>
                
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all"
                >
                  Facebook
                </button>
                
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex items-center justify-center gap-2 p-4 bg-blue-700 text-white rounded-2xl hover:bg-blue-800 transition-all"
                >
                  LinkedIn
                </button>
                
                <button
                  onClick={() => handleShare('copy')}
                  className="flex items-center justify-center gap-2 p-4 bg-gray-600 text-white rounded-2xl hover:bg-gray-700 transition-all"
                >
                  <LinkIcon className="w-5 h-5" />
                  Copy Link
                </button>
              </div>
              
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full p-3 bg-gray-200 text-gray-800 rounded-2xl hover:bg-gray-300 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PublicProfileEnhanced; 