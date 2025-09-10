import express from 'express';
import { AnalyticsController } from '../controllers/analyticsController.js';

const router = express.Router();

// Analytics routes
router.get('/dashboard', AnalyticsController.getDashboardAnalytics);
router.get('/performance', AnalyticsController.getPerformanceAnalytics);
router.get('/geographic', AnalyticsController.getGeographicAnalytics);
router.get('/traffic', AnalyticsController.getTrafficAnalytics);
router.get('/conversion', AnalyticsController.getConversionAnalytics);
router.get('/revenue', AnalyticsController.getRevenueAnalytics);
router.get('/trends', AnalyticsController.getTrendAnalytics);
router.get('/reports', AnalyticsController.getReports);
router.get('/export', AnalyticsController.exportAnalytics);
router.post('/report/generate', AnalyticsController.generateCustomReport);

export default router;
