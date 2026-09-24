// @ts-check
import { Router } from 'express';
import { clientController } from '../controllers/clientController.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

// All client endpoints require valid JWT authentication
router.use(authenticateToken);

// Read endpoints accessible by all authenticated roles
router.get('/', clientController.getClients);
router.get('/:id', clientController.getClientById);

// Create client: Admin, Solutions Architect, TAM (DevOps excluded)
router.post('/', requireRole(['ADMIN', 'ARCHITECT', 'TAM']), clientController.createClient);

// Update client: All roles within their scope
router.put('/:id', clientController.updateClient);

// Update integration stage: Only Admin and Solutions Architect
router.patch('/:id/stage', requireRole(['ADMIN', 'ARCHITECT']), clientController.updateClientStage);

// Delete client: Exclusively Platform Administrator
router.delete('/:id', requireRole(['ADMIN']), clientController.deleteClient);

export default router;
