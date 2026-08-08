import { Router } from 'express';
import { authenticateToken, authorize } from '../middleware/auth.middleware';
import * as permissionController from '../controllers/permission.controller';

const router = Router();

router.use(authenticateToken);

router.get('/', permissionController.getPermissions);
router.put('/', authorize('ADMIN'), permissionController.updatePermissions);

export default router;
