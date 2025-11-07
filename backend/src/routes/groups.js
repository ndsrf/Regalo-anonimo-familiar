import express from 'express';
import {
  createGroup,
  getGroupByCode,
  joinGroup,
  getUserGroups,
  getGroupMembers,
  updateGroup,
} from '../controllers/groupController.js';
import {
  createPairings,
  getMyAssignment,
} from '../controllers/secretSantaController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Group management
router.post('/', createGroup);
router.get('/my-groups', getUserGroups);
router.get('/:codigoUrl', getGroupByCode);
router.post('/:codigoUrl/join', joinGroup);
router.get('/:grupoId/members', getGroupMembers);
router.put('/:grupoId/update', updateGroup);

// Secret Santa (Amigo Invisible) routes
router.post('/:grupoId/secret-santa/create-pairings', createPairings);
router.get('/:grupoId/secret-santa/my-assignment', getMyAssignment);

export default router;
