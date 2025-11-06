import express from 'express';
import {
  createGift,
  getMyGifts,
  getGroupWishlist,
  updateGift,
  deleteGift,
  markAsBought,
  unmarkAsBought,
} from '../controllers/giftController.js';
import { requireAuth, requireVerifiedEmail } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Gift management (crear regalo requiere email verificado)
router.post('/', requireVerifiedEmail, createGift);
router.get('/group/:grupoId/my-gifts', getMyGifts);
router.get('/group/:grupoId/wishlist', getGroupWishlist);
router.put('/:giftId', updateGift);
router.delete('/:giftId', deleteGift);
router.put('/:giftId/buy', markAsBought);
router.put('/:giftId/unbuy', unmarkAsBought);

export default router;
