import { Router } from 'express';
import * as crmController from '../controllers/crm.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/stats', crmController.getCRMStats);
router.get('/dashboard', crmController.getDashboard);

router.get('/contacts', crmController.getAllContacts);
router.get('/contacts/:id', crmController.getContactById);
router.post('/contacts', crmController.createContact);
router.put('/contacts/:id', crmController.updateContact);
router.delete('/contacts/:id', crmController.deleteContact);

router.get('/deals', crmController.getAllDeals);
router.get('/deals/:id', crmController.getDealById);
router.post('/deals', crmController.createDeal);
router.put('/deals/:id', crmController.updateDeal);
router.patch('/deals/:id/stage', crmController.updateDeal);
router.post('/deals/:id/convert', crmController.convertDealToProject);
router.delete('/deals/:id', crmController.deleteDeal);

router.get('/projects', crmController.getAllProjects);
router.get('/projects/:id', crmController.getProjectById);
router.post('/projects', crmController.createProject);
router.put('/projects/:id', crmController.updateProject);
router.delete('/projects/:id', crmController.deleteProject);

router.get('/tasks', crmController.getAllTasks);
router.get('/tasks/summary', crmController.getTaskSummaries);
router.post('/tasks', crmController.createTask);
router.put('/tasks/:id', crmController.updateTask);
router.delete('/tasks/:id', crmController.deleteTask);

router.get('/activities', crmController.getActivities);

export default router;
