import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticateJWT } from '../../middleware/authMiddleware';
import notificationService, { SecurityNotification, NotificationPreferences } from '../../services/notificationService';

const router = Router();

/**
 * Simple admin check middleware
 */
const requireAdmin = (req: any, res: Response, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

/**
 * Validation schemas for notification endpoints
 */
const notificationPreferencesSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/).optional(),
  pushSubscription: z.any().optional(),
  channels: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
    slack: z.boolean()
  }),
  severityThreshold: z.enum(['low', 'medium', 'high', 'critical']),
  quietHours: z.object({
    enabled: z.boolean(),
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
    timezone: z.string()
  }).optional(),
  escalationRules: z.object({
    enabled: z.boolean(),
    escalateAfterMinutes: z.number().min(1).max(1440),
    escalateToChannels: z.array(z.enum(['email', 'sms', 'push', 'slack']))
  }).optional()
});

const securityNotificationSchema = z.object({
  type: z.enum(['security_alert', 'ai_prediction', 'system_health', 'user_risk', 'digest']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  details: z.any().optional(),
  metadata: z.object({
    userId: z.string().optional(),
    alertId: z.string().optional(),
    aiGenerated: z.boolean().optional(),
    confidence: z.number().min(0).max(1).optional(),
    threatType: z.string().optional(),
    affectedUsers: z.array(z.string()).optional(),
    recommendations: z.array(z.string()).optional()
  }).optional(),
  channels: z.array(z.enum(['email', 'sms', 'push', 'slack'])),
  recipients: z.array(z.string().min(1)),
  requiresAcknowledgment: z.boolean().optional(),
  escalationRules: z.object({
    escalateAfterMinutes: z.number().min(1).max(1440),
    escalateToChannels: z.array(z.enum(['email', 'sms', 'push', 'slack']))
  }).optional()
});

const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string()
  })
});

/**
 * @route GET /api/notifications/preferences
 * @desc Get user notification preferences
 * @access Private
 */
router.get('/preferences', 
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId?.toString();
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID not found in token'
        });
      }

      // Get user preferences (returns defaults if not found)
      const preferences = notificationService['getUserPreferences'](userId);

      res.json({
        success: true,
        data: preferences,
        message: 'Notification preferences retrieved successfully'
      });

    } catch (error) {
      console.error('Error retrieving notification preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve notification preferences'
      });
    }
  }
);

/**
 * @route PUT /api/notifications/preferences
 * @desc Update user notification preferences
 * @access Private
 */
router.put('/preferences',
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId?.toString();
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID not found in token'
        });
      }

      // Validate request body
      const validationResult = notificationPreferencesSchema.safeParse({
        ...req.body,
        userId
      });

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid preferences data',
          errors: validationResult.error.errors
        });
      }

      const preferences = validationResult.data;

      // Update preferences
      notificationService.updateUserPreferences(preferences);

      res.json({
        success: true,
        data: preferences,
        message: 'Notification preferences updated successfully'
      });

    } catch (error) {
      console.error('Error updating notification preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update notification preferences'
      });
    }
  }
);

/**
 * @route POST /api/notifications/push-subscription
 * @desc Register push notification subscription
 * @access Private
 */
router.post('/push-subscription',
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId?.toString();
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID not found in token'
        });
      }

      // Validate push subscription
      const validationResult = pushSubscriptionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid push subscription data',
          errors: validationResult.error.errors
        });
      }

      const pushSubscription = validationResult.data;

      // Get current preferences
      const currentPreferences = notificationService['getUserPreferences'](userId);
      
      // Update with push subscription
      const updatedPreferences: NotificationPreferences = {
        ...currentPreferences,
        pushSubscription,
        channels: {
          ...currentPreferences.channels,
          push: true // Enable push notifications when subscription is added
        }
      };

      notificationService.updateUserPreferences(updatedPreferences);

      res.json({
        success: true,
        message: 'Push notification subscription registered successfully'
      });

    } catch (error) {
      console.error('Error registering push subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register push subscription'
      });
    }
  }
);

/**
 * @route DELETE /api/notifications/push-subscription
 * @desc Unregister push notification subscription
 * @access Private
 */
router.delete('/push-subscription',
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId?.toString();
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID not found in token'
        });
      }

      // Get current preferences
      const currentPreferences = notificationService['getUserPreferences'](userId);
      
      // Remove push subscription
      const updatedPreferences: NotificationPreferences = {
        ...currentPreferences,
        pushSubscription: undefined,
        channels: {
          ...currentPreferences.channels,
          push: false // Disable push notifications when subscription is removed
        }
      };

      notificationService.updateUserPreferences(updatedPreferences);

      res.json({
        success: true,
        message: 'Push notification subscription removed successfully'
      });

    } catch (error) {
      console.error('Error removing push subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove push subscription'
      });
    }
  }
);

/**
 * @route POST /api/notifications/acknowledge/:notificationId
 * @desc Acknowledge a security notification
 * @access Private
 */
router.post('/acknowledge/:notificationId',
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId?.toString();
      const { notificationId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID not found in token'
        });
      }

      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message: 'Notification ID is required'
        });
      }

      // Acknowledge notification
      const acknowledged = notificationService.acknowledgeNotification(notificationId, userId);

      if (!acknowledged) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found or already acknowledged'
        });
      }

      res.json({
        success: true,
        message: 'Notification acknowledged successfully'
      });

    } catch (error) {
      console.error('Error acknowledging notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to acknowledge notification'
      });
    }
  }
);

