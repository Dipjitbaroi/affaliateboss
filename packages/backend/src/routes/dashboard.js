import express from 'express';
import { DashboardController } from '../controllers/dashboardController.js';

const router = express.Router();

// Dashboard routes
router.get('/dashboard', DashboardController.getDashboardStats);
router.get('/analytics', DashboardController.getAnalytics);

export default router;
