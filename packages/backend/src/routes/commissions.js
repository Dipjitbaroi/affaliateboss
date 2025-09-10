import express from 'express';
import { CommissionsController } from '../controllers/commissionsController.js';

const router = express.Router();

// Commissions routes
router.get('/', CommissionsController.getCommissions);
router.get('/stats', CommissionsController.getCommissionStats);
router.get('/:id', CommissionsController.getCommission);
router.put('/:id/status', CommissionsController.updateCommissionStatus);

export default router;
