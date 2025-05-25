import React, { useState, useEffect } from 'react';
import { 
  FaList, 
  FaSync,
  FaTimesCircle,
  FaFilter,
  FaSearch
} from 'react-icons/fa';

interface ActivityLogEntry {
  id: string;
  timestamp: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user: string;
  description: string;
  ipAddress: string;
  userAgent: string;
}

interface SecurityActivityLogProps {
  // No props needed
}

export const SecurityActivityLog: React.FC<SecurityActivityLogProps> = () => {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/security-dashboard/activity-log', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch activity log: ${response.status}`);
      }

      const data = await response.json();
      setActivities(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

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
        <span className="ml-2 text-lg text-gray-600">Loading activity log...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <FaTimesCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Activity Log</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={fetchActivities}
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
        <h2 className="text-2xl font-bold text-gray-900">Security Activity Log</h2>
        <button
          onClick={fetchActivities}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaSync className="h-4 w-4 mr-1" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search activities..."
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Types</option>
            <option value="login">Login Events</option>
            <option value="password">Password Events</option>
            <option value="security">Security Events</option>
          </select>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {/* Mock data for demonstration */}
          {[
            {
              id: '1',
              timestamp: new Date().toISOString(),
              type: 'login_failure',
              severity: 'medium' as const,
              user: 'john.doe@example.com',
              description: 'Failed login attempt with incorrect password',
              ipAddress: '192.168.1.100',
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            {
              id: '2',
              timestamp: new Date(Date.now() - 300000).toISOString(),
              type: 'password_reset',
              severity: 'low' as const,
              user: 'jane.smith@example.com',
              description: 'Password reset completed successfully',
              ipAddress: '192.168.1.101',
              userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            },
            {
              id: '3',
              timestamp: new Date(Date.now() - 600000).toISOString(),
              type: 'suspicious_activity',
              severity: 'high' as const,
              user: 'admin@example.com',
              description: 'Multiple failed login attempts from new location',
              ipAddress: '203.0.113.42',
              userAgent: 'curl/7.68.0'
            }
          ].map((activity) => (
            <li key={activity.id} className="px-4 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(activity.severity)}`}>
                      {activity.severity}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      User: {activity.user} | IP: {activity.ipAddress}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {activity.type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        <div className="bg-gray-50 px-4 py-3 text-center">
          <p className="text-sm text-gray-500">Real-time activity log integration coming soon</p>
        </div>
      </div>
    </div>
  );
}; 