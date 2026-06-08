import { Router } from 'express';
import { authenticateToken, authorize } from '../middleware/auth.middleware';
import * as invoiceController from '../controllers/invoice.controller';

const router = Router();

router.use(authenticateToken);

router.get('/stats', invoiceController.getInvoiceStats);
router.get('/', invoiceController.getInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.post('/', authorize('ADMIN', 'MANAGER'), invoiceController.createInvoice);
router.put('/:id', authorize('ADMIN', 'MANAGER'), invoiceController.updateInvoice);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), invoiceController.deleteInvoice);

export default router;
