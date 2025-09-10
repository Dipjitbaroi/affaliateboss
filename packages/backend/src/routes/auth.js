import express from 'express';
import { AuthController } from '../controllers/authController.js';

const router = express.Router();

// Auth routes
router.post('/login', AuthController.login);
router.post('/signup', AuthController.signup);
router.get('/me', AuthController.getProfile);
router.post('/change-password', AuthController.changePassword);
router.post('/send-otp', AuthController.sendOTP);
router.post('/verify-otp', AuthController.verifyOTP);

export default router;
