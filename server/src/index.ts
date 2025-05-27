// 1. Environment setup
import dotenv from 'dotenv';
import path from 'path';

// Load .env from server directory - fix the path resolution
dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

// Temporary fix: Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://OneShotMay25_owner:npg_OPr6NdBp0QVH@ep-wispy-lab-a5ldd1qu-pooler.us-east-2.aws.neon.tech/OneShotMay25?sslmode=require';
}

// 2. Core imports
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { db } from './db/client';

// Sentry for error monitoring (simple setup)
import * as Sentry from '@sentry/node';

// 3. Route imports
import profileRouter from './routes/profile';
import debugRouter from './routes/debug';
import authRouter from './routes/auth';
import uploadRouter from './routes/upload';

import athleteProfileRoutes from './routes/athleteProfileRoutes';
import mediaItemRouter from './routes/mediaItemRoutes';
import videoLinkRoutes from './routes/videoLinkRoutes';
import passwordResetRoutes from './routes/passwordResetRoutes';
import healthRouter from './routes/health';
import profilePhotoRoutes from './routes/api/profilePhotos';
import securityDashboardRoutes from './routes/api/securityDashboard';
import aiSecurityIntelligenceRoutes from './routes/api/aiSecurityIntelligence';
import notificationRoutes from './routes/api/notifications';
import analyticsRoutes from './routes/api/analytics';
import profileAnalyticsRoutes from './routes/api/profileAnalytics';

// 4. Real-time security imports
import SocketServerManager from './websocket/socketServer';
import realTimeSecurityService from './services/realTimeSecurityService';
import aiSecurityIntelligence from './services/aiSecurityIntelligence';
import notificationService from './services/notificationService';

// 4. Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Sentry with minimal configuration
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    enabled: process.env.NODE_ENV === 'production',
    environment: process.env.NODE_ENV || 'development'
  });
  
  console.log('Sentry initialized for error monitoring');
}

// 5. Middleware setup
// Configure CORS with explicit options
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175', 
    'http://localhost:5176', 
    'http://localhost:5177', 
    'http://localhost:5178'
  ],
  optionsSuccessStatus: 200,
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 6. Static file serving
// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Serve static files from public directory
app.use(express.static(path.join(process.cwd(), 'public')));

// 7. Route registration
app.use('/api/profile', profileRouter);
app.use('/api/debug', debugRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);

app.use('/api/athlete-profile', athleteProfileRoutes);
app.use('/api/media', mediaItemRouter);
app.use('/api/athlete', videoLinkRoutes);
app.use('/api/auth', passwordResetRoutes);
app.use('/api/health', healthRouter);
app.use('/api/profile-photos', profilePhotoRoutes);
app.use('/api/security-dashboard', securityDashboardRoutes);
app.use('/api/ai-security', aiSecurityIntelligenceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/v1/analytics', profileAnalyticsRoutes);

// 8. Test route
import { positionEnum, athleteRoleEnum, profiles } from './db/schema';
import { sql } from 'drizzle-orm';

app.get('/test-insert', async (req, res) => {
  try {
    // Get custom slug from query parameter or use default
    const customSlug = req.query.slug as string || "test-user-profile";
    
    // Create a test profile with data that matches the schema
    const testProfile = {
      userId: 1, // Associate with the first user in the database
      positionPrimary: 'QB' as const, // Use literal string that matches the enum
      athleteRole: athleteRoleEnum.enumValues[0], // Use 'high_school' from the enum values
      
      // Required fields for schema validation
      firstName: "Test",
      lastName: "Athlete", 
      
      // Optional fields that are properly typed
      highSchoolName: "Test High School",
      graduationYear: sql`${2025}`, // Use SQL literal for numeric field
      heightInInches: sql`${72}`, // 6'0" in inches
      weightLbs: sql`${180}`, // Weight in lbs
      
      // Using the schema's field names instead of client-side names
      customUrlSlug: customSlug,
      slug: customSlug, // Required field for public profiles
      
      // Setting default visibility flags
      isHeightVisible: true,
      isWeightVisible: true,
      isGpaVisible: true,
      isTranscriptVisible: true,
      isNcaaInfoVisible: true
    };
    
    console.log("Attempting to insert test profile:", testProfile);
    
    const result = await db.insert(profiles)
      .values(testProfile)
      .returning({ insertedId: profiles.id });
      
    console.log("DB insert result:", result);
    
    res.status(201).json({ 
      success: true, 
      message: "Test profile inserted successfully", 
      profileId: result[0]?.insertedId,
      fullResult: result 
    });
  } catch (error) {
    console.error("Test route error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Test insert failed",
      error: String(error)
    });
  }
});

// 9. Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Log the error to Sentry if available
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }
  
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : String(err)
  });
});

// 10. Database connection test
async function testConnection() {
  try {
    console.log('DATABASE_URL being used:', process.env.DATABASE_URL);
    console.log('Attempting to query profiles...');
    const result = await db.query.profiles.findMany();
    console.log('Fetched profiles (indicates connection success):', result);
  } catch (error) {
    console.error('Error during database test:', error);
  }
}

// 11. Start server with WebSocket support
const server = http.createServer(app);

// Initialize WebSocket server
const socketManager = new SocketServerManager(server);

// Connect real-time security service to WebSocket server
realTimeSecurityService.setSocketManager(socketManager);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server initialized for real-time security monitoring`);
  console.log(`File upload test page available at: http://localhost:${PORT}/upload-test.html`);
  testConnection();
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  realTimeSecurityService.destroy();
  notificationService.destroy();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  realTimeSecurityService.destroy();
  notificationService.destroy();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Export app and server for testing
export { app, server, socketManager, realTimeSecurityService };
