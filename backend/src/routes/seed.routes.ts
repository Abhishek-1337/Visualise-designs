import { Router } from 'express';
import * as seedController from '../controllers/seed.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/', seedController.seedData);
router.post('/force', seedController.forceSeedData);

export default router;
