import React, { useState, useEffect } from 'react';
import { 
  FaShieldAlt, 
  FaUsers, 
  FaExclamationTriangle, 
  FaDownload, 
  FaCog,
  FaSync,
  FaList,
  FaChartLine,
  FaBell,
  FaFileExport,
  FaClock,
  FaWifi,
  FaTimes,
  FaSignal,
  FaBrain
} from 'react-icons/fa';
import { 
  MdTrendingUp
} from 'react-icons/md';
import { SecurityOverview } from './SecurityOverview';
import { UserSecurityManager } from './UserSecurityManager';
import { SecurityTrends } from './SecurityTrends';
import { SecurityActivityLog } from './SecurityActivityLog';
import { SecurityAlerts } from './SecurityAlerts';
import { SecurityExport } from './SecurityExport';
import { AISecurityIntelligence } from './AISecurityIntelligence';
import { NotificationSettings } from './NotificationSettings';
import { useSecurityWebSocket } from '../../hooks/useSecurityWebSocket';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
}

/**
 * Main Security Dashboard Component
 * Provides comprehensive security management interface for administrators
 */
export const SecurityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Real-time WebSocket connection
  const webSocketData = useSecurityWebSocket();
  const connected = webSocketData?.connected || false;
  const securityMetrics = webSocketData?.securityMetrics || null;
  const recentAlerts = webSocketData?.recentAlerts || [];
  const recentActivity = webSocketData?.recentActivity || [];
  const wsError = webSocketData?.error || null;

  // Force refresh all components
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Tab configuration
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: FaShieldAlt,
      description: 'Security metrics and system health'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: FaUsers,
      description: 'User security status and risk assessment'
    },
    {
      id: 'trends',
      label: 'Trends & Analytics',
      icon: FaChartLine,
      description: 'Security trends and pattern analysis'
    },
    {
      id: 'activity',
      label: 'Activity Log',
      icon: FaClock,
      description: 'Security events and audit trail'
    },
    {
      id: 'alerts',
      label: 'Security Alerts',
      icon: FaBell,
      description: 'Active security alerts and notifications'
    },
    {
      id: 'ai-intelligence',
      label: 'AI Intelligence',
      icon: FaBrain,
      description: 'AI-driven security intelligence and predictive analysis'
    },
    {
      id: 'export',
      label: 'Export & Reports',
      icon: FaFileExport,
      description: 'Data export and security reporting'
    },
    {
      id: 'notification-settings',
      label: 'Notification Settings',
      icon: FaCog,
      description: 'Manage notification settings'
    }
  ];

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'overview' || activeTab === 'activity') {
        handleRefresh();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    // Add notification for WebSocket connection status changes
    if (connected) {
      addNotification('Real-time security monitoring connected', 'success');
    } else if (wsError) {
      addNotification('Real-time monitoring disconnected', 'warning');
    }
  }, [connected, wsError]);

  // Add notifications for new alerts
  useEffect(() => {
    if (recentAlerts && recentAlerts.length > 0) {
      const latestAlert = recentAlerts[0];
      if (latestAlert.severity === 'critical') {
        addNotification(`Critical Security Alert: ${latestAlert.title}`, 'error');
      } else if (latestAlert.severity === 'high') {
        addNotification(`High Priority Alert: ${latestAlert.title}`, 'warning');
      }
    }
  }, [recentAlerts]);

  const addNotification = (message: string, type: Notification['type']) => {
    const notification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5 notifications
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const getConnectionStatusIcon = () => {
    if (!connected) return <FaTimes className="text-red-500" />;
    return <FaWifi className="text-green-500" />;
  };

  const getConnectionStatusText = () => {
    if (!connected) return 'Disconnected';
    return 'Connected';
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-100 border-green-200 text-green-800';
      case 'error': return 'bg-red-100 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-100 border-blue-200 text-blue-800';
      default: return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const renderActiveComponent = () => {
    const commonProps = { key: refreshKey };

    switch (activeTab) {
      case 'overview':
        return <SecurityOverview 
          realtimeMetrics={securityMetrics} 
          realtimeAlerts={recentAlerts} 
          autoRefresh={autoRefresh} 
        />;
      case 'users':
        return <UserSecurityManager {...commonProps} onRefresh={handleRefresh} />;
      case 'trends':
        return <SecurityTrends realtimeMetrics={securityMetrics} />;
      case 'activity':
        return <SecurityActivityLog realtimeActivity={recentActivity} />;
      case 'alerts':
        return <SecurityAlerts realtimeAlerts={recentAlerts} />;
      case 'ai-intelligence':
        return <AISecurityIntelligence />;
      case 'export':
        return <SecurityExport {...commonProps} />;
      case 'notification-settings':
        return <NotificationSettings />;
      default:
        return <SecurityOverview 
          realtimeMetrics={securityMetrics} 
          realtimeAlerts={recentAlerts} 
          autoRefresh={autoRefresh} 
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <FaShieldAlt className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>
                <p className="text-sm text-gray-500">Comprehensive security monitoring and management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Connection Status */}
              <div className="flex items-center space-x-2 text-sm">
                {getConnectionStatusIcon()}
                <span className={`font-medium ${
                  connected ? 'text-green-600' : 'text-red-600'
                }`}>
                  {getConnectionStatusText()}
                </span>
              </div>
              
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaSync className="h-4 w-4 mr-2" />
                Refresh
              </button>
              
              <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <FaCog className="h-4 w-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Notifications */}
      {notifications.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-lg p-3 ${getNotificationColor(notification.type)} animate-fade-in`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{notification.message}</span>
                  <span className="text-xs">
                    {notification.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WebSocket Connection Error */}
      {wsError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <FaExclamationTriangle className="h-5 w-5 text-red-400 mr-2" />
              <h3 className="text-sm font-medium text-red-800">Real-time Connection Issue</h3>
            </div>
            <p className="mt-1 text-sm text-red-700">{wsError}</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`mr-2 h-5 w-5 ${
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  <span>{tab.label}</span>
                  {/* Special indicator for AI Intelligence tab */}
                  {tab.id === 'ai-intelligence' && (
                    <div className="ml-2 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  )}
                  {/* Alert count for alerts tab */}
                  {tab.id === 'alerts' && recentAlerts && recentAlerts.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {recentAlerts.length > 9 ? '9+' : recentAlerts.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Description */}
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-sm text-blue-700">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveComponent()}
      </div>

      {/* Auto-refresh indicator */}
      {(activeTab === 'overview' || activeTab === 'activity') && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-medium">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Auto-refresh active</span>
          </div>
        </div>
      )}
    </div>
  );
}; 