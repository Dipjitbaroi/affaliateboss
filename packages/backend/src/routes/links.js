import express from 'express';
import { LinksController } from '../controllers/linksController.js';

const router = express.Router();

// Links routes
router.get('/', LinksController.getLinks);
router.post('/', LinksController.createLink);
router.get('/:id', LinksController.getLink);
router.put('/:id', LinksController.updateLink);
router.delete('/:id', LinksController.deleteLink);

export default router;