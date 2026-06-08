import { Router } from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.middleware';
import * as fileController from '../controllers/file.controller';

const upload = multer({ dest: process.env.UPLOAD_DIR || './uploads' });
const router = Router();

router.use(authenticateToken);

router.get('/', fileController.getAllFiles);
router.get('/:id', fileController.getFileById);
router.get('/:id/download', fileController.downloadFile);
router.post('/', upload.single('file'), fileController.uploadFile);
router.delete('/:id', fileController.deleteFile);

export default router;
