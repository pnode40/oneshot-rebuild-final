import React, { useState, useEffect } from 'react';
import { 
  FaExclamationTriangle, 
  FaSync,
  FaTimesCircle,
  FaBell,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
  userId?: string;
  metadata?: Record<string, any>;
}

interface SecurityAlertsProps {
  onRefresh?: () => void;
}

export const SecurityAlerts: React.FC<SecurityAlertsProps> = ({ onRefresh }) => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for demonstration
      const mockAlerts: SecurityAlert[] = [
        {
          id: '1',
          type: 'suspicious_login',
          severity: 'high',
          title: 'Suspicious Login Activity',
          description: 'Multiple failed login attempts detected from IP 203.0.113.42',
          timestamp: new Date().toISOString(),
          acknowledged: false,
          metadata: { ipAddress: '203.0.113.42', attempts: 15 }
        },
        {
          id: '2',
          type: 'weak_password',
          severity: 'medium',
          title: 'Weak Password Detected',
          description: '5 users are using passwords that do not meet current security standards',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          acknowledged: false,
          metadata: { userCount: 5 }
        },
        {
          id: '3',
          type: 'account_lockout',
          severity: 'low',
          title: 'Account Lockout',
          description: 'User account locked due to multiple failed login attempts',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          acknowledged: true,
          userId: 'user123'
        }
      ];
      
      setAlerts(mockAlerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleRefresh = () => {
    fetchAlerts();
    onRefresh?.();
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      // Mock acknowledge action
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
    } catch (err) {
      setError('Failed to acknowledge alert');
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      // Mock dismiss action
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (err) {
      setError('Failed to dismiss alert');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <FaTimesCircle className="h-5 w-5 text-red-500" />;
      case 'high': return <FaExclamationTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium': return <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />;
      case 'low': return <FaBell className="h-5 w-5 text-blue-500" />;
      default: return <FaBell className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSync className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg text-gray-600">Loading security alerts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <FaTimesCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Alerts</h3>
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

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const acknowledgedAlerts = alerts.filter(alert => alert.acknowledged);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security Alerts</h2>
          <p className="text-sm text-gray-500 mt-1">
            {unacknowledgedAlerts.length} unacknowledged alerts
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaSync className="h-4 w-4 mr-1" />
          Refresh
        </button>
      </div>

      {/* Unacknowledged Alerts */}
      {unacknowledgedAlerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Unacknowledged Alerts</h3>
          {unacknowledgedAlerts.map((alert) => (
            <div key={alert.id} className={`border-l-4 rounded-lg p-4 ${getSeverityColor(alert.severity)}`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">{alert.title}</h3>
                      <p className="text-sm mt-1">{alert.description}</p>
                      <p className="text-xs mt-2 opacity-75">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <FaCheck className="h-3 w-3 mr-1" />
                        Acknowledge
                      </button>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <FaTimes className="h-3 w-3 mr-1" />
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Acknowledged Alerts */}
      {acknowledgedAlerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Acknowledged Alerts</h3>
          {acknowledgedAlerts.map((alert) => (
            <div key={alert.id} className="bg-gray-50 border rounded-lg p-4 opacity-75">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaCheck className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{alert.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(alert.timestamp).toLocaleString()} • Acknowledged
                      </p>
                    </div>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {alerts.length === 0 && (
        <div className="text-center py-12">
          <FaBell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No security alerts</h3>
          <p className="mt-1 text-sm text-gray-500">All systems are operating normally.</p>
        </div>
      )}
    </div>
  );
}; 