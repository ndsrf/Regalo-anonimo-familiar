import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
import { query } from './database.js';

dotenv.config();

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const result = await query('SELECT id, email, nombre FROM users WHERE id = $1', [payload.id]);

      if (result.rows.length === 0) {
        return done(null, false);
      }

      return done(null, result.rows[0]);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let result = await query('SELECT * FROM users WHERE google_id = $1', [profile.id]);

        if (result.rows.length > 0) {
          return done(null, result.rows[0]);
        }

        // Check if email already exists
        result = await query('SELECT * FROM users WHERE email = $1', [profile.emails[0].value]);

        if (result.rows.length > 0) {
          // Update existing user with Google ID
          result = await query(
            'UPDATE users SET google_id = $1 WHERE email = $2 RETURNING *',
            [profile.id, profile.emails[0].value]
          );
          return done(null, result.rows[0]);
        }

        // Create new user
        result = await query(
          'INSERT INTO users (email, google_id, nombre) VALUES ($1, $2, $3) RETURNING *',
          [profile.emails[0].value, profile.id, profile.displayName]
        );

        return done(null, result.rows[0]);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;
