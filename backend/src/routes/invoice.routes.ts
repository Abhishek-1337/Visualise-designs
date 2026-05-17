import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as invoiceController from '../controllers/invoice.controller';

const router = express.Router();
router.use(authenticateToken);

router.get('/', invoiceController.getAllInvoices);
router.get('/stats', invoiceController.getInvoiceStats);
router.get('/contact/:contactId', invoiceController.getContactInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.post('/', invoiceController.createInvoice);
router.put('/:id', invoiceController.updateInvoice);
router.patch('/:id/status', invoiceController.updateInvoiceStatus);
router.delete('/:id', invoiceController.deleteInvoice);

export default router;
