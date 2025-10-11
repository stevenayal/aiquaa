// Simple test to verify the logger works
const { logger } = require('./apps/backend/dist/logger/seq.logger.js');

console.log('Testing logger...');
logger.info('Test log message');
logger.error('Test error message');

// Wait a bit for async initialization
setTimeout(() => {
  console.log('Logger test completed successfully');
  process.exit(0);
}, 2000);
