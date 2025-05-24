import React, { useState } from 'react';
import { 
  FaShareAlt,
  FaPlay,
  FaDownload,
  FaPhone,
  FaEnvelope,
  FaCheckCircle,
  FaTrophy,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaFileAlt,
  FaTimes,
  FaEye
} from 'react-icons/fa';

// Enhanced profile interface for recruiter view
interface RecruiterProfileData {
  // Critical Stats (Hero Section)
  firstName: string;
  lastName: string;
  jerseyNumber?: string;
  heightFt: number;
  heightIn: number;
  weight: number;
  gpa: number;
  
  // Context Info
  position: string;
  highSchool: string;
  gradYear: number;
  city?: string;
  state?: string;
  
  // Performance Categories
  speedAgility: {
    verticalLeap?: number;
    broadJump?: number;
    proAgility?: number;
  };
  strengthPower: {
    bench?: number;
    squat?: number;
    deadlift?: number;
  };
  
  // Supporting Info
  highlightVideoUrl?: string;
  transcriptAvailable?: boolean;
  transcriptUrl?: string; // URL to view transcript
  ncaaId?: string;
  
  // Contact (verified)
  coachFirstName?: string;
  coachLastName?: string;
  coachMobile?: string;
  coachEmail?: string;
  coachVerified?: boolean;
  
  playerMobile?: string;
  playerEmail?: string;
  
  profileImageUrl?: string;
}

interface Props {
  profileData: RecruiterProfileData;
  viewType?: 'qr-scan' | 'social-share';
}

