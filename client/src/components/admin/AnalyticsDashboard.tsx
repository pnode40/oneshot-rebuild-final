import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaUsers, 
  FaBrain, 
  FaLightbulb,
  FaSync,
  FaCog,
  FaDownload,
  FaEye
} from 'react-icons/fa';
import { 
  MdDashboard,
  MdInsights,
  MdTrendingUp,
  MdAutoGraph
} from 'react-icons/md';
import { AnalyticsOverview } from './AnalyticsOverview';
import { AnalyticsInsights } from './AnalyticsInsights';
import { AnalyticsTrends } from './AnalyticsTrends';
import { AnalyticsPredictions } from './index';

interface AnalyticsDashboardProps {
  userRole?: string;
  userId?: number;
}

type TabType = 'overview' | 'insights' | 'predictions' | 'engagement' | 'trends';

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  userRole = 'athlete', 
  userId 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Auto-refresh every 30 seconds for real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const isAdmin = userRole === 'admin';

  const tabs = [
    {
      id: 'overview' as TabType,
      name: 'Overview',
      icon: MdDashboard,
      description: 'Key metrics and performance summary'
    },
    {
      id: 'insights' as TabType,
      name: 'AI Insights',
      icon: FaBrain,
      description: 'ML-powered recommendations and analysis'
    },
    {
      id: 'predictions' as TabType,
      name: 'Predictions',
      icon: MdAutoGraph,
      description: 'Engagement forecasts and optimization'
    },
    {
      id: 'engagement' as TabType,
      name: 'Engagement',
      icon: FaEye,
      description: 'Profile views, contacts, and interactions'
    },
    {
      id: 'trends' as TabType,
      name: 'Trends',
      icon: MdTrendingUp,
      description: 'Historical data and trend analysis'
    }
  ];

  const handleRefresh = () => {
    setLoading(true);
    setLastUpdated(new Date());
    // Trigger refresh in child components
    setTimeout(() => setLoading(false), 1000);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting analytics data...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FaChartLine className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  {isAdmin ? 'System Analytics' : 'My Analytics'}
                </h1>
              </div>
              {lastUpdated && (
                <div className="text-sm text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <FaSync className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              {isAdmin && (
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaDownload className="h-4 w-4 mr-2" />
                  Export
                </button>
              )}
              
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <FaCog className="h-4 w-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    className={`mr-2 h-5 w-5 ${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Description */}
        <div className="mb-6">
          <p className="text-gray-600">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <AnalyticsOverview 
              userRole={userRole} 
              userId={userId} 
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'insights' && (
            <AnalyticsInsights 
              userRole={userRole} 
              userId={userId} 
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'predictions' && (
            <AnalyticsPredictions />
          )}

          {activeTab === 'engagement' && (
            <div className="space-y-6">
              {/* Engagement content */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-12">
                  <FaEye className="mx-auto h-12 w-12 text-blue-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Engagement Analytics</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Profile views, recruiter contacts, and interaction metrics
                  </p>
                  <div className="mt-6">
                    <div className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600">
                      <FaEye className="h-4 w-4 mr-2" />
                      Loading engagement data...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <AnalyticsTrends 
              userRole={userRole} 
              userId={userId} 
              onRefresh={handleRefresh}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>OneShot Analytics Dashboard</span>
              <span>•</span>
              <span>Powered by Machine Learning</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaLightbulb className="h-4 w-4" />
              <span>AI-Enhanced Insights</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 