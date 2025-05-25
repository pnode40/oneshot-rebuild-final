import nodemailer from 'nodemailer';
import twilio from 'twilio';
import webpush from 'web-push';
import { SecurityEvent } from '../websocket/socketServer';

/**
 * Multi-Channel Notification Service
 * Provides email, SMS, push, and Slack notifications with AI-powered prioritization
 */

interface NotificationChannel {
  type: 'email' | 'sms' | 'push' | 'slack';
  enabled: boolean;
  config: any;
}

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
    start: string; // HH:mm format
    end: string;   // HH:mm format
    timezone: string;
  };
  escalationRules?: {
    enabled: boolean;
    escalateAfterMinutes: number;
    escalateToChannels: ('email' | 'sms' | 'push' | 'slack')[];
  };
}

interface NotificationTemplate {
  id: string;
  type: 'security_alert' | 'ai_prediction' | 'system_health' | 'digest';
  channel: 'email' | 'sms' | 'push' | 'slack';
  template: {
    subject?: string;
    html?: string;
    text: string;
    title?: string;
    body?: string;
    icon?: string;
    actions?: NotificationAction[];
  };
}

interface NotificationAction {
  action: string;
  title: string;
  url?: string;
  type?: 'button' | 'link';
}

interface SecurityNotification {
  id: string;
  type: 'security_alert' | 'ai_prediction' | 'system_health' | 'user_risk' | 'digest';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  details?: any;
  metadata?: {
    userId?: string;
    alertId?: string;
    aiGenerated?: boolean;
    confidence?: number;
    threatType?: string;
    affectedUsers?: string[];
    recommendations?: string[];
  };
  timestamp: Date;
  channels: ('email' | 'sms' | 'push' | 'slack')[];
  recipients: string[]; // User IDs
  priority: 'low' | 'normal' | 'high' | 'urgent';
  requiresAcknowledgment?: boolean;
  escalationRules?: {
    escalateAfterMinutes: number;
    escalateToChannels: ('email' | 'sms' | 'push' | 'slack')[];
  };
}

interface NotificationDeliveryResult {
  notificationId: string;
  channel: string;
  recipient: string;
  success: boolean;
  deliveryId?: string;
  error?: string;
  timestamp: Date;
}

