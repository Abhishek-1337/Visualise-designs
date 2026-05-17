import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as taskController from '../controllers/task.controller';

const router = express.Router();
router.use(authenticateToken);

router.get('/', taskController.getAllTasks);
router.get('/stats', taskController.getTaskStats);
router.get('/my', taskController.getMyTasks);
router.get('/my/today', taskController.getTodaysTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.patch('/:id/status', taskController.updateTaskStatus);
router.delete('/:id', taskController.deleteTask);

export default router;
