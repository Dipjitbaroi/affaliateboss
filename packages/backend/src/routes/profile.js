import express from 'express';
import { ProfileController } from '../controllers/profileController.js';

const router = express.Router();

// Profile routes
router.get('/', ProfileController.getProfile);
router.put('/', ProfileController.updateProfile);
router.put('/settings', ProfileController.updateSettings);
router.get('/statistics', ProfileController.getStatistics);

export default router;
