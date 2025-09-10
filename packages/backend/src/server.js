import app from './app.js';
import { initDatabase, healthCheck } from '../lib/prisma.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🚀 Starting Affiliate Boss API server...');

// Initialize database
try {
    initDatabase();
} catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
}

const PORT = process.env.API_PORT || 3002;

// Start server
try {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
} catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
}

// Test database connection after server starts
setTimeout(async () => {
    try {
        const health = await healthCheck();
        if (health.status === 'healthy') {
            console.log('✅ Database connected successfully');
        } else {
            console.log('❌ Database connection failed');
        }
    } catch (error) {
        console.log('❌ Database connection error');
    }
}, 1000);
