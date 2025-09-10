import express from 'express';
import { AdminController } from '../controllers/adminController.js';

const router = express.Router();

// Admin routes
router.get('/overview', AdminController.getOverview);
router.get('/affiliates', AdminController.getAffiliates);
router.put('/affiliates/:userId/status', AdminController.updateAffiliateStatus);
router.get('/applications', AdminController.getApplications);
router.put('/applications/:applicationId/process', AdminController.processApplication);
router.get('/payouts', AdminController.getPayouts);
router.put('/payouts/:payoutId/process', AdminController.processPayout);

export default router;
