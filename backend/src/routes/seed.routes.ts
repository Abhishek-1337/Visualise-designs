import { Router } from 'express';
import * as seedController from '../controllers/seed.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/', requirePermission('data.seed'), seedController.seedData);
router.post('/force', requirePermission('data.reseed'), seedController.forceSeedData);

export default router;
