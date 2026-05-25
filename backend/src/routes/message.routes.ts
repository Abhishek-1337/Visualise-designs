import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as messageController from '../controllers/message.controller';

const router = express.Router();
router.use(authenticateToken);

router.get('/conversations', messageController.getConversations);
router.get('/:userId', messageController.getMessages);
router.post('/', messageController.sendMessage);

export default router;
