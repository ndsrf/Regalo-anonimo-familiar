import express from 'express';
import passport from 'passport';
import { register, login, googleCallback, metaCallback, getMe } from '../controllers/authController.js';
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

// Meta (Facebook/Instagram) OAuth
router.get(
  '/meta',
  passport.authenticate('facebook', {
    scope: ['email'],
    session: false,
  })
);

router.get(
  '/meta/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
  metaCallback
);

// Get current user
router.get('/me', requireAuth, getMe);

export default router;
