import express from 'express';
import passport from 'passport';
import { register, login, googleCallback, getMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Email/Password authentication
router.post('/register', register);
router.post('/login', login);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleCallback
);

// Get current user
router.get('/me', requireAuth, getMe);

export default router;
