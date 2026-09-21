// @ts-check
import { Router } from 'express';
import { clientController } from '../controllers/clientController.js';

const router = Router();

router.get('/', clientController.getClients);
router.get('/:id', clientController.getClientById);
router.post('/', clientController.createClient);
router.put('/:id', clientController.updateClient);
router.patch('/:id/stage', clientController.updateClientStage);
router.delete('/:id', clientController.deleteClient);

export default router;
