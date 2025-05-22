// This file is run before any test file
// Global setup for all tests

// Set up global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key';
process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/oneshot_test'; 