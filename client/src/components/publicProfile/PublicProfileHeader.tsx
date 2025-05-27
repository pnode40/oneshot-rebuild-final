import React, { useState } from 'react';
import { AthleteProfile } from '../../types/athleteProfile';
import TranscriptModal from './TranscriptModal';

interface PublicProfileHeaderProps {
  profile: AthleteProfile;
}

const PublicProfileHeader: React.FC<PublicProfileHeaderProps> = ({ profile }) => {
  const [showTranscript, setShowTranscript] = useState(false);
  
  // Helper function to format height from inches to feet and inches
  const formatHeight = (heightInches: number | null | undefined): string => {
    if (!heightInches) return '';
    const feet = Math.floor(heightInches / 12);
    const inches = heightInches % 12;
    return `${feet}'${inches}"`;
  };

  return (
    <>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Banner and profile photo */}
        <div className="relative">
          <div className="w-full h-32 bg-gradient-to-r from-blue-800 to-blue-600"></div>
          
          {/* Profile Photo */}
          <div className="absolute bottom-0 left-4 transform translate-y-1/2">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
              {profile.profileImageUrl ? (
                <img 
                  src={profile.profileImageUrl} 
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500 text-xl font-bold">
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Profile info */}
        <div className="pt-16 px-4 pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {profile.firstName} {profile.lastName}
                {profile.jerseyNumber && <span className="ml-2 text-blue-600">#{profile.jerseyNumber}</span>}
              </h1>
              
              <p className="text-gray-600 mt-1">
                {profile.highSchoolName}
                {profile.graduationYear && <span> • Class of {profile.graduationYear}</span>}
              </p>
            </div>
            
            {profile.athleteRole === 'transfer_portal' && profile.showNcaaInfo && (
              <div className="mt-2 md:mt-0 bg-blue-50 py-1 px-3 rounded-full text-blue-700 text-sm font-medium">
                Transfer Portal
                {profile.ncaaId && <span className="ml-2">• NCAA ID: {profile.ncaaId}</span>}
              </div>
            )}
          </div>
          
          {/* Position */}
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.primaryPosition && (
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {profile.primaryPosition}
              </span>
            )}
            
            {profile.secondaryPosition && (
              <span className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                {profile.secondaryPosition}
              </span>
            )}
            
            {Array.isArray(profile.positions) && profile.positions.map((position: string, index: number) => (
              !position.includes(profile.primaryPosition as string) && 
              !position.includes(profile.secondaryPosition as string) && (
                <span 
                  key={index} 
                  className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full"
                >
                  {position}
                </span>
              )
            ))}
          </div>
          
          {/* Key metrics */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            {profile.showHeight && profile.heightInches && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Height</p>
                <p className="text-lg font-semibold">{formatHeight(profile.heightInches)}</p>
              </div>
            )}
            
            {profile.showWeight && profile.weightLbs && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Weight</p>
                <p className="text-lg font-semibold">{profile.weightLbs} lbs</p>
              </div>
            )}
            
            {profile.showGPA && profile.gpa && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">GPA</p>
                    <p className="text-lg font-semibold">{profile.gpa.toFixed(2)}</p>
                  </div>
                  {profile.showTranscript && profile.transcriptUrl && (
                    <div className="flex items-center" title="Transcript available">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 text-green-600" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Transcript button */}
          {profile.showTranscript && profile.transcriptUrl && (
            <div className="mt-4">
              <button
                onClick={() => setShowTranscript(true)}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Transcript
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Transcript Modal */}
      {profile.transcriptUrl && (
        <TranscriptModal
          isOpen={showTranscript}
          onClose={() => setShowTranscript(false)}
          transcriptUrl={profile.transcriptUrl}
          athleteName={`${profile.firstName} ${profile.lastName}`}
        />
      )}
    </>
  );
};

export default PublicProfileHeader; 