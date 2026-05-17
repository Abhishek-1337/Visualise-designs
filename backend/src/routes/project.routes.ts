import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as projectController from '../controllers/project.controller';

const router = express.Router();
router.use(authenticateToken);

router.get('/', projectController.getAllProjects);
router.get('/stats', projectController.getProjectStats);
router.get('/:id', projectController.getProjectById);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

router.post('/:id/milestones', projectController.createMilestone);
router.put('/milestones/:milestoneId', projectController.updateMilestone);
router.patch('/milestones/:milestoneId/complete', projectController.completeMilestone);
router.delete('/milestones/:milestoneId', projectController.deleteMilestone);

router.post('/:id/members', projectController.addMember);
router.delete('/:id/members/:userId', projectController.removeMember);

export default router;
