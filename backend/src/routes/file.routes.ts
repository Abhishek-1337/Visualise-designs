import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { upload, getAllFiles, getFileById, uploadFile, downloadFile, deleteFile, getContactFiles, getProjectFiles } from '../controllers/file.controller';

const router = express.Router();
router.use(authenticateToken);

router.get('/', getAllFiles);
router.get('/:id', getFileById);
router.get('/:id/download', downloadFile);
router.get('/contact/:contactId', getContactFiles);
router.get('/project/:projectId', getProjectFiles);
router.post('/', upload.single('file'), uploadFile);
router.delete('/:id', deleteFile);

export default router;
