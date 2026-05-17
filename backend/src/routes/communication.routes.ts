import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as communicationController from '../controllers/communication.controller';

const router = express.Router();
router.use(authenticateToken);

router.get('/', communicationController.getAllCommunications);
router.get('/stats', communicationController.getCommunicationStats);
router.get('/contact/:contactId', communicationController.getContactCommunications);
router.get('/:id', communicationController.getCommunicationById);
router.post('/', communicationController.createCommunication);
router.put('/:id', communicationController.updateCommunication);
router.delete('/:id', communicationController.deleteCommunication);

export default router;
