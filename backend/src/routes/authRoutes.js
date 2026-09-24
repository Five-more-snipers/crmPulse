// @ts-check
import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, authController.me);
router.post('/refresh', authController.refresh);
router.get('/demo-accounts', authController.getDemoAccounts);

export default router;
