import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  ChartBarIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  MapPinIcon,
  AcademicCapIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ProfileAnalytics {
  overview: {
    totalViews: number;
    uniqueViews: number;
    totalShares: number;
    favorites: number;
    viewsThisWeek: number;
    viewsLastWeek: number;
    engagementRate: number;
  };
  viewsOverTime: Array<{
    date: string;
    views: number;
    uniqueViews: number;
  }>;
  demographics: {
    locations: Array<{ location: string; views: number; percentage: number }>;
    devices: Array<{ device: string; views: number; percentage: number }>;
    referrers: Array<{ source: string; views: number; percentage: number }>;
  };
  engagement: {
    timeOnProfile: number; // in seconds
    bounceRate: number; // percentage
    mostViewedSections: Array<{ section: string; views: number }>;
    peakHours: Array<{ hour: number; views: number }>;
  };
  recruiterActivity: {
    recruiterViews: number;
    schoolsInterested: Array<{ school: string; views: number; lastViewed: string }>;
    contactRequests: number;
    profileSaves: number;
  };
}

interface ProfileAnalyticsDashboardProps {
  profileSlug: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

const fetchProfileAnalytics = async (slug: string, timeRange: string): Promise<ProfileAnalytics> => {
  const { data } = await axios.get(`/api/v1/analytics/profile/${slug}?timeRange=${timeRange}`);
  return data.data;
};

const ProfileAnalyticsDashboard: React.FC<ProfileAnalyticsDashboardProps> = ({
  profileSlug,
  timeRange = '30d'
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'engagement' | 'demographics' | 'recruiters'>('overview');

  const { 
    data: analytics, 
    isLoading, 
    isError,
    refetch
  } = useQuery({
    queryKey: ['profileAnalytics', profileSlug, selectedTimeRange],
    queryFn: () => fetchProfileAnalytics(profileSlug, selectedTimeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  const getViewsTrend = () => {
    if (!analytics) return { trend: 'neutral', percentage: 0 };
    
    const { viewsThisWeek, viewsLastWeek } = analytics.overview;
    if (viewsLastWeek === 0) return { trend: 'up', percentage: 100 };
    
    const percentage = ((viewsThisWeek - viewsLastWeek) / viewsLastWeek) * 100;
    const trend = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral';
    
    return { trend, percentage: Math.abs(percentage) };
  };

  const viewsTrend = getViewsTrend();

  // Chart configurations
  const viewsChartData = {
    labels: analytics?.viewsOverTime.map(item => 
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Total Views',
        data: analytics?.viewsOverTime.map(item => item.views) || [],
        borderColor: '#00c2ff',
        backgroundColor: 'rgba(0, 194, 255, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Unique Views',
        data: analytics?.viewsOverTime.map(item => item.uniqueViews) || [],
        borderColor: '#ff6b35',
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const deviceChartData = {
    labels: analytics?.demographics.devices.map(item => item.device) || [],
    datasets: [{
      data: analytics?.demographics.devices.map(item => item.percentage) || [],
      backgroundColor: [
        '#00c2ff',
        '#ff6b35',
        '#00ff88',
        '#ff6b9d',
        '#ffd700'
      ],
      borderWidth: 0,
    }]
  };

  const peakHoursChartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [{
      label: 'Views by Hour',
      data: Array.from({ length: 24 }, (_, hour) => {
        const hourData = analytics?.engagement.peakHours.find(h => h.hour === hour);
        return hourData ? hourData.views : 0;
      }),
      backgroundColor: '#00c2ff',
      borderRadius: 4,
    }]
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00c2ff]"></div>
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Unavailable</h3>
        <p className="text-gray-600 mb-4">Unable to load analytics data at this time.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-[#00c2ff] text-white rounded-lg hover:bg-[#00a8d6] transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile Analytics</h2>
          <p className="text-gray-600">Track your profile performance and recruiter engagement</p>
        </div>
        
        {/* Time Range Selector */}
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
        >
          {timeRangeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'engagement', label: 'Engagement', icon: HeartIcon },
            { id: 'demographics', label: 'Demographics', icon: UserGroupIcon },
            { id: 'recruiters', label: 'Recruiters', icon: AcademicCapIcon }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-[#00c2ff] text-[#00c2ff]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalViews.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <EyeIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {viewsTrend.trend === 'up' ? (
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                ) : viewsTrend.trend === 'down' ? (
                  <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                ) : null}
                <span className={`text-sm ${
                  viewsTrend.trend === 'up' ? 'text-green-600' : 
                  viewsTrend.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {viewsTrend.percentage.toFixed(1)}% vs last week
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unique Views</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.uniqueViews.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-full">
                  <UserGroupIcon className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600">
                  {((analytics.overview.uniqueViews / analytics.overview.totalViews) * 100).toFixed(1)}% of total views
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Shares</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalShares}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <ShareIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600">
                  {((analytics.overview.totalShares / analytics.overview.totalViews) * 100).toFixed(1)}% share rate
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Favorites</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.favorites}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-full">
                  <HeartIcon className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600">
                  {analytics.overview.engagementRate.toFixed(1)}% engagement rate
                </span>
              </div>
            </div>
          </div>

          {/* Views Over Time Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Views Over Time</h3>
            <div className="h-80">
              <Line 
                data={viewsChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'engagement' && (
        <div className="space-y-6">
          {/* Engagement Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Time on Profile</h3>
                <ClockIcon className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {Math.floor(analytics.engagement.timeOnProfile / 60)}m {analytics.engagement.timeOnProfile % 60}s
              </p>
              <p className="text-sm text-gray-600 mt-2">Average session duration</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Bounce Rate</h3>
                <ArrowTrendingDownIcon className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-orange-600">{analytics.engagement.bounceRate}%</p>
              <p className="text-sm text-gray-600 mt-2">Visitors who left quickly</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Engagement Score</h3>
                <HeartIcon className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-600">{analytics.overview.engagementRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-600 mt-2">Overall engagement rate</p>
            </div>
          </div>

          {/* Peak Hours Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Viewing Hours</h3>
            <div className="h-80">
              <Bar 
                data={peakHoursChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Most Viewed Sections */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Viewed Sections</h3>
            <div className="space-y-3">
              {analytics.engagement.mostViewedSections.map((section, index) => (
                <div key={section.section} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                    <span className="font-medium text-gray-900">{section.section}</span>
                  </div>
                  <span className="text-sm text-gray-600">{section.views} views</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'demographics' && (
        <div className="space-y-6">
          {/* Device Types */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Types</h3>
              <div className="h-64">
                <Doughnut 
                  data={deviceChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Top Locations */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Locations</h3>
              <div className="space-y-3">
                {analytics.demographics.locations.slice(0, 5).map((location, index) => (
                  <div key={location.location} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{location.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{location.views} views</div>
                      <div className="text-xs text-gray-500">{location.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.demographics.referrers.map((referrer, index) => (
                <div key={referrer.source} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 capitalize">{referrer.source}</span>
                    <span className="text-sm text-gray-600">{referrer.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#00c2ff] h-2 rounded-full" 
                      style={{ width: `${referrer.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{referrer.views} views</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'recruiters' && (
        <div className="space-y-6">
          {/* Recruiter Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recruiter Views</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.recruiterActivity.recruiterViews}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-full">
                  <AcademicCapIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Schools Interested</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.recruiterActivity.schoolsInterested.length}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <UserGroupIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Contact Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.recruiterActivity.contactRequests}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <EnvelopeIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile Saves</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.recruiterActivity.profileSaves}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-full">
                  <HeartIcon className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Schools Interested */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schools Showing Interest</h3>
            <div className="space-y-3">
              {analytics.recruiterActivity.schoolsInterested.map((school, index) => (
                <div key={school.school} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                    <div>
                      <div className="font-medium text-gray-900">{school.school}</div>
                      <div className="text-sm text-gray-600">{school.views} views</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Last viewed</div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(school.lastViewed).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileAnalyticsDashboard; 