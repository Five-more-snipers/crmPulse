// @ts-check
import { Router } from 'express';
import { activityController } from '../controllers/activityController.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

// All activity and monitoring endpoints require valid JWT authentication
router.use(authenticateToken);

// Read activities: All authenticated roles
router.get('/', activityController.getActivities);

// Record activity/incident: Admin, TAM (meetings/evaluations), and DevOps (incident logs)
router.post('/', requireRole(['ADMIN', 'TAM', 'DEVOPS']), activityController.createActivity);

// Webhook probe test: Admin, Solutions Architect, and DevOps / SRE
router.post('/webhook-ping', requireRole(['ADMIN', 'ARCHITECT', 'DEVOPS']), activityController.pingWebhook);

export default router;
