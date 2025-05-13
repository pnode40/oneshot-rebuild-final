import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

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
}

const fetchProfile = async (slug: string): Promise<PublicProfile> => {
  const { data } = await axios.get(`/api/v1/profiles/public/${slug}`);
  return data.data;
};

const PublicProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
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
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0a1128] text-[#f9f9f9]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00c2ff]"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center bg-[#0a1128] text-[#f9f9f9]">
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
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center bg-[#0a1128] text-[#f9f9f9]">
        <h2 className="text-xl font-bold text-[#ff6b35] mb-4">Profile not found</h2>
        <p className="text-[#e0e0e0]">
          The profile you're looking for doesn't exist or was removed.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1128] py-8 px-4">
      {/* Profile Card - Main Layout */}
      <div className="bg-white shadow-md rounded-2xl p-4 max-w-md mx-auto space-y-4">
        {/* Profile Photo */}
        {profile.profilePhotoUrl ? (
          <img 
            src={profile.profilePhotoUrl} 
            alt={`${profile.firstName || ''} ${profile.lastName || profile.schoolName || ''}`} 
            className="w-24 h-24 object-cover rounded-full mx-auto mb-4"
          />
        ) : (
          <div className="w-24 h-24 bg-[#e0e0e0] rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl font-bold text-[#0a1128]">
              {(profile.firstName?.[0] || profile.schoolName?.[0] || '?')}
            </span>
          </div>
        )}
        
        {/* Name and Basic Info */}
        <div className="text-center">
          <h1 className="text-xl font-bold">
            {profile.firstName && profile.lastName 
              ? `${profile.firstName} ${profile.lastName}`
              : profile.schoolName || 'Athlete Profile'}
          </h1>
          <p className="text-sm text-gray-600">
            {profile.position} • {profile.sport || 'Football'} • Class of {profile.graduationYear || 'N/A'}
          </p>
        </div>
        
        {/* Bio Section */}
        {profile.bio && (
          <div className="mt-4">
            <p className="text-center text-gray-700">{profile.bio}</p>
          </div>
        )}
        
        {/* Stats Section */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Position</p>
              <p className="font-semibold">{profile.position || 'N/A'}</p>
            </div>
            {profile.heightFormatted && (
              <div className="text-center">
                <p className="text-xs text-gray-500">Height</p>
                <p className="font-semibold">{profile.heightFormatted}</p>
              </div>
            )}
            {profile.weight && (
              <div className="text-center">
                <p className="text-xs text-gray-500">Weight</p>
                <p className="font-semibold">{profile.weight} lbs</p>
              </div>
            )}
            {profile.gpa && (
              <div className="text-center">
                <p className="text-xs text-gray-500">GPA</p>
                <p className="font-semibold">{profile.gpa}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* School Info */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500">School</p>
            <p className="font-semibold">{profile.schoolName || 'N/A'}</p>
          </div>
        </div>
        
        {/* Highlight Video */}
        {profile.highlightVideoUrl && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-center mb-3">Highlight Video</h2>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={profile.highlightVideoUrl}
                title="Highlight Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full rounded-lg"
              ></iframe>
            </div>
          </div>
        )}
        
        {/* Footer/Branding */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            OneShot • Built for athletes
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage; 