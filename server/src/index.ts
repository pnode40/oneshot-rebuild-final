// 1. Environment setup
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the server directory
dotenv.config();

// CORS fix deployed - force redeploy timestamp: 2025-05-30T04:35:00Z
// Debug: Check if DATABASE_URL is loaded
console.log('🔍 DATABASE_URL loaded:', process.env.DATABASE_URL ? 'YES' : 'NO');
console.log('🔍 DATABASE_URL value:', process.env.DATABASE_URL?.substring(0, 50) + '...');

// 2. Core imports
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { db } from './db/client';

// 3. Route imports
import profileRouter from './routes/profile';
import debugRouter from './routes/debug';
import authRouter from './routes/auth';
import uploadRouter from './routes/upload';
// import testRoutes from './routes/testRoutes'; // Removed - file doesn't exist
import athleteProfileRoutes from './routes/athleteProfileRoutes';
import mediaItemRouter from './routes/mediaItemRoutes';
import videoLinkRoutes from './routes/videoLinkRoutes';
import passwordResetRoutes from './routes/passwordResetRoutes';
import publicProfilesRouter from './routes/publicProfiles';
import ogImageRoutes from './routes/api/ogImageRoutes';
import profileAnalyticsRoutes from './routes/api/profileAnalytics';

// 4. Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;

// 5. Middleware setup
// Configure CORS with explicit options
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175', 
    'http://localhost:5176', 
    'http://localhost:5177', 
    'http://localhost:5178',
    'https://oneshot-rebuild-final.vercel.app',
    'https://oneshot-rebuild-final-git-main-pnode40.vercel.app',
    'https://oneshot-rebuild-final-pnode40.vercel.app',
    'https://www.oneshotrecruits.com',
    'https://oneshotrecruits.com',
    ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : [])
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
// app.use('/api', testRoutes); // Removed - file doesn't exist
app.use('/api/athlete-profile', athleteProfileRoutes);
app.use('/api/media', mediaItemRouter);
app.use('/api/athlete', videoLinkRoutes);
app.use('/api/auth', passwordResetRoutes);
app.use('/api/public', publicProfilesRouter);
app.use('/api/v1/og-image', ogImageRoutes);
app.use('/api/v1/analytics', profileAnalyticsRoutes);

// 8. Setup React app route for public profiles
app.get('/u/:slug', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// 9. Test route
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

// 10. Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : String(err)
  });
});

// 11. Database connection test (non-blocking)
async function testConnection() {
  try {
    console.log('Attempting to query profiles...');
    const result = await db.query.profiles.findMany();
    console.log('✅ Database connection successful! Fetched profiles:', result.length, 'records');
  } catch (error) {
    console.warn('⚠️  Database connection failed - this is OK for development without a database:');
    console.warn('   Error:', error instanceof Error ? error.message : String(error));
    console.warn('   To fix: Set DATABASE_URL environment variable or start a local PostgreSQL instance');
    console.warn('   Server will continue running without database functionality');
  }
}

// 12. Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 File upload test page available at: http://localhost:${PORT}/upload-test.html`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Public profiles available at: http://localhost:${PORT}/u/{slug}`);
  
  // Test database connection but don't block startup
  setTimeout(testConnection, 1000);
});
