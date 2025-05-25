module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Test directory and file patterns
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  
  // Transform TypeScript files with modern ts-jest config
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }],
  },
  
  // Setup and teardown
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Module resolution
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts', // Skip main entry point
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Coverage thresholds per QA plan
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    // Critical paths require 90% coverage
    './src/routes/auth*': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/middleware/auth*': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // Timeout for long-running tests
  testTimeout: 10000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output for debugging
  verbose: true
};