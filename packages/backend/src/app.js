// Simple Express API server for Affiliate Boss
import express from 'express';
import cors from 'cors';
import path from 'path';
import { getDatabase } from '../lib/prisma.js';
import { corsMiddleware, loggingMiddleware, errorHandler } from './middleware/index.js';
import dashboardRoutes from './routes/dashboard.js';
import linksRoutes from './routes/links.js';
import toolsRoutes from './routes/tools.js';
import productsRoutes from './routes/products.js';
import commissionsRoutes from './routes/commissions.js';
import referralsRoutes from './routes/referrals.js';
import profileRoutes from './routes/profile.js';
import adminRoutes from './routes/admin.js';
import analyticsRoutes from './routes/analytics.js';
import authRoutes from './routes/auth.js';

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(loggingMiddleware);
app.use(express.json());

// Database instance
const db = getDatabase();

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Affiliate Boss API is running!',
        timestamp: new Date().toISOString(),
        version: '4.0.0'
    });
});

// Use route modules
app.use('/api', dashboardRoutes);
app.use('/api', linksRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api', productsRoutes);
app.use('/api', commissionsRoutes);
app.use('/api', referralsRoutes);
app.use('/api', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);

// Catch-all for other API endpoints
app.all('/api/*', (req, res) => {
    res.json({
        success: true,
        message: `API endpoint ${req.path} (demo mode)`,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use(errorHandler);

export default app;
