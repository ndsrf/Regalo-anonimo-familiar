import express from 'express';
import {
  createGift,
  getMyGifts,
  getGroupWishlist,
  updateGift,
  deleteGift,
  markAsBought,
} from '../controllers/giftController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Gift management
router.post('/', createGift);
router.get('/group/:grupoId/my-gifts', getMyGifts);
router.get('/group/:grupoId/wishlist', getGroupWishlist);
router.put('/:giftId', updateGift);
router.delete('/:giftId', deleteGift);
router.put('/:giftId/buy', markAsBought);

export default router;
