import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as dashboardController from '../controllers/dashboard.controller';

const router = express.Router();
router.use(authenticateToken);

router.get('/', dashboardController.getDashboard);
router.get('/financial', dashboardController.getFinancialOverview);
router.get('/tasks', dashboardController.getTodaysTasks);
router.get('/activity', dashboardController.getRecentActivity);

export default router;
