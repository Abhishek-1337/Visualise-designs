import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth.middleware';
import * as userController from '../controllers/user.controller';

const router = express.Router();
router.use(authenticateToken);

router.get('/me', userController.getProfile);
router.put('/me', userController.updateProfile);
router.get('/', authorize('ADMIN', 'MANAGER', 'EMPLOYEE'), userController.getAllUsers);
router.put('/me/password', userController.changePassword);
router.get('/:id', userController.getUserById);
router.patch('/:id/role', authorize('ADMIN'), userController.updateUserRole);
router.patch('/:id/deactivate', authorize('ADMIN'), userController.deactivateUser);
router.patch('/:id/activate', authorize('ADMIN'), userController.activateUser);

export default router;
