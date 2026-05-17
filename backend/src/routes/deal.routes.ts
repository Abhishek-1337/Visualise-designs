import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as dealController from '../controllers/deal.controller';

const router = express.Router();
router.use(authenticateToken);

router.get('/', dealController.getAllDeals);
router.get('/pipeline', dealController.getPipelineView);
router.get('/stats', dealController.getDealStats);
router.get('/:id', dealController.getDealById);
router.post('/', dealController.createDeal);
router.put('/:id', dealController.updateDeal);
router.patch('/:id/stage', dealController.updateDealStage);
router.delete('/:id', dealController.deleteDeal);

export default router;
