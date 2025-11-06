import passport from 'passport';
import { query } from '../config/database.js';
import emailService from '../services/emailService.js';

export const requireAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Error de autenticación' });
    }

    if (!user) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    req.user = user;
    next();
  })(req, res, next);
};

export const requireVerifiedEmail = async (req, res, next) => {
  try {
    // Si Mailgun no está configurado, no requerir verificación
    if (!emailService.isConfigured) {
      return next();
    }

    // Get user email verification status
    const result = await query(
      'SELECT email_verified, google_id, meta_id FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    // OAuth users don't need email verification
    if (user.google_id || user.meta_id) {
      return next();
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({
        error: 'Debes verificar tu correo electrónico antes de poder agregar regalos',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    next();
  } catch (error) {
    console.error('Error checking email verification:', error);
    res.status(500).json({ error: 'Error al verificar estado del email' });
  }
};
