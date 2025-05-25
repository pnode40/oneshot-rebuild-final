import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaSync,
  FaTimesCircle
} from 'react-icons/fa';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';

interface TrendData {
  date: string;
  passwordResets: number;
  failedLogins: number;
  suspiciousActivity: number;
  newUsers: number;
}

interface SecurityTrendsProps {
  // No props needed for this component
}

export const SecurityTrends: React.FC<SecurityTrendsProps> = () => {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('7d');

  const fetchTrends = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/security-dashboard/trends?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch trends: ${response.status}`);
      }

      const data = await response.json();
      setTrends(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trends');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, [timeRange]);

  const handleRefresh = () => {
    fetchTrends();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSync className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg text-gray-600">Loading security trends...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <FaTimesCircle className="h-5 w-5 text-red-400" />
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
        <h2 className="text-2xl font-bold text-gray-900">Security Trends & Analytics</h2>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={handleRefresh}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaSync className="h-4 w-4 mr-1" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaChartLine className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Trend Score</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">85</div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <MdTrendingUp className="self-center flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="sr-only">Increased by</span>
                      12%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaChartLine className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Security Events</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">247</div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                      <MdTrendingUp className="self-center flex-shrink-0 h-5 w-5 text-red-500" />
                      <span className="sr-only">Increased by</span>
                      8%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaChartLine className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Failed Logins</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">89</div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <MdTrendingDown className="self-center flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="sr-only">Decreased by</span>
                      15%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaChartLine className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Password Resets</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">34</div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <MdTrendingDown className="self-center flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="sr-only">Decreased by</span>
                      3%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Security Events Over Time</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <FaChartLine className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Chart Coming Soon</h3>
              <p className="mt-1 text-sm text-gray-500">Advanced charting integration will be added in future updates.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Key Insights</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <MdTrendingUp className="h-5 w-5 text-green-400 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Security posture improving</p>
                <p className="text-sm text-gray-500">Overall security health has increased by 12% over the selected period.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <MdTrendingDown className="h-5 w-5 text-green-400 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Failed login attempts decreasing</p>
                <p className="text-sm text-gray-500">15% reduction in failed login attempts suggests improved user awareness.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <MdTrendingUp className="h-5 w-5 text-yellow-400 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Security events require attention</p>
                <p className="text-sm text-gray-500">8% increase in security events warrants investigation into potential threats.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 