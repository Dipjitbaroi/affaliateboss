// Server configuration
export const SERVER_CONFIG = {
    PORT: process.env.API_PORT || 3002,
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET || 'demo_secret_key'
};

// Database configuration
export const DATABASE_CONFIG = {
    URL: process.env.DATABASE_URL,
    LOG_LEVEL: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
};

// API configuration
export const API_CONFIG = {
    BASE_URL: process.env.API_BASE_URL || 'http://localhost:3002',
    VERSION: '4.0.0'
};
