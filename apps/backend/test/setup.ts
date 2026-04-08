// Test setup for BDD tests
import 'reflect-metadata';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.FRONT_ORIGIN = 'http://localhost:3000';
process.env.APP_URL = 'http://localhost:3001';
process.env.BACKEND_URL = 'http://localhost:3001';
process.env.RESEND_API_KEY = 're_test_key';
process.env.RESEND_FROM_EMAIL = 'AIQUAA <test@aiquaa.com>';
