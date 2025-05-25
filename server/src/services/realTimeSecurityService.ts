import SocketServerManager, { SecurityEvent } from '../websocket/socketServer';
import { getSecurityDashboardMetrics } from './securityDashboardService';

/**
 * Real-time Security Service
 * Handles security event detection, processing, and real-time broadcasting
 */
class RealTimeSecurityService {
  private socketManager: SocketServerManager | null = null;
  private eventQueue: SecurityEvent[] = [];
  private metricsUpdateInterval: NodeJS.Timeout | null = null;
  private activityUpdateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupPeriodicUpdates();
  }

  /**
   * Initialize with WebSocket server manager
   */
  public setSocketManager(socketManager: SocketServerManager) {
    this.socketManager = socketManager;
    console.log('Real-time security service connected to WebSocket server');
  }

  /**
   * Setup periodic updates for metrics and activity
   */
  private setupPeriodicUpdates() {
    // Update security metrics every 30 seconds
    this.metricsUpdateInterval = setInterval(() => {
      this.broadcastSecurityMetricsUpdate();
    }, 30000);

    // Update activity feed every 10 seconds
    this.activityUpdateInterval = setInterval(() => {
      this.broadcastActivityUpdate();
    }, 10000);
  }

  /**
   * Handle login attempt events
   */
  public async handleLoginAttempt(data: {
    userId?: number;
    email: string;
    success: boolean;
    ipAddress?: string;
    userAgent?: string;
    failureReason?: string;
  }) {
    const event: SecurityEvent = {
      type: 'login_attempt',
      severity: data.success ? 'low' : 'medium',
      userId: data.userId?.toString(),
      data: {
        email: data.email,
        success: data.success,
        failureReason: data.failureReason,
        location: await this.getLocationFromIP(data.ipAddress)
      },
      timestamp: new Date(),
      ipAddress: data.ipAddress,
      userAgent: data.userAgent
    };

    this.emitSecurityEvent(event);

    // Check for suspicious patterns
    if (!data.success) {
      await this.checkForSuspiciousLoginActivity(data.email, data.ipAddress);
    }
  }

  /**
   * Handle password reset events
   */
  public async handlePasswordReset(data: {
    userId: number;
    email: string;
    type: 'request' | 'complete';
    ipAddress?: string;
    userAgent?: string;
  }) {
    const event: SecurityEvent = {
      type: 'password_reset',
      severity: 'low',
      userId: data.userId.toString(),
      data: {
        email: data.email,
        type: data.type,
        location: await this.getLocationFromIP(data.ipAddress)
      },
      timestamp: new Date(),
      ipAddress: data.ipAddress,
      userAgent: data.userAgent
    };

    this.emitSecurityEvent(event);

    // Check for excessive password reset requests
    if (data.type === 'request') {
      await this.checkForExcessivePasswordResets(data.email, data.ipAddress);
    }
  }

  /**
   * Handle user security actions
   */
  public async handleUserSecurityAction(data: {
    userId: number;
    adminUserId: number;
    action: 'force_password_reset' | 'account_unlock' | 'account_lock' | 'role_change';
    targetUserEmail: string;
    adminEmail: string;
    details?: any;
  }) {
    const event: SecurityEvent = {
      type: 'user_action',
      severity: 'medium',
      userId: data.userId.toString(),
      data: {
        action: data.action,
        targetUser: data.targetUserEmail,
        adminUser: data.adminEmail,
        details: data.details
      },
      timestamp: new Date()
    };

    this.emitSecurityEvent(event);
  }

  /**
   * Generate security alerts based on patterns
   */
  public async generateSecurityAlert(data: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    userId?: number;
    metadata?: any;
  }) {
    const event: SecurityEvent = {
      type: 'security_alert',
      severity: data.severity,
      userId: data.userId?.toString(),
      data: {
        alertType: data.type,
        title: data.title,
        message: data.description,
        metadata: data.metadata
      },
      timestamp: new Date()
    };

    this.emitSecurityEvent(event);

    // Also broadcast as a structured alert
    if (this.socketManager) {
      this.socketManager.broadcastSecurityAlert({
        id: this.generateAlertId(),
        type: data.type,
        severity: data.severity,
        title: data.title,
        description: data.description,
        timestamp: new Date(),
        acknowledged: false,
        userId: data.userId,
        metadata: data.metadata
      });
    }
  }

  /**
   * Broadcast security metrics update
   */
  private async broadcastSecurityMetricsUpdate() {
    if (!this.socketManager) return;

    try {
      // Get current security metrics
      const metrics = await getSecurityDashboardMetrics();
      this.socketManager.broadcastSecurityMetrics(metrics);
    } catch (error) {
      console.error('Error broadcasting security metrics update:', error);
    }
  }

  /**
   * Broadcast activity update
   */
  private async broadcastActivityUpdate() {
    if (!this.socketManager) return;

    try {
      // Get recent activity (last 10 minutes)
      const recentActivity = await this.getRecentSecurityActivity();
      this.socketManager.broadcastUserActivity(recentActivity);
    } catch (error) {
      console.error('Error broadcasting activity update:', error);
    }
  }

  /**
   * Emit security event to WebSocket clients
   */
  private emitSecurityEvent(event: SecurityEvent) {
    // Add to event queue for processing
    this.eventQueue.push(event);

    // Broadcast immediately
    if (this.socketManager) {
      this.socketManager.broadcastSecurityEvent(event);
    }

    // Process event for additional analysis
    this.processSecurityEvent(event);
  }

  /**
   * Process security event for pattern analysis
   */
  private async processSecurityEvent(event: SecurityEvent) {
    try {
      // Log event to database/audit system
      await this.logSecurityEvent(event);

      // Analyze for security patterns
      await this.analyzeSecurityPatterns(event);

      // Cleanup old events from queue
      this.cleanupEventQueue();
    } catch (error) {
      console.error('Error processing security event:', error);
    }
  }

  /**
   * Check for suspicious login activity patterns
   */
  private async checkForSuspiciousLoginActivity(email: string, ipAddress?: string) {
    // Get recent failed login attempts
    const recentFailures = this.eventQueue.filter(event => 
      event.type === 'login_attempt' && 
      event.data.email === email && 
      !event.data.success &&
      Date.now() - event.timestamp.getTime() < 15 * 60 * 1000 // Last 15 minutes
    );

    // If more than 5 failed attempts in 15 minutes, generate alert
    if (recentFailures.length >= 5) {
      await this.generateSecurityAlert({
        type: 'suspicious_login_activity',
        severity: 'high',
        title: 'Suspicious Login Activity Detected',
        description: `Multiple failed login attempts detected for ${email} from IP ${ipAddress || 'unknown'}`,
        metadata: {
          email,
          ipAddress,
          failedAttempts: recentFailures.length,
          timeWindow: '15 minutes'
        }
      });
    }
  }

  /**
   * Check for excessive password reset requests
   */
  private async checkForExcessivePasswordResets(email: string, ipAddress?: string) {
    const recentResets = this.eventQueue.filter(event => 
      event.type === 'password_reset' && 
      event.data.email === email && 
      event.data.type === 'request' &&
      Date.now() - event.timestamp.getTime() < 60 * 60 * 1000 // Last hour
    );

    // If more than 3 reset requests in an hour, generate alert
    if (recentResets.length >= 3) {
      await this.generateSecurityAlert({
        type: 'excessive_password_resets',
        severity: 'medium',
        title: 'Excessive Password Reset Requests',
        description: `Multiple password reset requests detected for ${email}`,
        metadata: {
          email,
          ipAddress,
          resetRequests: recentResets.length,
          timeWindow: '1 hour'
        }
      });
    }
  }

  /**
   * Get recent security activity for live feed
   */
  private async getRecentSecurityActivity() {
    const recentEvents = this.eventQueue
      .filter(event => Date.now() - event.timestamp.getTime() < 10 * 60 * 1000) // Last 10 minutes
      .slice(-20) // Last 20 events
      .map(event => ({
        id: event.timestamp.getTime().toString(),
        type: event.type,
        severity: event.severity,
        description: this.getEventDescription(event),
        timestamp: event.timestamp,
        user: event.data.email || `User ${event.userId}`,
        ipAddress: event.ipAddress
      }));

    return {
      events: recentEvents,
      totalCount: recentEvents.length,
      timestamp: new Date()
    };
  }

  /**
   * Get human-readable event description
   */
  private getEventDescription(event: SecurityEvent): string {
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

  /**
   * Log security event to persistent storage
   */
  private async logSecurityEvent(event: SecurityEvent) {
    // This would typically log to a database table
    // For now, just console log structured data
    console.log('Security Event:', {
      timestamp: event.timestamp.toISOString(),
      type: event.type,
      severity: event.severity,
      userId: event.userId,
      description: this.getEventDescription(event),
      ipAddress: event.ipAddress
    });
  }

  /**
   * Analyze security patterns for predictive alerts
   */
  private async analyzeSecurityPatterns(event: SecurityEvent) {
    // This would implement more sophisticated pattern analysis
    // For now, basic threshold-based analysis
    
    if (event.type === 'login_attempt' && !event.data.success) {
      // Check for distributed brute force attacks
      const recentFailuresFromDifferentIPs = new Set(
        this.eventQueue
          .filter(e => 
            e.type === 'login_attempt' && 
            !e.data.success &&
            Date.now() - e.timestamp.getTime() < 30 * 60 * 1000 // Last 30 minutes
          )
          .map(e => e.ipAddress)
      );

      if (recentFailuresFromDifferentIPs.size >= 10) {
        await this.generateSecurityAlert({
          type: 'distributed_brute_force',
          severity: 'critical',
          title: 'Distributed Brute Force Attack Detected',
          description: `Coordinated login attacks detected from ${recentFailuresFromDifferentIPs.size} different IP addresses`,
          metadata: {
            uniqueIPs: recentFailuresFromDifferentIPs.size,
            timeWindow: '30 minutes'
          }
        });
      }
    }
  }

  /**
   * Cleanup old events from memory queue
   */
  private cleanupEventQueue() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.eventQueue = this.eventQueue.filter(event => 
      event.timestamp.getTime() > oneHourAgo
    );
  }

  /**
   * Get approximate location from IP address
   */
  private async getLocationFromIP(ipAddress?: string): Promise<string> {
    if (!ipAddress || ipAddress === '127.0.0.1' || ipAddress.startsWith('192.168.')) {
      return 'Local/Private Network';
    }
    
    // In a real implementation, you would use a GeoIP service
    // For now, return a placeholder
    return 'Unknown Location';
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get real-time statistics
   */
  public getRealtimeStats() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    
    const recentEvents = this.eventQueue.filter(event => 
      event.timestamp.getTime() > oneHourAgo
    );

    return {
      connectedAdmins: this.socketManager?.getConnectedAdminCount() || 0,
      connectedUsers: this.socketManager?.getConnectedUserCount() || 0,
      eventsLastHour: recentEvents.length,
      criticalAlertsLastHour: recentEvents.filter(e => e.severity === 'critical').length,
      lastEventTime: this.eventQueue.length > 0 ? this.eventQueue[this.eventQueue.length - 1].timestamp : null
    };
  }

  /**
   * Cleanup resources
   */
  public destroy() {
    if (this.metricsUpdateInterval) {
      clearInterval(this.metricsUpdateInterval);
    }
    if (this.activityUpdateInterval) {
      clearInterval(this.activityUpdateInterval);
    }
    this.eventQueue = [];
    console.log('Real-time security service destroyed');
  }
}

// Export singleton instance
export const realTimeSecurityService = new RealTimeSecurityService();
export default realTimeSecurityService; 