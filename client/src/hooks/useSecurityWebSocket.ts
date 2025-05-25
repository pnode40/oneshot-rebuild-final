import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'password_reset' | 'security_alert' | 'user_action' | 'system_metric';
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: any;
  timestamp: Date;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

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
  securityAlerts: any[];
  systemSecurityHealth: {
    overallScore: number;
    weakPasswordPercentage: number;
    oldPasswordPercentage: number;
    suspiciousActivityLevel: 'low' | 'medium' | 'high';
  };
  timestamp?: Date;
}

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  acknowledged: boolean;
  userId?: number;
  metadata?: any;
}

interface UserActivity {
  events: Array<{
    id: string;
    type: string;
    severity: string;
    description: string;
    timestamp: Date;
    user: string;
    ipAddress?: string;
  }>;
  totalCount: number;
  timestamp: Date;
}

interface SecurityNotification {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
}

interface UseSecurityWebSocketReturn {
  // Connection state
  connected: boolean;
  connecting: boolean;
  error: string | null;
  
  // Real-time data
  securityMetrics: SecurityMetrics | null;
  recentActivity: UserActivity | null;
  liveAlerts: SecurityAlert[];
  notifications: SecurityNotification[];
  
  // Actions
  subscribeToMetrics: () => void;
  subscribeToActivity: () => void;
  subscribeToAlerts: () => void;
  acknowledgeAlert: (alertId: string) => void;
  clearNotifications: () => void;
  reconnect: () => void;
  
  // Statistics
  connectedAdmins: number;
  eventsLastHour: number;
}