class NotificationService {
  private emailTransporter: nodemailer.Transporter | null = null;
  private twilioClient: twilio.Twilio | null = null;
  private slackWebhookUrl: string | null = null;
  private userPreferences: Map<string, NotificationPreferences> = new Map();
  private notificationQueue: SecurityNotification[] = [];
  private deliveryResults: Map<string, NotificationDeliveryResult[]> = new Map();
  private acknowledgments: Map<string, { userId: string; timestamp: Date }[]> = new Map();
  private escalationTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeServices();
    this.startNotificationProcessor();
  }

  /**
   * Initialize notification services
   */
  private initializeServices() {
    // Initialize email service
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      console.log('📧 Email notification service initialized');
    } else {
      console.log('📧 Email service not configured - using console logging for development');
    }

    // Initialize Twilio SMS service
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      console.log('📱 SMS notification service initialized');
    } else {
      console.log('📱 SMS service not configured - using console logging for development');
    }

    // Initialize Web Push service
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        'mailto:security@oneshot.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
      console.log('🔔 Push notification service initialized');
    } else {
      console.log('🔔 Push notification service not configured - using console logging for development');
    }

    // Initialize Slack integration
    if (process.env.SLACK_WEBHOOK_URL) {
      this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
      console.log('💬 Slack notification service initialized');
    } else {
      console.log('💬 Slack service not configured - using console logging for development');
    }
  }

  /**
   * Start the notification processing queue
   */
  private startNotificationProcessor() {
    setInterval(() => {
      this.processNotificationQueue();
    }, 5000); // Process every 5 seconds

    console.log('🔄 Notification processor started');
  }

  /**
   * Send a security notification through multiple channels
   */
  public async sendSecurityNotification(notification: Omit<SecurityNotification, 'id' | 'timestamp' | 'priority'>): Promise<string> {
    const fullNotification: SecurityNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      priority: this.calculateNotificationPriority(notification.severity, notification.metadata)
    };

    // Add to queue for processing
    this.notificationQueue.push(fullNotification);

    // Set up escalation if required
    if (fullNotification.requiresAcknowledgment && fullNotification.escalationRules) {
      this.setupEscalation(fullNotification);
    }

    console.log(`🔔 Security notification queued: ${fullNotification.id} (${fullNotification.severity})`);
    return fullNotification.id;
  }

  /**
   * Process notification queue
   */
  private async processNotificationQueue() {
    if (this.notificationQueue.length === 0) return;

    const notification = this.notificationQueue.shift()!;
    await this.deliverNotification(notification);
  }

  /**
   * Deliver notification through specified channels
   */
  private async deliverNotification(notification: SecurityNotification) {
    const results: NotificationDeliveryResult[] = [];

    for (const recipientId of notification.recipients) {
      const preferences = this.getUserPreferences(recipientId);
      
      // Check if user should receive notification based on preferences
      if (!this.shouldNotifyUser(notification, preferences)) {
        continue;
      }

      // Filter channels based on user preferences and quiet hours
      const activeChannels = this.getActiveChannels(notification, preferences);

      for (const channel of activeChannels) {
        try {
          let result: NotificationDeliveryResult;

          switch (channel) {
            case 'email':
              result = await this.sendEmailNotification(notification, preferences);
              break;
            case 'sms':
              result = await this.sendSMSNotification(notification, preferences);
              break;
            case 'push':
              result = await this.sendPushNotification(notification, preferences);
              break;
            case 'slack':
              result = await this.sendSlackNotification(notification, preferences);
              break;
            default:
              continue;
          }

          results.push(result);
        } catch (error) {
          console.error(`Failed to send ${channel} notification:`, error);
          results.push({
            notificationId: notification.id,
            channel,
            recipient: recipientId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date()
          });
        }
      }
    }

    // Store delivery results
    this.deliveryResults.set(notification.id, results);

    // Log delivery summary
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    console.log(`📊 Notification ${notification.id} delivered: ${successCount}/${totalCount} successful`);
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    notification: SecurityNotification, 
    preferences: NotificationPreferences
  ): Promise<NotificationDeliveryResult> {
    const template = this.getEmailTemplate(notification);
    
    if (!this.emailTransporter) {
      // Development mode - log instead of sending
      console.log(`📧 [DEV] Email to ${preferences.email}:`);
      console.log(`   Subject: ${template.subject}`);
      console.log(`   Message: ${template.text}`);
      
      return {
        notificationId: notification.id,
        channel: 'email',
        recipient: preferences.userId,
        success: true,
        deliveryId: `dev_email_${Date.now()}`,
        timestamp: new Date()
      };
    }

    if (!preferences.email) {
      throw new Error('No email address configured for user');
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || 'OneShot Security <security@oneshot.com>',
      to: preferences.email,
      subject: template.subject,
      text: template.text,
      html: template.html
    };

    const info = await this.emailTransporter.sendMail(mailOptions);

    return {
      notificationId: notification.id,
      channel: 'email',
      recipient: preferences.userId,
      success: true,
      deliveryId: info.messageId,
      timestamp: new Date()
    };
  }

  /**
   * Send SMS notification
   */
  private async sendSMSNotification(
    notification: SecurityNotification,
    preferences: NotificationPreferences
  ): Promise<NotificationDeliveryResult> {
    const template = this.getSMSTemplate(notification);

    if (!this.twilioClient) {
      // Development mode - log instead of sending
      console.log(`📱 [DEV] SMS to ${preferences.phone}:`);
      console.log(`   Message: ${template.text}`);
      
      return {
        notificationId: notification.id,
        channel: 'sms',
        recipient: preferences.userId,
        success: true,
        deliveryId: `dev_sms_${Date.now()}`,
        timestamp: new Date()
      };
    }

    if (!preferences.phone) {
      throw new Error('No phone number configured for user');
    }

    const message = await this.twilioClient.messages.create({
      body: template.text,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: preferences.phone
    });

    return {
      notificationId: notification.id,
      channel: 'sms',
      recipient: preferences.userId,
      success: true,
      deliveryId: message.sid,
      timestamp: new Date()
    };
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(
    notification: SecurityNotification,
    preferences: NotificationPreferences
  ): Promise<NotificationDeliveryResult> {
    const template = this.getPushTemplate(notification);

    if (!preferences.pushSubscription) {
      throw new Error('No push subscription configured for user');
    }

    if (!process.env.VAPID_PUBLIC_KEY) {
      // Development mode - log instead of sending
      console.log(`🔔 [DEV] Push notification to ${preferences.userId}:`);
      console.log(`   Title: ${template.title}`);
      console.log(`   Body: ${template.body}`);
      
      return {
        notificationId: notification.id,
        channel: 'push',
        recipient: preferences.userId,
        success: true,
        deliveryId: `dev_push_${Date.now()}`,
        timestamp: new Date()
      };
    }

    const payload = JSON.stringify({
      title: template.title,
      body: template.body,
      icon: template.icon,
      badge: '/icons/security-badge.png',
      tag: `security-${notification.severity}`,
      data: {
        notificationId: notification.id,
        type: notification.type,
        severity: notification.severity,
        url: '/admin/security'
      },
      actions: template.actions
    });

    await webpush.sendNotification(preferences.pushSubscription, payload);

    return {
      notificationId: notification.id,
      channel: 'push',
      recipient: preferences.userId,
      success: true,
      deliveryId: `push_${Date.now()}`,
      timestamp: new Date()
    };
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(
    notification: SecurityNotification,
    preferences: NotificationPreferences
  ): Promise<NotificationDeliveryResult> {
    const template = this.getSlackTemplate(notification);

    if (!this.slackWebhookUrl) {
      // Development mode - log instead of sending
      console.log(`💬 [DEV] Slack notification:`);
      console.log(`   Title: ${template.title}`);
      console.log(`   Message: ${template.text}`);
      
      return {
        notificationId: notification.id,
        channel: 'slack',
        recipient: preferences.userId,
        success: true,
        deliveryId: `dev_slack_${Date.now()}`,
        timestamp: new Date()
      };
    }

    const payload = {
      text: template.title,
      attachments: [{
        color: this.getSlackColor(notification.severity),
        title: notification.title,
        text: template.text,
        fields: [
          {
            title: 'Severity',
            value: notification.severity.toUpperCase(),
            short: true
          },
          {
            title: 'Type',
            value: notification.type.replace('_', ' ').toUpperCase(),
            short: true
          },
          {
            title: 'Timestamp',
            value: notification.timestamp.toISOString(),
            short: true
          }
        ],
        footer: 'OneShot Security',
        footer_icon: 'https://oneshot.com/icons/security.png',
        ts: Math.floor(notification.timestamp.getTime() / 1000)
      }]
    };

    const response = await fetch(this.slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`);
    }

    return {
      notificationId: notification.id,
      channel: 'slack',
      recipient: preferences.userId,
      success: true,
      deliveryId: `slack_${Date.now()}`,
      timestamp: new Date()
    };
  }

  /**
   * Calculate notification priority using AI-powered logic
   */
  private calculateNotificationPriority(
    severity: SecurityNotification['severity'],
    metadata?: SecurityNotification['metadata']
  ): SecurityNotification['priority'] {
    // Base priority from severity
    let priority: SecurityNotification['priority'] = 'normal';
    
    switch (severity) {
      case 'critical':
        priority = 'urgent';
        break;
      case 'high':
        priority = 'high';
        break;
      case 'medium':
        priority = 'normal';
        break;
      case 'low':
        priority = 'low';
        break;
    }

    // AI enhancement based on metadata
    if (metadata?.aiGenerated && metadata.confidence && metadata.confidence > 0.8) {
      // High-confidence AI predictions get boosted priority
      if (priority === 'normal') priority = 'high';
      if (priority === 'high') priority = 'urgent';
    }

    // Multiple affected users increase priority
    if (metadata?.affectedUsers && metadata.affectedUsers.length > 10) {
      if (priority === 'low') priority = 'normal';
      if (priority === 'normal') priority = 'high';
    }

    return priority;
  }

  /**
   * Setup escalation for unacknowledged notifications
   */
  private setupEscalation(notification: SecurityNotification) {
    if (!notification.escalationRules) return;

    const escalationTimer = setTimeout(() => {
      this.escalateNotification(notification);
    }, notification.escalationRules.escalateAfterMinutes * 60 * 1000);

    this.escalationTimers.set(notification.id, escalationTimer);
  }

  /**
   * Escalate unacknowledged notification
   */
  private async escalateNotification(notification: SecurityNotification) {
    // Check if notification was acknowledged
    const acks = this.acknowledgments.get(notification.id) || [];
    if (acks.length > 0) {
      console.log(`⚡ Notification ${notification.id} was acknowledged, skipping escalation`);
      return;
    }

    console.log(`⚡ Escalating unacknowledged notification: ${notification.id}`);

    // Create escalated notification
    const escalatedNotification: SecurityNotification = {
      ...notification,
      id: `escalated_${notification.id}`,
      title: `🚨 ESCALATED: ${notification.title}`,
      message: `This critical security alert requires immediate attention and has not been acknowledged.\n\nOriginal Alert: ${notification.message}`,
      channels: notification.escalationRules?.escalateToChannels || ['email', 'sms'],
      priority: 'urgent',
      timestamp: new Date()
    };

    await this.deliverNotification(escalatedNotification);
  }

  /**
   * Acknowledge notification
   */
  public acknowledgeNotification(notificationId: string, userId: string): boolean {
    const acks = this.acknowledgments.get(notificationId) || [];
    acks.push({ userId, timestamp: new Date() });
    this.acknowledgments.set(notificationId, acks);

    // Cancel escalation timer
    const timer = this.escalationTimers.get(notificationId);
    if (timer) {
      clearTimeout(timer);
      this.escalationTimers.delete(notificationId);
    }

    console.log(`✅ Notification ${notificationId} acknowledged by user ${userId}`);
    return true;
  }

  /**
   * Get user notification preferences
   */
  private getUserPreferences(userId: string): NotificationPreferences {
    return this.userPreferences.get(userId) || {
      userId,
      channels: {
        email: true,
        sms: false,
        push: true,
        slack: false
      },
      severityThreshold: 'medium'
    };
  }

  /**
   * Update user notification preferences
   */
  public updateUserPreferences(preferences: NotificationPreferences): void {
    this.userPreferences.set(preferences.userId, preferences);
    console.log(`⚙️ Updated notification preferences for user ${preferences.userId}`);
  }

  /**
   * Check if user should receive notification
   */
  private shouldNotifyUser(notification: SecurityNotification, preferences: NotificationPreferences): boolean {
    // Check severity threshold
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const notificationLevel = severityLevels[notification.severity];
    const thresholdLevel = severityLevels[preferences.severityThreshold];
    
    if (notificationLevel < thresholdLevel) {
      return false;
    }

    // Check quiet hours
    if (preferences.quietHours?.enabled && this.isInQuietHours(preferences.quietHours)) {
      // Allow critical notifications during quiet hours
      return notification.severity === 'critical';
    }

    return true;
  }

  /**
   * Check if current time is in quiet hours
   */
  private isInQuietHours(quietHours: NotificationPreferences['quietHours']): boolean {
    if (!quietHours) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = quietHours.start.split(':').map(Number);
    const [endHour, endMin] = quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Get active channels for notification
   */
  private getActiveChannels(
    notification: SecurityNotification, 
    preferences: NotificationPreferences
  ): ('email' | 'sms' | 'push' | 'slack')[] {
    return notification.channels.filter(channel => 
      preferences.channels[channel] === true
    );
  }

  // Template generation methods
  private getEmailTemplate(notification: SecurityNotification): { subject: string; text: string; html: string } {
    const subject = `🔒 OneShot Security Alert: ${notification.title}`;
    const text = `
OneShot Security Alert

Title: ${notification.title}
Severity: ${notification.severity.toUpperCase()}
Time: ${notification.timestamp.toLocaleString()}

${notification.message}

${notification.metadata?.recommendations ? 
  'Recommended Actions:\n' + notification.metadata.recommendations.map(r => `• ${r}`).join('\n') 
  : ''
}

View full details: https://oneshot.com/admin/security
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
        .severity-${notification.severity} { 
            border-left: 4px solid ${this.getSeverityColor(notification.severity)}; 
            padding: 20px; 
            margin: 20px 0; 
            background: #f9fafb; 
        }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        .button { 
            display: inline-block; 
            background: #3b82f6; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 10px 0; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 OneShot Security Alert</h1>
        </div>
        <div class="severity-${notification.severity}">
            <h2>${notification.title}</h2>
            <p><strong>Severity:</strong> ${notification.severity.toUpperCase()}</p>
            <p><strong>Time:</strong> ${notification.timestamp.toLocaleString()}</p>
            <p>${notification.message}</p>
            ${notification.metadata?.recommendations ? 
              '<h3>Recommended Actions:</h3><ul>' + 
              notification.metadata.recommendations.map(r => `<li>${r}</li>`).join('') + 
              '</ul>' 
              : ''
            }
        </div>
        <div style="text-align: center;">
            <a href="https://oneshot.com/admin/security" class="button">View Security Dashboard</a>
        </div>
        <div class="footer">
            OneShot Security Monitoring System<br>
            This email was sent because you have security notifications enabled.
        </div>
    </div>
</body>
</html>
    `;

    return { subject, text, html };
  }

  private getSMSTemplate(notification: SecurityNotification): { text: string } {
    const text = `🔒 OneShot Security Alert
${notification.severity.toUpperCase()}: ${notification.title}
${notification.message}
View: https://oneshot.com/admin/security`;

    return { text };
  }

  private getPushTemplate(notification: SecurityNotification): { title: string; body: string; icon: string; actions: NotificationAction[] } {
    return {
      title: `🔒 Security Alert (${notification.severity.toUpperCase()})`,
      body: notification.message,
      icon: '/icons/security-alert.png',
      actions: [
        {
          action: 'view',
          title: 'View Details',
          url: '/admin/security'
        },
        {
          action: 'acknowledge',
          title: 'Acknowledge'
        }
      ]
    };
  }

  private getSlackTemplate(notification: SecurityNotification): { title: string; text: string } {
    return {
      title: `🔒 OneShot Security Alert`,
      text: `*${notification.title}*\n${notification.message}\n\n${
        notification.metadata?.recommendations ? 
        '*Recommended Actions:*\n' + notification.metadata.recommendations.map(r => `• ${r}`).join('\n') 
        : ''
      }`
    };
  }

  // Utility methods
  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  }

  private getSlackColor(severity: string): string {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return '#d97706';
      case 'low': return 'good';
      default: return '#6b7280';
    }
  }

  /**
   * Get notification delivery statistics
   */
  public getDeliveryStats(notificationId?: string): any {
    if (notificationId) {
      return this.deliveryResults.get(notificationId) || [];
    }

    const allResults = Array.from(this.deliveryResults.values()).flat();
    const totalDeliveries = allResults.length;
    const successfulDeliveries = allResults.filter(r => r.success).length;
    
    const statsByChannel = allResults.reduce((acc, result) => {
      if (!acc[result.channel]) {
        acc[result.channel] = { total: 0, successful: 0 };
      }
      acc[result.channel].total++;
      if (result.success) acc[result.channel].successful++;
      return acc;
    }, {} as Record<string, { total: number; successful: number }>);

    return {
      totalDeliveries,
      successfulDeliveries,
      successRate: totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0,
      statsByChannel
    };
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    // Clear all escalation timers
    for (const timer of this.escalationTimers.values()) {
      clearTimeout(timer);
    }
    this.escalationTimers.clear();

    console.log('🔔 Notification service destroyed');
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
export type { 
  SecurityNotification, 
  NotificationPreferences, 
  NotificationDeliveryResult,
  NotificationChannel,
  NotificationTemplate 
}; 