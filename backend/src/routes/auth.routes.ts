import express from 'express';
import {
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback,
  microsoftAuth,
  microsoftCallback,
  verifyToken,
  getOAuthConfig,
  register,
  tenantRegister,
  login
} from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', register);
router.post('/tenant/register', tenantRegister);
router.post('/login', login);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/github', githubAuth);
router.get('/github/callback', githubCallback);
router.get('/microsoft', microsoftAuth);
router.get('/microsoft/callback', microsoftCallback);
router.get('/verify', verifyToken);
router.get('/config', getOAuthConfig);

export default router;
