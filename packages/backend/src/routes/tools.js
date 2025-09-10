import express from 'express';
import { ToolsController } from '../controllers/toolsController.js';

const router = express.Router();

// Tools routes
router.post('/content', ToolsController.generateContent);
router.get('/qr', ToolsController.generateQRCode);

export default router;
