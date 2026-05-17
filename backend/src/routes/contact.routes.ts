import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth.middleware';
import * as contactController from '../controllers/contact.controller';

const router = express.Router();
router.use(authenticateToken);

router.get('/', contactController.getAllContacts);
router.get('/stats', contactController.getContactStats);
router.get('/search', contactController.searchContacts);
router.get('/export', contactController.exportContacts);
router.get('/:id', contactController.getContactById);
router.post('/', contactController.createContact);
router.put('/:id', contactController.updateContact);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), contactController.deleteContact);

export default router;
