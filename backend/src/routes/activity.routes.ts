import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as activityController from '../controllers/activity.controller';

const router = express.Router();
router.use(authenticateToken);

router.get('/', activityController.getActivities);
router.get('/recent', activityController.getRecentActivities);
router.post('/', activityController.createActivity);

export default router;
