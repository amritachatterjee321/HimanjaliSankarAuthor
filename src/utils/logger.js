// Simple logging utility for production/development control
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Get current log level from environment
const getLogLevel = () => {
  const level = process.env.LOG_LEVEL || (isProduction ? 'WARN' : 'DEBUG');
  return LOG_LEVELS[level.toUpperCase()] || LOG_LEVELS.WARN;
};

const currentLogLevel = getLogLevel();

// Logger functions
export const logger = {
  error: (...args) => {
    if (currentLogLevel >= LOG_LEVELS.ERROR) {
      console.error('❌', ...args);
    }
  },
  
  warn: (...args) => {
    if (currentLogLevel >= LOG_LEVELS.WARN) {
      console.warn('⚠️', ...args);
    }
  },
  
  info: (...args) => {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
      console.log('ℹ️', ...args);
    }
  },
  
  debug: (...args) => {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
      console.log('🔍', ...args);
    }
  },
  
  success: (...args) => {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
      console.log('✅', ...args);
    }
  }
};

// Export individual functions for convenience
export const { error, warn, info, debug, success } = logger;

// Export for use in other modules
export default logger;
