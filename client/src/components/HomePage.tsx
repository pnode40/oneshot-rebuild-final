import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { 
  FaChartLine, 
  FaShieldAlt, 
  FaUser, 
  FaBell,
  FaVideo,
  FaCamera,
  FaGraduationCap,
  FaRocket,
  FaTrophy,
  FaUsers
} from 'react-icons/fa';
import { MdDashboard, MdSecurity, MdAnalytics } from 'react-icons/md';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [athleteProfileId, setAthleteProfileId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the athlete profile for the current user
    const fetchAthleteProfile = async () => {
      if (user?.id) {
        try {
          const response = await fetch('/api/athlete-profile/by-user', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('oneshot_auth_token')}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data?.id) {
              setAthleteProfileId(data.data.id);
            }
          }
        } catch (error) {
          console.error('Error fetching athlete profile:', error);
        }
      }
    };

    fetchAthleteProfile();
  }, [user]);

  const features = [
    {
      title: 'Profile Management',
      description: 'Create and manage your athletic profile with videos, photos, and transcripts',
      icon: FaUser,
      color: 'bg-blue-500',
      link: athleteProfileId ? `/profile-management/${athleteProfileId}` : '#',
      cta: 'Manage Profile',
      disabled: !athleteProfileId
    },
    {
      title: 'Analytics Dashboard',
      description: 'AI-powered insights and engagement metrics for your profile',
      icon: MdAnalytics,
      color: 'bg-purple-500',
      link: '/analytics',
      cta: 'View Analytics'
    },
    {
      title: 'Security Center',
      description: 'Real-time security monitoring and threat detection',
      icon: FaShieldAlt,
      color: 'bg-green-500',
      link: '/security',
      cta: 'Security Dashboard'
    },
    {
      title: 'Notifications',
      description: 'Multi-channel alerts via email, SMS, push, and Slack',
      icon: FaBell,
      color: 'bg-yellow-500',
      link: '/notifications',
      cta: 'Notification Settings'
    }
  ];

  const stats = [
    { label: 'Active Athletes', value: '2,847', icon: FaUsers },
    { label: 'College Recruiters', value: '523', icon: FaTrophy },
    { label: 'Video Views', value: '45.2K', icon: FaVideo },
    { label: 'Success Stories', value: '189', icon: FaRocket }
  ];

  const handleProfileClick = () => {
    if (athleteProfileId) {
      navigate(`/profile-management/${athleteProfileId}`);
    } else {
      // Navigate to profile creation page
      navigate('/create-profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome back, {user?.firstName || 'Athlete'}!
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Your AI-powered recruiting platform with enterprise-grade security
            </p>
            
            {!athleteProfileId && (
              <div className="mb-8 bg-blue-500 bg-opacity-50 rounded-lg p-4 max-w-2xl mx-auto">
                <p className="text-lg font-medium mb-2">🎉 Welcome to OneShot!</p>
                <p className="text-blue-100">
                  Get started by creating your athlete profile to unlock all features.
                </p>
              </div>
            )}
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleProfileClick}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <FaUser className="inline-block mr-2" />
                {athleteProfileId ? 'Manage Profile' : 'Create Profile'}
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                <FaChartLine className="inline-block mr-2" />
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center">
                <Icon className="text-3xl text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Your OneShot Command Center
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`${feature.color} text-white p-3 rounded-lg`}>
                      <Icon className="text-2xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {feature.description}
                      </p>
                      {feature.disabled ? (
                        <span className="inline-flex items-center text-gray-400 font-medium">
                          {feature.cta} (Profile Required)
                        </span>
                      ) : (
                        <Link
                          to={feature.link}
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {feature.cta} →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex items-center justify-center space-x-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <FaVideo className="text-blue-600" />
              <span className="font-medium">Add Video</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <FaCamera className="text-green-600" />
              <span className="font-medium">Upload Photo</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <FaGraduationCap className="text-purple-600" />
              <span className="font-medium">Add Transcript</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <MdSecurity className="text-red-600" />
              <span className="font-medium">Security Check</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded">
                <MdAnalytics className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">New ML insights available</p>
                <p className="text-sm text-gray-600">AI detected optimization opportunities for your profile</p>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="bg-green-100 p-2 rounded">
                <FaShieldAlt className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Security scan completed</p>
                <p className="text-sm text-gray-600">No threats detected in the last 24 hours</p>
              </div>
              <span className="text-xs text-gray-500">5 hours ago</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="bg-purple-100 p-2 rounded">
                <FaChartLine className="text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Profile views increased</p>
                <p className="text-sm text-gray-600">Your profile received 47 new views this week</p>
              </div>
              <span className="text-xs text-gray-500">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 