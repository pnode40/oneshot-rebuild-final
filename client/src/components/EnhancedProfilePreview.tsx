import React from 'react';
import { 
  FaCamera, 
  FaImage, 
  FaGraduationCap, 
  FaRuler, 
  FaWeight, 
  FaClock, 
  FaDumbbell,
  FaEye,
  FaEyeSlash,
  FaShare,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa';

// Enhanced profile interface matching the editor
interface EnhancedProfileData {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  city?: string;
  state?: string;
  customUrlSlug?: string;
  
  // Athletic info
  highSchool?: string;
  position?: string;
  gradYear?: string;
  gpa?: string;
  
  // Physical stats
  heightFt?: string;
  heightIn?: string;
  weight?: string;
  
  // Performance
  fortyYardDash?: string;
  benchPressMax?: string;
  verticalLeap?: string;
  shuttleRun?: string;
  
  // Content
  bio?: string;
  profileImageUrl?: string;
  
  // Visibility controls
  isHeightVisible?: boolean;
  isWeightVisible?: boolean;
  isGpaVisible?: boolean;
  isTranscriptVisible?: boolean;
  
  // Media uploads
  mockUploads?: { 
    [key: string]: { 
      name: string; 
      type: string; 
      url?: string; 
      previewUrl?: string;
    } 
  };
}

interface Props {
  profileData: EnhancedProfileData;
  isPublicView?: boolean;
}

const EnhancedProfilePreview: React.FC<Props> = ({ profileData, isPublicView = false }) => {
  // Determine photo display
  const hasMockPhoto = !!profileData.mockUploads?.profilePhoto;
  const hasBlobUrl = profileData.profileImageUrl?.startsWith('blob:');
  const photoUrl = hasBlobUrl ? profileData.profileImageUrl : null;

  // Helper functions
  const formatHeight = () => {
    if (profileData.heightFt && profileData.heightIn) {
      return `${profileData.heightFt}'${profileData.heightIn}"`;
    }
    return null;
  };

  const formatLocation = () => {
    const parts = [profileData.city, profileData.state].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  const calculateAge = () => {
    if (!profileData.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(profileData.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Visibility helper
  const isVisible = (field: keyof EnhancedProfileData) => {
    return profileData[field] !== false;
  };

  // Profile URL
  const profileUrl = profileData.customUrlSlug 
    ? `oneshot.dev/profile/${profileData.customUrlSlug}`
    : null;

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-md mx-auto">
      {/* Header with photo and basic info */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white text-center relative">
        {/* Profile Photo */}
        <div className="mb-4">
          {photoUrl ? (
            <img 
              src={photoUrl} 
              alt={`${profileData.fullName || 'Profile'} photo`} 
              className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
            />
          ) : hasMockPhoto ? (
            <div className="w-24 h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center mx-auto border-4 border-white">
              <FaImage className="h-12 w-12 text-white opacity-60" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center mx-auto border-4 border-white">
              <FaCamera className="h-12 w-12 text-white opacity-60" />
            </div>
          )}
        </div>

        {/* Name and Position */}
        <h1 className="text-2xl font-bold mb-1">
          {profileData.fullName || 'Your Name Here'}
        </h1>
        <p className="text-indigo-100 text-lg">
          {profileData.position || 'Position'}
        </p>
        
        {/* Location and Age */}
        <div className="flex items-center justify-center mt-2 text-indigo-100 text-sm">
          {formatLocation() && (
            <div className="flex items-center mr-4">
              <FaMapMarkerAlt className="w-3 h-3 mr-1" />
              {formatLocation()}
            </div>
          )}
          {calculateAge() && (
            <div>{calculateAge()} years old</div>
          )}
        </div>

        {/* Share button for public view */}
        {isPublicView && profileUrl && (
          <button className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors">
            <FaShare className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Performance Metrics - MOVED TO TOP */}
        {(profileData.fortyYardDash || profileData.benchPressMax || profileData.verticalLeap || profileData.shuttleRun) && (
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <FaClock className="w-4 h-4 mr-2 text-indigo-600" />
              Athletic Performance
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {profileData.fortyYardDash && (
                <div className="text-center p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                  <div className="font-medium text-gray-700 text-xs">40-Yard Dash</div>
                  <div className="text-xl font-bold text-indigo-600 mt-1">{profileData.fortyYardDash}s</div>
                </div>
              )}
              {profileData.benchPressMax && (
                <div className="text-center p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                  <div className="font-medium text-gray-700 text-xs">Bench Press</div>
                  <div className="text-xl font-bold text-indigo-600 mt-1">{profileData.benchPressMax}</div>
                  <div className="text-xs text-gray-500">lbs</div>
                </div>
              )}
              {profileData.verticalLeap && (
                <div className="text-center p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                  <div className="font-medium text-gray-700 text-xs">Vertical Leap</div>
                  <div className="text-xl font-bold text-indigo-600 mt-1">{profileData.verticalLeap}"</div>
                </div>
              )}
              {profileData.shuttleRun && (
                <div className="text-center p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                  <div className="font-medium text-gray-700 text-xs">Shuttle Run</div>
                  <div className="text-xl font-bold text-indigo-600 mt-1">{profileData.shuttleRun}s</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Physical Stats - ENHANCED AND MOVED UP */}
        {(formatHeight() || profileData.weight) && (
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <FaRuler className="w-4 h-4 mr-2 text-indigo-600" />
              Physical Profile
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {formatHeight() && isVisible('isHeightVisible') && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <FaRuler className="w-4 h-4 mx-auto mb-2 text-indigo-600" />
                  <div className="font-medium text-gray-700">Height</div>
                  <div className="text-xl font-bold text-gray-800 mt-1">{formatHeight()}</div>
                </div>
              )}
              {profileData.weight && isVisible('isWeightVisible') && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <FaWeight className="w-4 h-4 mx-auto mb-2 text-indigo-600" />
                  <div className="font-medium text-gray-700">Weight</div>
                  <div className="text-xl font-bold text-gray-800 mt-1">{profileData.weight}</div>
                  <div className="text-xs text-gray-500">lbs</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Academic Information - MOVED DOWN BUT ENHANCED */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <FaGraduationCap className="w-4 h-4 mr-2 text-indigo-600" />
            Academic Standing
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3 text-sm">
              {profileData.highSchool && (
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">School</span>
                  <span className="text-gray-900 font-medium">{profileData.highSchool}</span>
                </div>
              )}
              {profileData.gradYear && (
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Graduation</span>
                  <span className="text-gray-900 font-medium">Class of {profileData.gradYear}</span>
                </div>
              )}
              {profileData.gpa && isVisible('isGpaVisible') && (
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">GPA</span>
                  <span className="text-indigo-600 font-bold text-lg">{profileData.gpa}</span>
                  {!isPublicView && !isVisible('isGpaVisible') && (
                    <FaEyeSlash className="w-3 h-3 ml-1 text-gray-400" />
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Bio - ENHANCED */}
        {profileData.bio && (
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Player Story</h3>
            <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-700 text-sm leading-relaxed italic">
                "{profileData.bio}"
              </p>
            </div>
          </section>
        )}

        {/* Media Files - ENHANCED */}
        {profileData.mockUploads && Object.keys(profileData.mockUploads).length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Supporting Materials</h3>
            <div className="space-y-3">
              {profileData.mockUploads.video && (
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-800 font-medium">Highlight Video</span>
                  </div>
                  <span className="text-xs text-green-600 font-medium">AVAILABLE</span>
                </div>
              )}
              {profileData.mockUploads.transcript && isVisible('isTranscriptVisible') && (
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-800 font-medium">Academic Transcript</span>
                  </div>
                  <span className="text-xs text-blue-600 font-medium">AVAILABLE</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Contact Info (for recruiters) - ENHANCED */}
        {isPublicView && (profileData.email || profileData.phoneNumber) && (
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <div className="space-y-3 text-sm">
                {profileData.email && (
                  <div className="flex items-center">
                    <FaEnvelope className="w-4 h-4 mr-3 text-indigo-600" />
                    <a href={`mailto:${profileData.email}`} className="text-indigo-700 hover:text-indigo-800 font-medium underline">
                      {profileData.email}
                    </a>
                  </div>
                )}
                {profileData.phoneNumber && (
                  <div className="flex items-center">
                    <FaPhone className="w-4 h-4 mr-3 text-indigo-600" />
                    <a href={`tel:${profileData.phoneNumber}`} className="text-indigo-700 hover:text-indigo-800 font-medium underline">
                      {profileData.phoneNumber}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Profile URL */}
        {!isPublicView && profileUrl && (
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Share Your Profile</h3>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Your public profile URL:</p>
              <p className="text-sm font-mono text-indigo-700 break-all">{profileUrl}</p>
            </div>
          </section>
        )}

        {/* Preview Notice */}
        {!isPublicView && (
          <div className="text-center py-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              This is how your profile will appear to college recruiters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedProfilePreview; 