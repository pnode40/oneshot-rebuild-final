import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { AuthenticatedUser } from '../types';
import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  user: AuthenticatedUser;
}

export interface SecurityEvent {
  type: 'login_attempt' | 'password_reset' | 'security_alert' | 'user_action' | 'system_metric';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  data: any;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

class SocketServerManager {
  private io: SocketServer;
  private authenticatedSockets: Map<string, AuthenticatedSocket> = new Map();
  
  constructor(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupConnectionHandlers();
  }

  private setupMiddleware() {
    // JWT Authentication middleware for WebSocket connections
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        // Create authenticated user object matching existing structure
        const user: AuthenticatedUser = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        };

        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupConnectionHandlers() {
    this.io.on('connection', (socket: Socket) => {
      const authenticatedSocket = socket as AuthenticatedSocket;
      this.authenticatedSockets.set(socket.id, authenticatedSocket);

      console.log(`User ${authenticatedSocket.user.email} connected to security monitoring`);

      // Join appropriate rooms based on user role
      this.assignUserToRooms(authenticatedSocket);

      // Handle client subscriptions
      this.setupClientEventHandlers(authenticatedSocket);

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${authenticatedSocket.user.email} disconnected from security monitoring`);
        this.authenticatedSockets.delete(socket.id);
      });
    });
  }

  private assignUserToRooms(socket: AuthenticatedSocket) {
    const { user } = socket;

    // All authenticated users join general monitoring
    socket.join('authenticated_users');

    // Admin-specific rooms
    if (user.role === 'admin') {
      socket.join('admin_security_dashboard');
      socket.join('security_alerts');
      socket.join('user_management');
      socket.join('system_metrics');
    }

    // User-specific room for personal notifications
    socket.join(`user_${user.userId}`);

    console.log(`User ${user.email} assigned to appropriate monitoring rooms`);
  }

  private setupClientEventHandlers(socket: AuthenticatedSocket) {
    // Subscribe to specific security events
    socket.on('subscribe_security_metrics', () => {
      if (socket.user.role === 'admin') {
        socket.join('live_security_metrics');
        this.emitCurrentSecurityMetrics(socket);
      }
    });

    socket.on('subscribe_user_activity', () => {
      if (socket.user.role === 'admin') {
        socket.join('live_user_activity');
        this.emitCurrentUserActivity(socket);
      }
    });

    socket.on('subscribe_security_alerts', () => {
      if (socket.user.role === 'admin') {
        socket.join('live_security_alerts');
        this.emitCurrentSecurityAlerts(socket);
      }
    });

    // Handle alert acknowledgments
    socket.on('acknowledge_security_alert', (alertId: string) => {
      if (socket.user.role === 'admin') {
        this.handleAlertAcknowledgment(socket, alertId);
      }
    });
  }

  // Public methods for broadcasting security events
  public broadcastSecurityEvent(event: SecurityEvent) {
    // Broadcast to admin dashboard
    this.io.to('admin_security_dashboard').emit('security_event', {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date()
    });

    // Broadcast high/critical severity events to all authenticated users
    if (event.severity === 'high' || event.severity === 'critical') {
      this.io.to('authenticated_users').emit('security_notification', {
        type: event.type,
        severity: event.severity,
        message: this.getEventMessage(event),
        timestamp: new Date()
      });
    }

    // Send to specific user if applicable
    if (event.userId) {
      this.io.to(`user_${event.userId}`).emit('personal_security_event', event);
    }
  }

  public broadcastSecurityMetrics(metrics: any) {
    this.io.to('live_security_metrics').emit('security_metrics_update', {
      ...metrics,
      timestamp: new Date()
    });
  }

  public broadcastUserActivity(activity: any) {
    this.io.to('live_user_activity').emit('user_activity_update', {
      ...activity,
      timestamp: new Date()
    });
  }

  public broadcastSecurityAlert(alert: any) {
    this.io.to('live_security_alerts').emit('security_alert_update', {
      ...alert,
      timestamp: new Date()
    });

    // Also send to general security alerts room
    this.io.to('security_alerts').emit('new_security_alert', alert);
  }

  public broadcastBulkOperationStatus(operation: any) {
    this.io.to('admin_security_dashboard').emit('bulk_operation_status', {
      ...operation,
      timestamp: new Date()
    });
  }

  // Private helper methods
  private async emitCurrentSecurityMetrics(socket: AuthenticatedSocket) {
    try {
      // This would typically fetch current metrics from the security service
      // For now, emit a placeholder
      socket.emit('security_metrics_current', {
        message: 'Subscribed to live security metrics',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error emitting current security metrics:', error);
    }
  }

  private async emitCurrentUserActivity(socket: AuthenticatedSocket) {
    try {
      // This would typically fetch recent activity from the security service
      socket.emit('user_activity_current', {
        message: 'Subscribed to live user activity',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error emitting current user activity:', error);
    }
  }

  private async emitCurrentSecurityAlerts(socket: AuthenticatedSocket) {
    try {
      // This would typically fetch current unacknowledged alerts
      socket.emit('security_alerts_current', {
        message: 'Subscribed to live security alerts',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error emitting current security alerts:', error);
    }
  }

  private async handleAlertAcknowledgment(socket: AuthenticatedSocket, alertId: string) {
    try {
      // This would typically update the alert in the database
      // Then broadcast the acknowledgment to all admin clients
      this.io.to('admin_security_dashboard').emit('alert_acknowledged', {
        alertId,
        acknowledgedBy: socket.user.email,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error handling alert acknowledgment:', error);
    }
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getEventMessage(event: SecurityEvent): string {
    switch (event.type) {
      case 'login_attempt':
        return event.data.success ? 'Successful login detected' : 'Failed login attempt detected';
      case 'password_reset':
        return 'Password reset activity detected';
      case 'security_alert':
        return event.data.message || 'Security alert triggered';
      case 'user_action':
        return `User action: ${event.data.action}`;
      case 'system_metric':
        return 'System security metric updated';
      default:
        return 'Security event detected';
    }
  }

  // Getter for the socket server instance
  public getSocketServer(): SocketServer {
    return this.io;
  }

  // Get connected admin count
  public getConnectedAdminCount(): number {
    const adminRoom = this.io.sockets.adapter.rooms.get('admin_security_dashboard');
    return adminRoom ? adminRoom.size : 0;
  }

  // Get total connected users
  public getConnectedUserCount(): number {
    const userRoom = this.io.sockets.adapter.rooms.get('authenticated_users');
    return userRoom ? userRoom.size : 0;
  }
}

export default SocketServerManager; 