/**
 * @route POST /api/notifications/send
 * @desc Send a security notification (Admin only)
 * @access Admin
 */
router.post('/send',
  authenticateJWT,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      // Validate notification data
      const validationResult = securityNotificationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid notification data',
          errors: validationResult.error.errors
        });
      }

      const notificationData = validationResult.data;

      // Send notification
      const notificationId = await notificationService.sendSecurityNotification(notificationData);

      res.json({
        success: true,
        data: { notificationId },
        message: 'Security notification sent successfully'
      });

    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send notification'
      });
    }
  }
);

/**
 * @route GET /api/notifications/delivery-stats
 * @desc Get notification delivery statistics (Admin only)
 * @access Admin
 */
router.get('/delivery-stats',
  authenticateJWT,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { notificationId } = req.query;

      // Get delivery statistics
      const stats = notificationService.getDeliveryStats(notificationId as string);

      res.json({
        success: true,
        data: stats,
        message: 'Delivery statistics retrieved successfully'
      });

    } catch (error) {
      console.error('Error retrieving delivery stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve delivery statistics'
      });
    }
  }
);

/**
 * @route POST /api/notifications/test
 * @desc Send test notification (Admin only)
 * @access Admin
 */
router.post('/test',
  authenticateJWT,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { channels, severity = 'medium' } = req.body;
      const userId = (req as any).user?.userId?.toString();

      if (!channels || !Array.isArray(channels) || channels.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Channels array is required'
        });
      }

      // Create test notification
      const testNotification = {
        type: 'system_health' as const,
        severity: severity as 'low' | 'medium' | 'high' | 'critical',
        title: 'Test Notification',
        message: `This is a test notification sent at ${new Date().toLocaleString()}. If you received this, your notification system is working correctly.`,
        channels: channels as ('email' | 'sms' | 'push' | 'slack')[],
        recipients: [userId],
        metadata: {
          userId,
          recommendations: ['Verify notification delivery', 'Check notification preferences']
        }
      };

      // Send test notification
      const notificationId = await notificationService.sendSecurityNotification(testNotification);

      res.json({
        success: true,
        data: { notificationId },
        message: 'Test notification sent successfully'
      });

    } catch (error) {
      console.error('Error sending test notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test notification'
      });
    }
  }
);

/**
 * @route GET /api/notifications/vapid-public-key
 * @desc Get VAPID public key for push notifications
 * @access Public
 */
router.get('/vapid-public-key', (req: Request, res: Response) => {
  try {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      return res.status(503).json({
        success: false,
        message: 'Push notifications not configured'
      });
    }

    res.json({
      success: true,
      data: { publicKey: vapidPublicKey },
      message: 'VAPID public key retrieved successfully'
    });

  } catch (error) {
    console.error('Error retrieving VAPID public key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve VAPID public key'
    });
  }
});

/**
 * @route GET /api/notifications/channels/status
 * @desc Get notification channel status (Admin only)
 * @access Admin
 */
router.get('/channels/status',
  authenticateJWT,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      // Check which notification services are configured
      const channelStatus = {
        email: {
          configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
          service: process.env.SMTP_HOST ? 'SMTP' : 'Not configured'
        },
        sms: {
          configured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
          service: process.env.TWILIO_ACCOUNT_SID ? 'Twilio' : 'Not configured'
        },
        push: {
          configured: !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
          service: process.env.VAPID_PUBLIC_KEY ? 'Web Push' : 'Not configured'
        },
        slack: {
          configured: !!process.env.SLACK_WEBHOOK_URL,
          service: process.env.SLACK_WEBHOOK_URL ? 'Webhook' : 'Not configured'
        }
      };

      res.json({
        success: true,
        data: channelStatus,
        message: 'Notification channel status retrieved successfully'
      });

    } catch (error) {
      console.error('Error retrieving channel status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve channel status'
      });
    }
  }
);

/**
 * @route POST /api/notifications/digest/daily
 * @desc Send daily security digest to administrators (Admin only)
 * @access Admin
 */
router.post('/digest/daily',
  authenticateJWT,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { recipients } = req.body;

      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Recipients array is required'
        });
      }

      // Create daily digest notification
      const digestNotification = {
        type: 'digest' as const,
        severity: 'medium' as const,
        title: 'Daily Security Digest',
        message: `Security summary for ${new Date().toLocaleDateString()}\n\nThis digest includes security events, AI insights, and system health metrics from the past 24 hours.`,
        channels: ['email'] as ('email' | 'sms' | 'push' | 'slack')[],
        recipients,
        metadata: {
          recommendations: [
            'Review security dashboard for detailed analysis',
            'Check AI predictions for potential threats',
            'Verify system health metrics'
          ]
        }
      };

      // Send digest notification
      const notificationId = await notificationService.sendSecurityNotification(digestNotification);

      res.json({
        success: true,
        data: { notificationId },
        message: 'Daily security digest sent successfully'
      });

    } catch (error) {
      console.error('Error sending daily digest:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send daily digest'
      });
    }
  }
);

export default router; 