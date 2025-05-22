import React from 'react';
import { ProfileData } from '../types'; // Changed from ../App
import { FaCamera, FaImage } from 'react-icons/fa'; // Added FaCamera and FaImage

interface Props {
  profileData: ProfileData;
}

const ProfilePreview: React.FC<Props> = ({ profileData }) => {
  // Determine what to show for the photo:
  // 1. If profileImageUrl is a blob URL (starts with 'blob:'), use it - this is a user-selected photo in the current session
  // 2. If we have mockUploads.profilePhoto but no valid blob URL, show placeholder with mock info
  // 3. Otherwise fall back to the default placeholder or nothing
  
  const hasMockPhoto = !!profileData.mockUploads?.profilePhoto;
  const hasBlobUrl = profileData.profileImageUrl?.startsWith('blob:');
  
  // Only use profileImageUrl if it's a blob URL (from current session)
  const photoUrl = hasBlobUrl ? profileData.profileImageUrl : null;

  return (
    <div className="border border-gray-300 rounded-md p-4 shadow-sm">
      <h2 className="text-lg font-bold mb-4">Preview</h2>
      
      <div className="mb-4 flex flex-col items-center">
        {photoUrl ? (
          // Live preview of user-selected image (current session only)
          <img 
            src={photoUrl} 
            alt={`${profileData.fullName || 'Profile'} photo`} 
            className="w-32 h-32 rounded-full object-cover mb-2 bg-gray-200 border"
          />
        ) : hasMockPhoto ? (
          // Mock photo placeholder (after refresh)
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-2 border">
            <FaImage className="h-16 w-16 text-gray-400" />
          </div>
        ) : (
          // No photo selected yet
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-2 border">
            <FaCamera className="h-16 w-16 text-gray-400" />
          </div>
        )}
        
        {/* Show mock file info when applicable */}
        {hasMockPhoto && profileData.mockUploads?.profilePhoto && (
          <p className="text-xs text-gray-500">
            (Mock: {profileData.mockUploads.profilePhoto.name})
            {!hasBlobUrl && <span className="block mt-1 text-xs italic">*After refresh, only mock info is preserved</span>}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <p><span className="font-medium">Name:</span> {profileData.fullName || '-'}</p>
        <p><span className="font-medium">High School:</span> {profileData.highSchool || '-'}</p>
        <p><span className="font-medium">Position:</span> {profileData.position || '-'}</p>
        <p><span className="font-medium">Graduation Year:</span> {profileData.gradYear || '-'}</p>
        <p><span className="font-medium">City/State:</span> {profileData.cityState || '-'}</p>
        <p>
          <span className="font-medium">Height:</span>{' '}
          {profileData.heightFt && profileData.heightIn
            ? `${profileData.heightFt}' ${profileData.heightIn}"`
            : '-'}
        </p>
        <p><span className="font-medium">Weight:</span> {profileData.weight || '-'} lbs</p>
        <p><span className="font-medium">40-Yard Dash:</span> {profileData.fortyYardDash || '-'} s</p>
        <p><span className="font-medium">Bench Press:</span> {profileData.benchPress || '-'} lbs</p>
      </div>

      {/* Coach Information Section */}
      {(profileData.coachName || profileData.coachEmail || profileData.coachPhone || profileData.coachTitle) && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-md font-semibold mb-2 text-gray-700">Coach Information</h3>
          <div className="space-y-1">
            {profileData.coachName && <p><span className="font-medium">Name:</span> {profileData.coachName}</p>}
            {profileData.coachTitle && <p><span className="font-medium">Title:</span> {profileData.coachTitle}</p>}
            {profileData.coachEmail && <p><span className="font-medium">Email:</span> {profileData.coachEmail}</p>}
            {profileData.coachPhone && <p><span className="font-medium">Phone:</span> {profileData.coachPhone}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePreview; 