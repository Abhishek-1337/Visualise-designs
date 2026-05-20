import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth.middleware';
import * as inviteController from '../controllers/invite.controller';

const router = express.Router();

router.post('/', authenticateToken, authorize('ADMIN', 'MANAGER'), inviteController.createInvite);
router.get('/', authenticateToken, authorize('ADMIN', 'MANAGER'), inviteController.getInvites);
router.get('/:token', inviteController.getInviteByToken);
router.post('/:token/accept', inviteController.acceptInvite);
router.patch('/:id/cancel', authenticateToken, authorize('ADMIN', 'MANAGER'), inviteController.cancelInvite);

export default router;
