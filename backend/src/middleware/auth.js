import passport from 'passport';

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
