import express from 'express';
import cors from 'cors';
import { db } from './db/client';
import { profiles } from './db/schema';
import profileRouter from './routes/profile';
import debugRouter from './routes/debug';

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

// Routes
app.use('/api/profile', profileRouter);
app.use('/api/debug', debugRouter);

// Test route to directly insert a profile for testing
app.get('/test-insert', async (req, res) => {
  try {
    const testProfile = {
      fullName: "Test User",
      email: "test@example.com",
      highSchool: "Test High",
      position: "Tester",
      gradYear: "2025",
      cityState: "Test City, TX",
      heightFt: "6",
      heightIn: "0",
      weight: "180",
      fortyYardDash: "4.5",
      benchPress: "200"
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
  testConnection();
});
