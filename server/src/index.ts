import express from 'express';
import cors from 'cors';
import path from 'path';
import { db } from './db/client';
import { profiles, positionEnum, athleteRoleEnum } from './db/schema';
import profileRouter from './routes/profile';
import debugRouter from './routes/debug';
import authRouter from './routes/auth';
import testAuthRouter from './routes/test-auth';
import uploadRouter from './routes/upload';
import { sql } from 'drizzle-orm';

const app = express();
const PORT = process.env.PORT || 3001;

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

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Serve static files from public directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Routes
app.use('/api/profile', profileRouter);
app.use('/api/debug', debugRouter);
app.use('/api/auth', authRouter);
app.use('/api/test-auth', testAuthRouter);
app.use('/api/upload', uploadRouter);

// Test route to directly insert a profile for testing
app.get('/test-insert', async (req, res) => {
  try {
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
      customUrlSlug: "test-user-profile",
      
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

// Test database connection
async function testConnection() {
  try {
    console.log('Attempting to query profiles...');
    const result = await db.query.profiles.findMany();
    console.log('Fetched profiles (indicates connection success):', result);
  } catch (error) {
    console.error('Error during database test:', error);
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`File upload test page available at: http://localhost:${PORT}/upload-test.html`);
  testConnection();
});