export function useSecurityWebSocket(): UseSecurityWebSocketReturn {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Real-time data state
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<UserActivity | null>(null);
  const [liveAlerts, setLiveAlerts] = useState<SecurityAlert[]>([]);
  const [notifications, setNotifications] = useState<SecurityNotification[]>([]);
  const [connectedAdmins, setConnectedAdmins] = useState(0);
  const [eventsLastHour, setEventsLastHour] = useState(0);
  
  const socketRef = useRef<Socket | null>(null);

  const initializeSocket = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    setConnecting(true);
    setError(null);

    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found');
      setConnecting(false);
      return;
    }

    try {
      const socket = io('http://localhost:3001', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      // Connection events
      socket.on('connect', () => {
        console.log('Connected to security monitoring WebSocket');
        setConnected(true);
        setConnecting(false);
        setError(null);
      });

      socket.on('disconnect', (reason) => {
        console.log('Disconnected from security monitoring:', reason);
        setConnected(false);
        setConnecting(false);
      });

      socket.on('connect_error', (err) => {
        console.error('WebSocket connection error:', err);
        setError(err.message || 'Connection failed');
        setConnecting(false);
        setConnected(false);
      });

      // Security event handlers
      socket.on('security_event', (event: SecurityEvent) => {
        console.log('Received security event:', event);
        
        // Add to recent activity if it's a relevant event
        if (event.type === 'login_attempt' || event.type === 'password_reset' || event.type === 'user_action') {
          setRecentActivity(prev => {
            if (!prev) return prev;
            
            const newEvent = {
              id: event.id,
              type: event.type,
              severity: event.severity,
              description: getEventDescription(event),
              timestamp: new Date(event.timestamp),
              user: event.data.email || `User ${event.userId}`,
              ipAddress: event.ipAddress
            };
            
            return {
              ...prev,
              events: [newEvent, ...prev.events].slice(0, 20), // Keep last 20 events
              totalCount: prev.totalCount + 1,
              timestamp: new Date()
            };
          });
        }
      });

      // Security metrics updates
      socket.on('security_metrics_update', (metrics: SecurityMetrics) => {
        console.log('Received security metrics update:', metrics);
        setSecurityMetrics(metrics);
      });

      socket.on('security_metrics_current', (data: any) => {
        console.log('Subscribed to security metrics:', data);
      });

      // User activity updates
      socket.on('user_activity_update', (activity: UserActivity) => {
        console.log('Received activity update:', activity);
        setRecentActivity(activity);
      });

      socket.on('user_activity_current', (data: any) => {
        console.log('Subscribed to user activity:', data);
      });

      // Security alerts
      socket.on('security_alert_update', (alert: SecurityAlert) => {
        console.log('Received security alert update:', alert);
        setLiveAlerts(prev => [alert, ...prev.filter(a => a.id !== alert.id)].slice(0, 50));
      });

      socket.on('new_security_alert', (alert: SecurityAlert) => {
        console.log('Received new security alert:', alert);
        setLiveAlerts(prev => [alert, ...prev].slice(0, 50));
        
        // Add as notification for high/critical alerts
        if (alert.severity === 'high' || alert.severity === 'critical') {
          setNotifications(prev => [{
            type: alert.type,
            severity: alert.severity,
            message: alert.title,
            timestamp: new Date(alert.timestamp)
          }, ...prev].slice(0, 10));
        }
      });

      socket.on('alert_acknowledged', (data: { alertId: string; acknowledgedBy: string; timestamp: Date }) => {
        console.log('Alert acknowledged:', data);
        setLiveAlerts(prev => 
          prev.map(alert => 
            alert.id === data.alertId 
              ? { ...alert, acknowledged: true }
              : alert
          )
        );
      });

      socket.on('security_alerts_current', (data: any) => {
        console.log('Subscribed to security alerts:', data);
      });

      // Security notifications for all users
      socket.on('security_notification', (notification: SecurityNotification) => {
        console.log('Received security notification:', notification);
        setNotifications(prev => [notification, ...prev].slice(0, 10));
      });

      // Bulk operation status updates
      socket.on('bulk_operation_status', (operation: any) => {
        console.log('Bulk operation status:', operation);
        // Could trigger UI updates for bulk operations
      });

      socketRef.current = socket;

    } catch (err) {
      console.error('Error initializing WebSocket:', err);
      setError('Failed to initialize WebSocket connection');
      setConnecting(false);
    }
  }, []);

  const cleanup = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setConnected(false);
    setConnecting(false);
  }, []);

  // Public methods
  const subscribeToMetrics = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe_security_metrics');
    }
  }, []);

  const subscribeToActivity = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe_user_activity');
    }
  }, []);

  const subscribeToAlerts = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe_security_alerts');
    }
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('acknowledge_security_alert', alertId);
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const reconnect = useCallback(() => {
    cleanup();
    setTimeout(initializeSocket, 1000);
  }, [cleanup, initializeSocket]);

  // Initialize on mount
  useEffect(() => {
    initializeSocket();

    return cleanup;
  }, [initializeSocket, cleanup]);

  // Auto-subscribe to live feeds when connected
  useEffect(() => {
    if (connected) {
      // Small delay to ensure connection is fully established
      setTimeout(() => {
        subscribeToMetrics();
        subscribeToActivity();
        subscribeToAlerts();
      }, 500);
    }
  }, [connected, subscribeToMetrics, subscribeToActivity, subscribeToAlerts]);

  return {
    // Connection state
    connected,
    connecting,
    error,
    
    // Real-time data
    securityMetrics,
    recentActivity,
    liveAlerts,
    notifications,
    
    // Actions
    subscribeToMetrics,
    subscribeToActivity,
    subscribeToAlerts,
    acknowledgeAlert,
    clearNotifications,
    reconnect,
    
    // Statistics
    connectedAdmins,
    eventsLastHour
  };
}

// Helper function to generate event descriptions
function getEventDescription(event: SecurityEvent): string {
  switch (event.type) {
    case 'login_attempt':
      return event.data.success 
        ? `Successful login by ${event.data.email}`
        : `Failed login attempt by ${event.data.email}`;
    case 'password_reset':
      return event.data.type === 'request'
        ? `Password reset requested by ${event.data.email}`
        : `Password reset completed by ${event.data.email}`;
    case 'user_action':
      return `Admin ${event.data.adminUser} performed ${event.data.action} on ${event.data.targetUser}`;
    case 'security_alert':
      return event.data.message || event.data.title;
    default:
      return 'Security event occurred';
  }
}

export default useSecurityWebSocket; 