import React, { useState, useEffect } from 'react';
import {
  FaUser,
  FaVideo,
  FaCamera,
  FaGraduationCap,
  FaChartLine,
  FaEye,
  FaEdit,
  FaShare,
  FaDownload,
  FaCog,
  FaShieldAlt,
  FaStar,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';
import { MdDashboard, MdVerified } from 'react-icons/md';
import VideoLinkManager from './VideoLinkManager';
import ProfilePhotoManager from './ProfilePhotoManager';
import TranscriptManager from './TranscriptManager';
import OGImageManager from './OGImageManager';

interface ProfileStats {
  totalVideos: number;
  totalPhotos: number;
  totalTranscripts: number;
  profileViews: number;
  lastUpdated: string;
  completionPercentage: number;
}

interface AthleteProfile {
  id: string;
  firstName: string;
  lastName: string;
  sport: string;
  position: string;
  graduationYear: number;
  height: string;
  weight: string;
  location: string;
  email: string;
  phone?: string;
  bio?: string;
  profilePhotoUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

interface EnhancedProfileDashboardProps {
  athleteProfileId: string;
  isOwner: boolean;
}

const EnhancedProfileDashboard: React.FC<EnhancedProfileDashboardProps> = ({ 
  athleteProfileId, 
  isOwner 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, [athleteProfileId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profile information
      const profileResponse = await fetch(`/api/athlete-profile/${athleteProfileId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!profileResponse.ok) {
        throw new Error(`Failed to fetch profile: ${profileResponse.status}`);
      }

      const profileResult = await profileResponse.json();
      setProfile(profileResult.data);

      // Fetch profile statistics
      const statsResponse = await fetch(`/api/athlete-profile/${athleteProfileId}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (statsResponse.ok) {
        const statsResult = await statsResponse.json();
        setStats(statsResult.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: MdDashboard },
    { id: 'videos', label: 'Videos', icon: FaVideo },
    { id: 'photos', label: 'Photos', icon: FaCamera },
    { id: 'transcripts', label: 'Transcripts', icon: FaGraduationCap },
    { id: 'social', label: 'Social Media', icon: FaShare },
  ];

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <FaShieldAlt className="text-red-500 mr-3" />
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Profile</h3>
            <p className="text-red-600 text-sm mt-1">{error || 'Profile not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={profile.profilePhotoUrl || '/default-avatar.png'}
                alt={`${profile.firstName} ${profile.lastName}`}
                className="w-24 h-24 rounded-full border-4 border-white object-cover"
              />
              {profile.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1">
                  <MdVerified className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="flex-1 text-white">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h1>
                {profile.isVerified && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <MdVerified className="w-3 h-3 mr-1" />
                    Verified
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="opacity-75">Sport:</span>
                  <p className="font-medium">{profile.sport}</p>
                </div>
                <div>
                  <span className="opacity-75">Position:</span>
                  <p className="font-medium">{profile.position}</p>
                </div>
                <div>
                  <span className="opacity-75">Class:</span>
                  <p className="font-medium">{profile.graduationYear}</p>
                </div>
                <div>
                  <span className="opacity-75">Location:</span>
                  <p className="font-medium">{profile.location}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              {isOwner && (
                <button className="flex items-center space-x-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <FaEdit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
              <button className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                <FaShare className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Stats */}
        {stats && (
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalVideos}</div>
                <div className="text-sm text-gray-600">Videos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalPhotos}</div>
                <div className="text-sm text-gray-600">Photos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalTranscripts}</div>
                <div className="text-sm text-gray-600">Transcripts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.profileViews}</div>
                <div className="text-sm text-gray-600">Profile Views</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getCompletionColor(stats.completionPercentage)}`}>
                  {stats.completionPercentage}%
                </div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm">
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Information */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Height</label>
                      <p className="mt-1 text-sm text-gray-900">{profile.height}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Weight</label>
                      <p className="mt-1 text-sm text-gray-900">{profile.weight}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
                    </div>
                    {profile.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="mt-1 text-sm text-gray-900">{profile.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {profile.bio && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Biography</h3>
                    <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FaCalendarAlt className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Profile Created</p>
                        <p className="text-xs text-gray-500">
                          {new Date(profile.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    {stats && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FaChartLine className="text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Last Updated</p>
                          <p className="text-xs text-gray-500">
                            {new Date(stats.lastUpdated).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Completion */}
              <div className="space-y-6">
                {stats && (
                  <div className={`p-6 rounded-lg ${getCompletionBgColor(stats.completionPercentage)}`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Overall Progress</span>
                          <span className={`font-medium ${getCompletionColor(stats.completionPercentage)}`}>
                            {stats.completionPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              stats.completionPercentage >= 80 ? 'bg-green-600' :
                              stats.completionPercentage >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${stats.completionPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Videos</span>
                          <span className={stats.totalVideos > 0 ? 'text-green-600' : 'text-gray-400'}>
                            {stats.totalVideos > 0 ? '✓' : '○'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Photos</span>
                          <span className={stats.totalPhotos > 0 ? 'text-green-600' : 'text-gray-400'}>
                            {stats.totalPhotos > 0 ? '✓' : '○'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Transcripts</span>
                          <span className={stats.totalTranscripts > 0 ? 'text-green-600' : 'text-gray-400'}>
                            {stats.totalTranscripts > 0 ? '✓' : '○'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Biography</span>
                          <span className={profile.bio ? 'text-green-600' : 'text-gray-400'}>
                            {profile.bio ? '✓' : '○'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    {isOwner && (
                      <>
                        <button
                          onClick={() => setActiveTab('videos')}
                          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-white rounded-lg transition-colors"
                        >
                          <FaVideo className="text-blue-600" />
                          <span className="text-sm font-medium">Manage Videos</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('photos')}
                          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-white rounded-lg transition-colors"
                        >
                          <FaCamera className="text-green-600" />
                          <span className="text-sm font-medium">Manage Photos</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('transcripts')}
                          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-white rounded-lg transition-colors"
                        >
                          <FaGraduationCap className="text-purple-600" />
                          <span className="text-sm font-medium">Manage Transcripts</span>
                        </button>
                      </>
                    )}
                    <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-white rounded-lg transition-colors">
                      <FaDownload className="text-gray-600" />
                      <span className="text-sm font-medium">Download Profile</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="p-6">
            <VideoLinkManager athleteProfileId={athleteProfileId} isOwner={isOwner} />
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="p-6">
            <ProfilePhotoManager userId={athleteProfileId} isOwner={isOwner} />
          </div>
        )}

        {activeTab === 'transcripts' && (
          <div className="p-6">
            <TranscriptManager athleteProfileId={athleteProfileId} isOwner={isOwner} />
          </div>
        )}

        {activeTab === 'social' && (
          <div className="p-6">
            <OGImageManager athleteProfileId={athleteProfileId} isOwner={isOwner} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedProfileDashboard; 