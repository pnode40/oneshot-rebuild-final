import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaUsers, FaChartLine, FaBell, FaHistory, FaDownload, FaWifi, FaExclamationTriangle } from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';
import { SecurityOverview } from './admin/SecurityOverview';
import { UserSecurityManager } from './admin/UserSecurityManager';
import { SecurityTrends } from './admin/SecurityTrends';
import { SecurityActivityLog } from './admin/SecurityActivityLog';
import { SecurityAlerts } from './admin/SecurityAlerts';
import { SecurityExport } from './admin/SecurityExport';
import useSecurityWebSocket from '../hooks/useSecurityWebSocket';

interface SecurityDashboardProps {
  onClose?: () => void;
}

const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Initialize WebSocket connection for real-time monitoring
  const {
    connected,
    connecting,
    error: wsError,
    securityMetrics,
    recentActivity,
    liveAlerts,
    notifications,
    acknowledgeAlert,
    clearNotifications,
    reconnect,
    connectedAdmins,
    eventsLastHour
  } = useSecurityWebSocket();

  const tabs = [
    { id: 'overview', label: 'Security Overview', icon: FaShieldAlt },
    { id: 'users', label: 'User Management', icon: FaUsers },
    { id: 'trends', label: 'Security Trends', icon: FaChartLine },
    { id: 'activity', label: 'Activity Log', icon: FaHistory },
    { id: 'alerts', label: 'Security Alerts', icon: FaBell },
    { id: 'export', label: 'Export & Reports', icon: FaDownload }
  ];

  // Auto-refresh fallback every 30 seconds for non-real-time components
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getConnectionStatusColor = () => {
    if (connected) return 'text-green-500';
    if (connecting) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConnectionStatusText = () => {
    if (connected) return 'Real-time monitoring active';
    if (connecting) return 'Connecting to real-time monitoring...';
    return 'Real-time monitoring disconnected';
  };

  const renderTabContent = () => {
    const commonProps = {
      refreshKey,
      realTimeData: {
        connected,
        securityMetrics,
        recentActivity,
        liveAlerts,
        acknowledgeAlert
      }
    };

    switch (activeTab) {
      case 'overview':
        return <SecurityOverview {...commonProps} />;
      case 'users':
        return <UserSecurityManager {...commonProps} />;
      case 'trends':
        return <SecurityTrends {...commonProps} />;
      case 'activity':
        return <SecurityActivityLog {...commonProps} />;
      case 'alerts':
        return <SecurityAlerts {...commonProps} />;
      case 'export':
        return <SecurityExport {...commonProps} />;
      default:
        return <SecurityOverview {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <MdSecurity className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Security Dashboard</h1>
                <div className="flex items-center space-x-2 text-sm">
                  {connected ? (
                    <FaWifi className={getConnectionStatusColor()} />
                  ) : (
                    <FaExclamationTriangle className={getConnectionStatusColor()} />
                  )}
                  <span className={getConnectionStatusColor()}>
                    {getConnectionStatusText()}
                  </span>
                  {connected && (
                    <span className="text-gray-500">
                      • {connectedAdmins} admin{connectedAdmins !== 1 ? 's' : ''} online
                      • {eventsLastHour} events/hour
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Real-time notifications */}
              {notifications.length > 0 && (
                <div className="relative">
                  <button
                    onClick={clearNotifications}
                    className="relative p-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    title={`${notifications.length} new security notification${notifications.length !== 1 ? 's' : ''}`}
                  >
                    <FaBell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  </button>
                </div>
              )}

              {/* Connection error indicator */}
              {wsError && (
                <button
                  onClick={reconnect}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  title={`WebSocket Error: ${wsError}`}
                >
                  Reconnect
                </button>
              )}

              {/* Refresh button */}
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>Refresh</span>
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time notifications banner */}
      {notifications.length > 0 && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaBell className="h-4 w-4 text-red-600" />
                <span className="text-red-800 font-medium">
                  {notifications.length} new security notification{notifications.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={clearNotifications}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Clear All
              </button>
            </div>
            <div className="mt-2 space-y-1">
              {notifications.slice(0, 3).map((notification, index) => (
                <div key={index} className="text-sm text-red-700">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium mr-2 ${
                    notification.severity === 'critical' ? 'bg-red-200 text-red-800' :
                    notification.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                    'bg-yellow-200 text-yellow-800'
                  }`}>
                    {notification.severity.toUpperCase()}
                  </span>
                  {notification.message}
                  <span className="text-red-500 ml-2">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {notifications.length > 3 && (
                <div className="text-sm text-red-600">
                  +{notifications.length - 3} more notifications
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {/* Show live indicator for alerts tab */}
                  {tab.id === 'alerts' && liveAlerts.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                      {liveAlerts.filter(alert => !alert.acknowledged).length}
                    </span>
                  )}
                  {/* Show live indicator for activity tab */}
                  {tab.id === 'activity' && connected && recentActivity && recentActivity.events.length > 0 && (
                    <span className="ml-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SecurityDashboard; 