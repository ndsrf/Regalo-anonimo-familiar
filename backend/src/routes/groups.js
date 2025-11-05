import express from 'express';
import {
  createGroup,
  getGroupByCode,
  joinGroup,
  getUserGroups,
  getGroupMembers,
} from '../controllers/groupController.js';
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

export default router;