const RecruiterPublicProfile: React.FC<Props> = ({ profileData, viewType = 'qr-scan' }) => {
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  
  // Format height for display
  const formatHeight = () => `${profileData.heightFt}'${profileData.heightIn}"`;
  
  // Location string
  const location = [profileData.city, profileData.state].filter(Boolean).join(', ');
  
  // Check if stats meet typical thresholds (this could be configurable)
  const getStatStatus = (value: number, thresholds: {good: number, excellent: number}) => {
    if (value >= thresholds.excellent) return 'excellent';
    if (value >= thresholds.good) return 'good';
    return 'needs-improvement';
  };
  
  // Sample thresholds (would be position-specific in real app)
  const heightStatus = getStatStatus(profileData.heightFt * 12 + profileData.heightIn, {good: 70, excellent: 74});
  const weightStatus = getStatStatus(profileData.weight, {good: 180, excellent: 200});
  const gpaStatus = getStatStatus(profileData.gpa, {good: 3.0, excellent: 3.5});
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* HERO SECTION - Critical 5-Second Info */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-y-12"></div>
        </div>
        
        <div className="relative px-6 py-8">
          {/* Share Button */}
          <button className="absolute top-4 right-4 p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all">
            <FaShareAlt className="w-5 h-5" />
          </button>
          
          {/* Profile Photo */}
          <div className="text-center mb-6">
            {profileData.profileImageUrl ? (
              <img 
                src={profileData.profileImageUrl}
                alt={`${profileData.firstName} ${profileData.lastName}`}
                className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-white shadow-2xl"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-white bg-opacity-20 flex items-center justify-center mx-auto border-4 border-white">
                <span className="text-4xl font-bold">
                  {profileData.firstName[0]}{profileData.lastName[0]}
                </span>
              </div>
            )}
          </div>
          
          {/* NAME + JERSEY - Identity */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {profileData.firstName} {profileData.lastName}
              {profileData.jerseyNumber && (
                <span className="text-2xl font-normal ml-2 opacity-90">#{profileData.jerseyNumber}</span>
              )}
            </h1>
            <p className="text-xl text-blue-100">{profileData.position}</p>
            <p className="text-blue-200 mt-1">{profileData.highSchool} • Class of {profileData.gradYear}</p>
            {location && (
              <p className="text-blue-200 text-sm mt-1 flex items-center justify-center">
                <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                {location}
              </p>
            )}
          </div>
          
          {/* CRITICAL STATS - Qualification Check */}
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
            {/* Height */}
            <div className={`text-center p-4 rounded-xl border-2 ${getStatusColor(heightStatus)}`}>
              <div className="text-2xl font-bold">{formatHeight()}</div>
              <div className="text-xs font-medium mt-1">HEIGHT</div>
            </div>
            
            {/* Weight */}
            <div className={`text-center p-4 rounded-xl border-2 ${getStatusColor(weightStatus)}`}>
              <div className="text-2xl font-bold">{profileData.weight}</div>
              <div className="text-xs font-medium mt-1">WEIGHT</div>
            </div>
            
            {/* GPA with Transcript Verification */}
            <div className={`text-center p-4 rounded-xl border-2 ${getStatusColor(gpaStatus)} relative`}>
              <div className="text-2xl font-bold">{profileData.gpa}</div>
              <div className="text-xs font-medium mt-1">GPA</div>
              
              {/* Transcript Verification Button */}
              {profileData.transcriptAvailable && profileData.transcriptUrl && (
                <button
                  onClick={() => setShowTranscriptModal(true)}
                  className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors shadow-lg"
                  title="Verify GPA - Quick View Transcript"
                >
                  <FaFileAlt className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* TRANSCRIPT QUICK VIEW MODAL */}
      {showTranscriptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <FaFileAlt className="w-5 h-5 mr-2 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Academic Transcript - {profileData.firstName} {profileData.lastName}
                </h3>
              </div>
              <button
                onClick={() => setShowTranscriptModal(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <FaTimes className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-4 overflow-auto max-h-[calc(90vh-120px)]">
              {profileData.transcriptUrl ? (
                <div className="space-y-4">
                  {/* Quick GPA Verification Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <FaEye className="w-5 h-5 mr-2 text-blue-600" />
                      <div>
                        <div className="font-medium text-blue-800">Quick GPA Verification</div>
                        <div className="text-sm text-blue-600 mt-1">
                          Review transcript to verify reported GPA of <strong>{profileData.gpa}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Transcript Display */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <iframe
                      src={profileData.transcriptUrl}
                      className="w-full h-96 border-0"
                      title="Academic Transcript"
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <FaCheckCircle className="w-4 h-4 inline mr-1 text-green-600" />
                      Official transcript uploaded by student
                    </div>
                    <button
                      onClick={() => setShowTranscriptModal(false)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Continue Reviewing Profile
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaFileAlt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Transcript not available for preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* HIGHLIGHT VIDEO - Primary Action */}
      {profileData.highlightVideoUrl && (
        <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <button className="w-full bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-center hover:from-red-700 hover:to-red-800 transition-all shadow-lg">
            <FaPlay className="w-8 h-8 mx-auto mb-3" />
            <div className="text-xl font-bold">WATCH HIGHLIGHT FILM</div>
            <div className="text-red-100 text-sm mt-1">Tap to view on YouTube/Hudl</div>
          </button>
        </div>
      )}
      
      {/* PERFORMANCE METRICS - Below the Fold */}
      <div className="p-6 space-y-6">
        
        {/* Speed & Agility */}
        {(profileData.speedAgility.verticalLeap || profileData.speedAgility.broadJump || profileData.speedAgility.proAgility) && (
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <FaTrophy className="w-5 h-5 mr-2 text-yellow-600" />
              Speed & Agility
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {profileData.speedAgility.verticalLeap && (
                <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-lg font-bold text-gray-800">{profileData.speedAgility.verticalLeap}"</div>
                  <div className="text-xs text-gray-600">VERTICAL</div>
                </div>
              )}
              {profileData.speedAgility.broadJump && (
                <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-lg font-bold text-gray-800">{profileData.speedAgility.broadJump}"</div>
                  <div className="text-xs text-gray-600">BROAD JUMP</div>
                </div>
              )}
              {profileData.speedAgility.proAgility && (
                <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-lg font-bold text-gray-800">{profileData.speedAgility.proAgility}s</div>
                  <div className="text-xs text-gray-600">PRO AGILITY</div>
                </div>
              )}
            </div>
          </section>
        )}
        
        {/* Strength & Power */}
        {(profileData.strengthPower.bench || profileData.strengthPower.squat || profileData.strengthPower.deadlift) && (
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <FaTrophy className="w-5 h-5 mr-2 text-red-600" />
              Strength & Power
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {profileData.strengthPower.bench && (
                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-lg font-bold text-gray-800">{profileData.strengthPower.bench}</div>
                  <div className="text-xs text-gray-600">BENCH</div>
                </div>
              )}
              {profileData.strengthPower.squat && (
                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-lg font-bold text-gray-800">{profileData.strengthPower.squat}</div>
                  <div className="text-xs text-gray-600">SQUAT</div>
                </div>
              )}
              {profileData.strengthPower.deadlift && (
                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-lg font-bold text-gray-800">{profileData.strengthPower.deadlift}</div>
                  <div className="text-xs text-gray-600">DEADLIFT</div>
                </div>
              )}
            </div>
          </section>
        )}
        
        {/* Academic Support */}
        {(profileData.transcriptAvailable || profileData.ncaaId) && (
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <FaGraduationCap className="w-5 h-5 mr-2 text-blue-600" />
              Academic
            </h3>
            <div className="space-y-3">
              {profileData.transcriptAvailable && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="font-medium text-gray-800">Official Transcript</span>
                  <button
                    onClick={() => setShowTranscriptModal(true)}
                    className="flex items-center text-blue-600 font-medium hover:text-blue-700"
                  >
                    <FaEye className="w-4 h-4 mr-2" />
                    Quick View
                  </button>
                </div>
              )}
              {profileData.ncaaId && (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <span className="font-medium text-gray-800">NCAA ID: {profileData.ncaaId}</span>
                  <FaCheckCircle className="w-5 h-5 text-green-600" />
                </div>
              )}
            </div>
          </section>
        )}
        
        {/* Contact Information */}
        <section>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Contact Information</h3>
          
          {/* Coach Contact */}
          {profileData.coachFirstName && (
            <div className="mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-800">Head Coach</span>
                {profileData.coachVerified && (
                  <div className="flex items-center text-green-600 text-sm">
                    <FaCheckCircle className="w-4 h-4 mr-1" />
                    Verified
                  </div>
                )}
              </div>
              <div className="font-bold text-gray-800 mb-2">
                {profileData.coachFirstName} {profileData.coachLastName}
              </div>
              <div className="space-y-2">
                {profileData.coachMobile && (
                  <a href={`tel:${profileData.coachMobile}`} className="flex items-center text-indigo-600 hover:text-indigo-800">
                    <FaPhone className="w-4 h-4 mr-2" />
                    {profileData.coachMobile}
                  </a>
                )}
                {profileData.coachEmail && (
                  <a href={`mailto:${profileData.coachEmail}`} className="flex items-center text-indigo-600 hover:text-indigo-800">
                    <FaEnvelope className="w-4 h-4 mr-2" />
                    {profileData.coachEmail}
                  </a>
                )}
              </div>
            </div>
          )}
          
          {/* Player Contact */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="font-medium text-gray-800 mb-2">Player Contact</div>
            <div className="space-y-2">
              {profileData.playerMobile && (
                <a href={`tel:${profileData.playerMobile}`} className="flex items-center text-gray-600 hover:text-gray-800">
                  <FaPhone className="w-4 h-4 mr-2" />
                  {profileData.playerMobile}
                </a>
              )}
              {profileData.playerEmail && (
                <a href={`mailto:${profileData.playerEmail}`} className="flex items-center text-gray-600 hover:text-gray-800">
                  <FaEnvelope className="w-4 h-4 mr-2" />
                  {profileData.playerEmail}
                </a>
              )}
            </div>
          </div>
        </section>
        
        {/* OneShot Branding - Only for social share version */}
        {viewType === 'social-share' && (
          <section className="text-center py-8 border-t border-gray-200">
            <div className="text-gray-500 text-sm mb-3">Powered by</div>
            <div className="text-2xl font-bold text-indigo-600 mb-2">OneShot</div>
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              Create Your Athlete Profile
            </button>
          </section>
        )}
      </div>
    </div>
  );
};

export default RecruiterPublicProfile; 