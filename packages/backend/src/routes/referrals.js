import express from 'express';
import { ReferralsController } from '../controllers/referralsController.js';

const router = express.Router();

// Referrals routes
router.get('/', ReferralsController.getReferrals);
router.get('/link', ReferralsController.getReferralLink);
router.get('/program', ReferralsController.getReferralProgram);

export default router;
