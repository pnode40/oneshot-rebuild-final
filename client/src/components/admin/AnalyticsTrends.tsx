import React, { useState, useEffect } from 'react';
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
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  FaChartLine, 
  FaSync,
  FaCalendarAlt,
  FaDownload,
  FaExpand,
  FaEye,
  FaEnvelope,
  FaHeart
} from 'react-icons/fa';
import { 
  MdDateRange,
  MdTrendingUp,
  MdTrendingDown,
  MdTrendingFlat
} from 'react-icons/md';

// Register Chart.js components
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

interface TrendData {
  engagement: {
    history: Array<{
      date: string;
      views: number;
      contacts: number;
      favorites: number;
      engagementScore: number;
    }>;
  };
  performance: {
    monthly: Array<{
      month: string;
      profileViews: number;
      recruiterContacts: number;
      conversionRate: number;
    }>;
  };
  demographics: {
    viewsByRegion: Array<{ region: string; count: number }>;
    viewsBySport: Array<{ sport: string; count: number }>;
    recruiterTypes: Array<{ type: string; count: number }>;
  };
}

interface AnalyticsTrendsProps {
  userRole?: string;
  userId?: number;
  onRefresh?: () => void;
}

export const AnalyticsTrends: React.FC<AnalyticsTrendsProps> = ({ 
  userRole = 'athlete', 
  userId,
  onRefresh 
}) => {
  const [data, setData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedChart, setSelectedChart] = useState<'engagement' | 'performance' | 'demographics'>('engagement');

  const fetchTrendData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/analytics/trends?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch trend data: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trend data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendData();
  }, [timeRange, userId]);

  const handleRefresh = () => {
    fetchTrendData();
    onRefresh?.();
  };

  const handleExport = () => {
    // TODO: Implement chart export functionality
    console.log('Exporting chart data...');
  };

  // Chart configurations
  const engagementChartData = data ? {
    labels: data.engagement.history.map(item => 
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Profile Views',
        data: data.engagement.history.map(item => item.views),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Recruiter Contacts',
        data: data.engagement.history.map(item => item.contacts),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Favorites',
        data: data.engagement.history.map(item => item.favorites),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  } : null;

  const engagementScoreChartData = data ? {
    labels: data.engagement.history.map(item => 
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Engagement Score',
        data: data.engagement.history.map(item => item.engagementScore),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      },
    ],
  } : null;

  const performanceChartData = data ? {
    labels: data.performance.monthly.map(item => item.month),
    datasets: [
      {
        label: 'Profile Views',
        data: data.performance.monthly.map(item => item.profileViews),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Recruiter Contacts',
        data: data.performance.monthly.map(item => item.recruiterContacts),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  } : null;

  const demographicsChartData = data ? {
    labels: data.demographics.viewsByRegion.map(item => item.region),
    datasets: [
      {
        data: data.demographics.viewsByRegion.map(item => item.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
          'rgb(147, 51, 234)',
          'rgb(236, 72, 153)',
        ],
        borderWidth: 2,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSync className="h-8 w-8 animate-spin text-orange-600" />
        <span className="ml-2 text-lg text-gray-600">Loading trend analysis...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Trends</h3>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FaChartLine className="h-8 w-8 text-orange-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Trend Analysis</h2>
            <p className="text-sm text-gray-600">
              Historical performance and data visualization
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="flex items-center text-orange-600 hover:text-orange-800"
          >
            <FaSync className="h-4 w-4 mr-1" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
          >
            <FaDownload className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Time Range:</span>
          <div className="flex space-x-2">
            {[
              { key: '7d', label: '7 Days' },
              { key: '30d', label: '30 Days' },
              { key: '90d', label: '90 Days' },
              { key: '1y', label: '1 Year' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTimeRange(key as any)}
                className={`px-3 py-1 text-sm rounded-md ${
                  timeRange === key
                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">View:</span>
          <div className="flex space-x-2">
            {[
              { key: 'engagement', label: 'Engagement', icon: FaEye },
              { key: 'performance', label: 'Performance', icon: FaChartLine },
              { key: 'demographics', label: 'Demographics', icon: FaChartLine }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedChart(key as any)}
                className={`inline-flex items-center px-3 py-1 text-sm rounded-md ${
                  selectedChart === key
                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-3 w-3 mr-1" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      {selectedChart === 'engagement' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Engagement Metrics Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Engagement Metrics</h3>
              <FaExpand className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="h-80">
              {engagementChartData && (
                <Line data={engagementChartData} options={chartOptions} />
              )}
            </div>
          </div>

          {/* Engagement Score Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Engagement Score Trend</h3>
              <FaExpand className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="h-80">
              {engagementScoreChartData && (
                <Line data={engagementScoreChartData} options={chartOptions} />
              )}
            </div>
          </div>
        </div>
      )}

      {selectedChart === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Monthly Performance</h3>
              <FaExpand className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="h-80">
              {performanceChartData && (
                <Bar data={performanceChartData} options={chartOptions} />
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Summary</h3>
            <div className="space-y-4">
              {data?.performance.monthly.slice(-3).map((month, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{month.month}</div>
                    <div className="text-sm text-gray-600">
                      {month.profileViews} views • {month.recruiterContacts} contacts
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {(month.conversionRate * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">conversion</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedChart === 'demographics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Views by Region */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Views by Region</h3>
              <FaExpand className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="h-80">
              {demographicsChartData && (
                <Doughnut data={demographicsChartData} options={doughnutOptions} />
              )}
            </div>
          </div>

          {/* Demographics Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Demographics Breakdown</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Top Sports</h4>
                <div className="space-y-2">
                  {data?.demographics.viewsBySport.slice(0, 5).map((sport, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{sport.sport}</span>
                      <span className="text-sm font-medium text-gray-600">{sport.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recruiter Types</h4>
                <div className="space-y-2">
                  {data?.demographics.recruiterTypes.slice(0, 5).map((type, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{type.type}</span>
                      <span className="text-sm font-medium text-gray-600">{type.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {data && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Trend Summary</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <FaEye className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {data.engagement.history.reduce((sum, item) => sum + item.views, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Views ({timeRange})</div>
              <div className="flex items-center justify-center mt-1 text-sm">
                <MdTrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+15.3%</span>
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <FaEnvelope className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {data.engagement.history.reduce((sum, item) => sum + item.contacts, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Contacts ({timeRange})</div>
              <div className="flex items-center justify-center mt-1 text-sm">
                <MdTrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+8.7%</span>
              </div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <FaHeart className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">
                {data.engagement.history.reduce((sum, item) => sum + item.favorites, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Favorites ({timeRange})</div>
              <div className="flex items-center justify-center mt-1 text-sm">
                <MdTrendingDown className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-600">-2.1%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 