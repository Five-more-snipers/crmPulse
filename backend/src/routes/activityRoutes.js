// @ts-check
import { Router } from 'express';
import { activityController } from '../controllers/activityController.js';

const router = Router();

router.get('/', activityController.getActivities);
router.post('/', activityController.createActivity);
router.post('/webhook-ping', activityController.pingWebhook);

export default router;
