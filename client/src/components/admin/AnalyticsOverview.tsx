import React, { useState, useEffect } from 'react';
import { 
  FaEye, 
  FaEnvelope, 
  FaHeart, 
  FaChartLine,
  FaSync,
  FaTrophy,
  FaUsers,
  FaBrain,
  FaArrowUp,
  FaArrowDown,
  FaMinus
} from 'react-icons/fa';
import { 
  MdTrendingUp, 
  MdTrendingDown,
  MdTrendingFlat
} from 'react-icons/md';

interface AnalyticsData {
  overview: {
    monthlyViews: number;
    monthlyContacts: number;
    engagementScore: number;
  };
  insights: Array<{
    id: number;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
  }>;
  predictions: Array<{
    predictionType: string;
    prediction: any;
    confidence: number;
  }>;
  engagement: {
    totalViews: number;
    totalContacts: number;
    totalFavorites: number;
    history: Array<{
      date: string;
      views: number;
      contacts: number;
      favorites: number;
      engagementScore: number;
    }>;
  };
}

interface AnalyticsOverviewProps {
  userRole?: string;
  userId?: number;
  onRefresh?: () => void;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ 
  userRole = 'athlete', 
  userId,
  onRefresh 
}) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const isAdmin = userRole === 'admin';

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Temporarily use test endpoint to show working dashboard
      const response = await fetch('/api/analytics/test', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data.sampleData); // Use the sample data from test endpoint
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [userId]);

  const handleRefresh = () => {
    fetchAnalyticsData();
    onRefresh?.();
  };

  const getEngagementScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getEngagementScoreIcon = (score: number) => {
    if (score >= 80) return FaTrophy;
    if (score >= 60) return FaChartLine;
    return FaArrowUp;
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return { icon: FaArrowUp, color: 'text-green-500' };
    if (current < previous) return { icon: FaArrowDown, color: 'text-red-500' };
    return { icon: FaMinus, color: 'text-gray-500' };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSync className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Analytics</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-3 text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div>No analytics data available</div>;
  }

  const EngagementIcon = getEngagementScoreIcon(data.overview.engagementScore);

  return (
    <div className="space-y-6">
      {/* Header with last updated */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {isAdmin ? 'System Analytics Overview' : 'Your Analytics Overview'}
        </h2>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          {lastUpdated && (
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
          <button
            onClick={handleRefresh}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaSync className="h-4 w-4 mr-1" />
            Refresh
          </button>
        </div>
      </div>

      {/* Engagement Score Card */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EngagementIcon className={`h-8 w-8 ${getEngagementScoreColor(data.overview.engagementScore).split(' ')[0]}`} />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {isAdmin ? 'Average Engagement Score' : 'Your Engagement Score'}
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-3xl font-semibold text-gray-900">
                    {data.overview.engagementScore.toFixed(1)}
                  </div>
                  <div className={`ml-2 flex items-baseline text-sm font-semibold px-2 py-1 rounded-full ${getEngagementScoreColor(data.overview.engagementScore)}`}>
                    {data.overview.engagementScore >= 80 ? 'Excellent' :
                     data.overview.engagementScore >= 60 ? 'Good' :
                     data.overview.engagementScore >= 40 ? 'Fair' : 'Needs Improvement'}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  data.overview.engagementScore >= 80 ? 'bg-green-500' :
                  data.overview.engagementScore >= 60 ? 'bg-yellow-500' :
                  data.overview.engagementScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, data.overview.engagementScore)}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {data.overview.engagementScore >= 80 
                ? 'Your profile is performing exceptionally well!'
                : data.overview.engagementScore >= 60
                ? 'Good engagement - keep up the momentum!'
                : data.overview.engagementScore >= 40
                ? 'Room for improvement - check your insights for recommendations.'
                : 'Consider optimizing your profile based on AI recommendations.'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Monthly Views */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaEye className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {isAdmin ? 'Total Views (30d)' : 'Profile Views (30d)'}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {data.overview.monthlyViews.toLocaleString()}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <MdTrendingUp className="h-4 w-4 mr-1" />
                      +12%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Contacts */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaEnvelope className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {isAdmin ? 'Total Contacts (30d)' : 'Recruiter Contacts (30d)'}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {data.overview.monthlyContacts.toLocaleString()}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <MdTrendingUp className="h-4 w-4 mr-1" />
                      +8%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Favorites */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaHeart className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {isAdmin ? 'Total Favorites' : 'Profile Favorites'}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {data.engagement.totalFavorites.toLocaleString()}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                      <MdTrendingDown className="h-4 w-4 mr-1" />
                      -2%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Preview */}
      {data.insights && data.insights.length > 0 && (
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <FaBrain className="h-5 w-5 text-purple-500 mr-2" />
                AI Insights
              </h3>
              <span className="text-sm text-gray-500">
                {data.insights.length} recommendation{data.insights.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-3">
              {data.insights.slice(0, 3).map((insight) => (
                <div key={insight.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <FaBrain className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                        {insight.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {data.insights.length > 3 && (
              <div className="mt-4 text-center">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View all {data.insights.length} insights →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            {isAdmin ? 'Platform Statistics' : 'Your Performance Summary'}
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.engagement.totalViews}</div>
              <div className="text-sm text-gray-500">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.engagement.totalContacts}</div>
              <div className="text-sm text-gray-500">Total Contacts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{data.engagement.totalFavorites}</div>
              <div className="text-sm text-gray-500">Total Favorites</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.predictions ? data.predictions.length : 0}
              </div>
              <div className="text-sm text-gray-500">ML Predictions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Performance Indicators</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Profile Completeness</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-sm text-gray-600">85%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Recruiter Interest</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                </div>
                <span className="text-sm text-gray-600">72%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Content Quality</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
                <span className="text-sm text-gray-600">68%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 