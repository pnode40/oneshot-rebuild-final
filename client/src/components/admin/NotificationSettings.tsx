import React, { useState, useEffect } from 'react';
import { FaBell, FaEnvelope, FaSms, FaMobile, FaSlack, FaCog, FaClock, FaExclamationTriangle, FaCheck, FaTimes } from 'react-icons/fa';

interface NotificationPreferences {
  userId: string;
  email?: string;
  phone?: string;
  pushSubscription?: any;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    slack: boolean;
  };
  severityThreshold: 'low' | 'medium' | 'high' | 'critical';
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  escalationRules?: {
    enabled: boolean;
    escalateAfterMinutes: number;
    escalateToChannels: ('email' | 'sms' | 'push' | 'slack')[];
  };
}

interface ChannelStatus {
  email: { configured: boolean; service: string };
  sms: { configured: boolean; service: string };
  push: { configured: boolean; service: string };
  slack: { configured: boolean; service: string };
}

export const NotificationSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [channelStatus, setChannelStatus] = useState<ChannelStatus | null>(null);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [testingNotifications, setTestingNotifications] = useState(false);

  useEffect(() => {
    checkPushNotificationSupport();
    loadNotificationPreferences();
    loadChannelStatus();
  }, []);

  const checkPushNotificationSupport = () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true);
      checkPushSubscription();
    }
  };

  const checkPushSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setPushSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking push subscription:', error);
    }
  };

  const loadNotificationPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load notification preferences');
      }

      const result = await response.json();
      if (result.success) {
        setPreferences(result.data);
      }
    } catch (err) {
      console.error('Error loading notification preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    }
  };

  const loadChannelStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/channels/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load channel status');
      }

      const result = await response.json();
      if (result.success) {
        setChannelStatus(result.data);
      }
    } catch (err) {
      console.error('Error loading channel status:', err);
      // Don't show error for channel status as it's not critical
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to save notification preferences');
      }

      const result = await response.json();
      if (result.success) {
        setSuccess('Notification preferences saved successfully');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Error saving notification preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const enablePushNotifications = async () => {
    if (!pushSupported) {
      setError('Push notifications are not supported in this browser');
      return;
    }

    try {
      // Get VAPID public key
      const vapidResponse = await fetch('/api/notifications/vapid-public-key');
      const vapidResult = await vapidResponse.json();
      
      if (!vapidResult.success) {
        throw new Error('Push notifications not configured on server');
      }

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Subscribe to push notifications
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidResult.data.publicKey,
      });

      // Send subscription to server
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/push-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!response.ok) {
        throw new Error('Failed to register push subscription');
      }

      setPushSubscribed(true);
      setSuccess('Push notifications enabled successfully');
      setTimeout(() => setSuccess(null), 3000);

      // Update preferences to enable push notifications
      if (preferences) {
        setPreferences({
          ...preferences,
          channels: { ...preferences.channels, push: true }
        });
      }

    } catch (err) {
      console.error('Error enabling push notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to enable push notifications');
    }
  };

  const disablePushNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove subscription from server
      const token = localStorage.getItem('token');
      await fetch('/api/notifications/push-subscription', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setPushSubscribed(false);
      setSuccess('Push notifications disabled successfully');
      setTimeout(() => setSuccess(null), 3000);

      // Update preferences to disable push notifications
      if (preferences) {
        setPreferences({
          ...preferences,
          channels: { ...preferences.channels, push: false }
        });
      }

    } catch (err) {
      console.error('Error disabling push notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to disable push notifications');
    }
  };

  const testNotifications = async () => {
    if (!preferences) return;

    setTestingNotifications(true);
    try {
      const activeChannels = Object.entries(preferences.channels)
        .filter(([_, enabled]) => enabled)
        .map(([channel, _]) => channel);

      if (activeChannels.length === 0) {
        setError('No notification channels are enabled');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channels: activeChannels,
          severity: 'medium'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send test notifications');
      }

      setSuccess('Test notifications sent successfully');
      setTimeout(() => setSuccess(null), 5000);

    } catch (err) {
      console.error('Error sending test notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to send test notifications');
    } finally {
      setTestingNotifications(false);
    }
  };

  const updatePreferences = (updates: Partial<NotificationPreferences>) => {
    if (preferences) {
      setPreferences({ ...preferences, ...updates });
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <FaEnvelope className="h-4 w-4" />;
      case 'sms': return <FaSms className="h-4 w-4" />;
      case 'push': return <FaMobile className="h-4 w-4" />;
      case 'slack': return <FaSlack className="h-4 w-4" />;
      default: return <FaBell className="h-4 w-4" />;
    }
  };

  const getChannelStatus = (channel: string) => {
    if (!channelStatus) return null;
    const status = channelStatus[channel as keyof ChannelStatus];
    return status?.configured ? (
      <FaCheck className="h-4 w-4 text-green-500" title={`Configured (${status.service})`} />
    ) : (
      <FaTimes className="h-4 w-4 text-red-500" title="Not configured" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800">Failed to Load Preferences</h3>
        <p className="mt-2 text-red-700">Unable to load notification preferences</p>
        <button
          onClick={loadNotificationPreferences}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaBell className="mr-3 text-blue-600" />
            Notification Settings
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={testNotifications}
              disabled={testingNotifications}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                testingNotifications
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {testingNotifications ? 'Testing...' : 'Test Notifications'}
            </button>
            <button
              onClick={savePreferences}
              disabled={saving}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                saving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <FaCheck className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      {/* Notification Channels */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Channels</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(preferences.channels).map(([channel, enabled]) => (
            <div key={channel} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                {getChannelIcon(channel)}
                <div>
                  <div className="font-medium text-gray-900 capitalize">{channel}</div>
                  <div className="text-sm text-gray-500">
                    {channel === 'email' && 'Email notifications'}
                    {channel === 'sms' && 'SMS text messages'}
                    {channel === 'push' && 'Browser push notifications'}
                    {channel === 'slack' && 'Slack workspace notifications'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {getChannelStatus(channel)}
                
                {channel === 'push' ? (
                  pushSupported ? (
                    pushSubscribed ? (
                      <button
                        onClick={disablePushNotifications}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        Disable
                      </button>
                    ) : (
                      <button
                        onClick={enablePushNotifications}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        Enable
                      </button>
                    )
                  ) : (
                    <span className="text-sm text-gray-500">Not supported</span>
                  )
                ) : (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => updatePreferences({
                        channels: { ...preferences.channels, [channel]: e.target.checked }
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={preferences.email || ''}
              onChange={(e) => updatePreferences({ email: e.target.value })}
              placeholder="your.email@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={preferences.phone || ''}
              onChange={(e) => updatePreferences({ phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Severity Threshold */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Threshold</h3>
        <p className="text-sm text-gray-600 mb-4">
          Only receive notifications for alerts at or above this severity level
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['low', 'medium', 'high', 'critical'] as const).map((severity) => (
            <label key={severity} className="flex items-center">
              <input
                type="radio"
                name="severity"
                value={severity}
                checked={preferences.severityThreshold === severity}
                onChange={(e) => updatePreferences({ severityThreshold: e.target.value as any })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className={`ml-2 text-sm font-medium capitalize ${
                severity === 'critical' ? 'text-red-600' :
                severity === 'high' ? 'text-orange-600' :
                severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {severity}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FaClock className="mr-2 text-gray-600" />
          Quiet Hours
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.quietHours?.enabled || false}
              onChange={(e) => updatePreferences({
                quietHours: {
                  enabled: e.target.checked,
                  start: preferences.quietHours?.start || '22:00',
                  end: preferences.quietHours?.end || '08:00',
                  timezone: preferences.quietHours?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
                }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Enable quiet hours</span>
          </label>
          
          {preferences.quietHours?.enabled && (
            <div className="grid grid-cols-2 gap-4 ml-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={preferences.quietHours.start}
                  onChange={(e) => updatePreferences({
                    quietHours: { ...preferences.quietHours!, start: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={preferences.quietHours.end}
                  onChange={(e) => updatePreferences({
                    quietHours: { ...preferences.quietHours!, end: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-500">
            During quiet hours, only critical notifications will be sent
          </p>
        </div>
      </div>

      {/* Escalation Rules */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FaExclamationTriangle className="mr-2 text-orange-600" />
          Escalation Rules
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.escalationRules?.enabled || false}
              onChange={(e) => updatePreferences({
                escalationRules: {
                  enabled: e.target.checked,
                  escalateAfterMinutes: preferences.escalationRules?.escalateAfterMinutes || 30,
                  escalateToChannels: preferences.escalationRules?.escalateToChannels || ['email', 'sms']
                }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Enable escalation for unacknowledged alerts</span>
          </label>
          
          {preferences.escalationRules?.enabled && (
            <div className="ml-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Escalate after (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={preferences.escalationRules.escalateAfterMinutes}
                  onChange={(e) => updatePreferences({
                    escalationRules: {
                      ...preferences.escalationRules!,
                      escalateAfterMinutes: parseInt(e.target.value)
                    }
                  })}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-500">
            Escalation sends additional notifications if critical alerts aren't acknowledged
          </p>
        </div>
      </div>
    </div>
  );
}; 