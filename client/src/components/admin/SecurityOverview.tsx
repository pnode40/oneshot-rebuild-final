import React, { useState, useEffect } from 'react';
import { 
  FaShieldAlt, 
  FaUsers, 
  FaExclamationTriangle, 
  FaKey, 
  FaSync,
  FaCheckCircle,
  FaTimesCircle,
  FaClock
} from 'react-icons/fa';
import { 
  MdTrendingUp, 
  MdTrendingDown 
} from 'react-icons/md';

interface SecurityMetrics {
  totalUsers: number;
  activeUsers: number;
  usersWithWeakPasswords: number;
  usersRequiringPasswordReset: number;
  passwordResetStats: {
    totalResetsToday: number;
    totalResetsThisWeek: number;
    totalResetsThisMonth: number;
    suspiciousActivityCount: number;
  };
  authenticationMetrics: {
    totalLoginAttempts: number;
    successfulLogins: number;
    failedLogins: number;
    uniqueActiveUsers: number;
  };
  securityAlerts: Array<{
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
  }>;
  systemSecurityHealth: {
    overallScore: number;
    weakPasswordPercentage: number;
    oldPasswordPercentage: number;
    suspiciousActivityLevel: 'low' | 'medium' | 'high';
  };
}

interface SecurityOverviewProps {
  onRefresh?: () => void;
}

export const SecurityOverview: React.FC<SecurityOverviewProps> = ({ onRefresh }) => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/security-dashboard/metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.status}`);
      }

      const data = await response.json();
      setMetrics(data.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRefresh = () => {
    fetchMetrics();
    onRefresh?.();
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-yellow-600 bg-yellow-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getHealthScoreIcon = (score: number) => {
    if (score >= 90) return FaCheckCircle;
    if (score >= 75) return FaExclamationTriangle;
    return FaTimesCircle;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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
        <span className="ml-2 text-lg text-gray-600">Loading security metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <FaTimesCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Security Metrics</h3>
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

  if (!metrics) {
    return <div>No metrics available</div>;
  }

  const HealthScoreIcon = getHealthScoreIcon(metrics.systemSecurityHealth.overallScore);

  return (
    <div className="space-y-6">
      {/* Header with last updated */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Security Overview</h2>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          {lastUpdated && (
            <div className="flex items-center">
              <FaClock className="h-4 w-4 mr-1" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
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

      {/* System Health Score */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <HealthScoreIcon className={`h-8 w-8 ${getHealthScoreColor(metrics.systemSecurityHealth.overallScore).split(' ')[0]}`} />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">System Security Health</dt>
                <dd className="flex items-baseline">
                  <div className="text-3xl font-semibold text-gray-900">
                    {metrics.systemSecurityHealth.overallScore}/100
                  </div>
                  <div className={`ml-2 flex items-baseline text-sm font-semibold px-2 py-1 rounded-full ${getHealthScoreColor(metrics.systemSecurityHealth.overallScore)}`}>
                    {metrics.systemSecurityHealth.overallScore >= 90 ? 'Excellent' :
                     metrics.systemSecurityHealth.overallScore >= 75 ? 'Good' :
                     metrics.systemSecurityHealth.overallScore >= 60 ? 'Fair' : 'Poor'}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-500">Weak Passwords</div>
              <div className="text-lg font-semibold text-gray-900">
                {metrics.systemSecurityHealth.weakPasswordPercentage.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-500">Old Passwords</div>
              <div className="text-lg font-semibold text-gray-900">
                {metrics.systemSecurityHealth.oldPasswordPercentage.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-500">Threat Level</div>
              <div className={`text-lg font-semibold capitalize ${
                metrics.systemSecurityHealth.suspiciousActivityLevel === 'high' ? 'text-red-600' :
                metrics.systemSecurityHealth.suspiciousActivityLevel === 'medium' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {metrics.systemSecurityHealth.suspiciousActivityLevel}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaUsers className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{metrics.totalUsers.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-green-400"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Users (30d)</dt>
                  <dd className="text-lg font-medium text-gray-900">{metrics.activeUsers.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Users with Weak Passwords */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaKey className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Weak Passwords</dt>
                  <dd className="text-lg font-medium text-gray-900">{metrics.usersWithWeakPasswords.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Password Resets Required */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Reset Required</dt>
                  <dd className="text-lg font-medium text-gray-900">{metrics.usersRequiringPasswordReset.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Activity */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Password Reset Activity</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.passwordResetStats.totalResetsToday}</div>
              <div className="text-sm text-gray-500">Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.passwordResetStats.totalResetsThisWeek}</div>
              <div className="text-sm text-gray-500">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.passwordResetStats.totalResetsThisMonth}</div>
              <div className="text-sm text-gray-500">This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.passwordResetStats.suspiciousActivityCount}</div>
              <div className="text-sm text-gray-500">Suspicious Activity</div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Alerts */}
      {metrics.securityAlerts.length > 0 && (
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Security Alerts</h3>
            <div className="space-y-3">
              {metrics.securityAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="font-medium text-gray-900">{alert.title}</div>
                      <div className="text-sm text-gray-600">{alert.description}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Authentication Metrics */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Authentication Activity</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.authenticationMetrics.successfulLogins}</div>
              <div className="text-sm text-gray-500">Successful Logins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.authenticationMetrics.failedLogins}</div>
              <div className="text-sm text-gray-500">Failed Logins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.authenticationMetrics.totalLoginAttempts > 0 
                  ? ((metrics.authenticationMetrics.successfulLogins / metrics.authenticationMetrics.totalLoginAttempts) * 100).toFixed(1)
                  : 0}%
              </div>
              <div className="text-sm text-gray-500">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 