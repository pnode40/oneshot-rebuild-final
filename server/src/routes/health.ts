import { Router, Request, Response } from 'express';
import { db } from '../db/client';

const router = Router();

// Define a health response function to avoid code duplication
const sendHealthResponse = async (req: Request, res: Response) => {
  try {
    // Check database connection
    await db.query.users.findFirst();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        server: 'running'
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        server: 'running'
      },
      error: String(error)
    });
  }
};

// Health check endpoint with trailing slash
router.get('/', sendHealthResponse);

// Health check endpoint without trailing slash
router.get('', sendHealthResponse);

// Test route for Sentry error tracking
router.get('/test-error', (req, res) => {
  throw new Error('This is a test error for Sentry monitoring');
});

// Detailed health check
router.get('/detailed', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Test database
    const dbStartTime = Date.now();
    await db.query.users.findFirst();
    const dbResponseTime = Date.now() - dbStartTime;
    
    // Test server memory usage
    const memoryUsage = process.memoryUsage();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      services: {
        database: {
          status: 'connected',
          responseTime: dbResponseTime
        },
        server: {
          status: 'running',
          uptime: process.uptime(),
          memory: {
            rss: Math.round(memoryUsage.rss / 1024 / 1024),
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            external: Math.round(memoryUsage.external / 1024 / 1024)
          }
        }
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      services: {
        database: 'disconnected',
        server: 'running'
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 