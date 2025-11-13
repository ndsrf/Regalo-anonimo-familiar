import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../config/database.js';
import emailService from '../services/emailService.js';

const SALT_ROUNDS = 10;

export async function register(req, res) {
  try {
    const { email, password, nombre } = req.body;

    // Validate input
    if (!email || !password || !nombre) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, nombre, email_verified, email_verification_token, email_verification_expires)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, nombre, email_verified`,
      [email, passwordHash, nombre, false, verificationToken, verificationExpires]
    );

    const user = result.rows[0];

    // Send verification email (fire and forget - no esperar)
    emailService.sendVerificationEmail({
      to: email,
      name: nombre,
      token: verificationToken,
    }).catch(err => console.error('Error enviando email de verificación:', err));

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        email_verified: user.email_verified,
      },
      message: emailService.isConfigured
        ? 'Usuario registrado. Por favor verifica tu correo electrónico para poder agregar regalos.'
        : 'Usuario registrado exitosamente.',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Find user
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Check if user has password (might be Google-only)
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Por favor inicia sesión con Google' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

export function googleCallback(req, res) {
  try {
    // User is authenticated by passport
    const user = req.user;

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Get returnTo from state parameter
    const returnTo = req.query.state || '';

    // Redirect to frontend with token and returnTo
    let redirectUrl = `${process.env.FRONTEND_URL}/oauth-callback?token=${token}`;
    if (returnTo) {
      redirectUrl += `&returnTo=${encodeURIComponent(returnTo)}`;
    }
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
}

export function metaCallback(req, res) {
  try {
    // User is authenticated by passport
    const user = req.user;

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Get returnTo from state parameter
    const returnTo = req.query.state || '';

    // Redirect to frontend with token and returnTo
    let redirectUrl = `${process.env.FRONTEND_URL}/oauth-callback-meta?token=${token}`;
    if (returnTo) {
      redirectUrl += `&returnTo=${encodeURIComponent(returnTo)}`;
    }
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Meta callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
}

export async function getMe(req, res) {
  try {
    const result = await query(
      'SELECT id, email, nombre, email_verified, google_id, meta_id FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token de verificación requerido' });
    }

    // Find user with this token
    const result = await query(
      'SELECT id, email, nombre, email_verification_expires FROM users WHERE email_verification_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Token de verificación inválido' });
    }

    const user = result.rows[0];

    // Check if token expired
    if (new Date() > new Date(user.email_verification_expires)) {
      return res.status(400).json({ error: 'El token de verificación ha expirado' });
    }

    // Mark email as verified and clear token
    await query(
      'UPDATE users SET email_verified = TRUE, email_verification_token = NULL, email_verification_expires = NULL WHERE id = $1',
      [user.id]
    );

    res.json({
      success: true,
      message: '¡Email verificado exitosamente! Ya puedes agregar regalos a tu lista de deseos.',
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Error al verificar email' });
  }
}

export async function resendVerificationEmail(req, res) {
  try {
    const userId = req.user.id;

    // Get user info
    const result = await query(
      'SELECT id, email, nombre, email_verified, google_id, meta_id FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({ error: 'El email ya está verificado' });
    }

    // Check if OAuth user (they don't need email verification)
    if (user.google_id || user.meta_id) {
      return res.status(400).json({ error: 'Los usuarios de OAuth no necesitan verificar email' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Update token in database
    await query(
      'UPDATE users SET email_verification_token = $1, email_verification_expires = $2 WHERE id = $3',
      [verificationToken, verificationExpires, userId]
    );

    // Send verification email
    const emailResult = await emailService.sendVerificationEmail({
      to: user.email,
      name: user.nombre,
      token: verificationToken,
    });

    if (!emailResult.success) {
      if (emailResult.reason === 'not_configured') {
        return res.status(503).json({
          error: 'El servicio de email no está configurado. Contacta al administrador.',
        });
      }
      return res.status(500).json({ error: 'Error al enviar email de verificación' });
    }

    res.json({
      success: true,
      message: 'Email de verificación enviado. Revisa tu bandeja de entrada.',
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({ error: 'Error al reenviar email de verificación' });
  }
}

// Magic Link Authentication Functions

export async function verifyMagicToken(req, res) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: 'Token requerido' });
    }

    // Find invitation token
    const result = await query(
      `SELECT it.*, g.nombre_grupo, g.game_mode, g.tipo_celebracion, u.nombre as inviter_name
       FROM invitation_tokens it
       JOIN groups g ON it.grupo_id = g.id
       JOIN users u ON it.invited_by = u.id
       WHERE it.token = $1 AND it.used = FALSE`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invitación no encontrada o ya utilizada' });
    }

    const invitation = result.rows[0];

    // Check if token expired
    if (new Date() > new Date(invitation.expires_at)) {
      return res.status(400).json({ error: 'La invitación ha expirado' });
    }

    // Check if user with this email already exists
    const userResult = await query('SELECT id, nombre, email FROM users WHERE LOWER(email) = $1', [
      invitation.email.toLowerCase(),
    ]);

    res.json({
      invitation: {
        email: invitation.email,
        groupName: invitation.nombre_grupo,
        gameMode: invitation.game_mode,
        celebrationType: invitation.tipo_celebracion,
        inviterName: invitation.inviter_name,
        userExists: userResult.rows.length > 0,
      },
    });
  } catch (error) {
    console.error('Verify magic token error:', error);
    res.status(500).json({ error: 'Error al verificar invitación' });
  }
}

export async function registerViaMagicLink(req, res) {
  try {
    const { token } = req.params;
    const { nombre, password } = req.body;

    if (!token || !nombre || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Find and validate invitation token
    const invitationResult = await query(
      `SELECT it.*, g.nombre_grupo, g.game_mode, g.id as grupo_id
       FROM invitation_tokens it
       JOIN groups g ON it.grupo_id = g.id
       WHERE it.token = $1 AND it.used = FALSE`,
      [token]
    );

    if (invitationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invitación no encontrada o ya utilizada' });
    }

    const invitation = invitationResult.rows[0];

    // Check if token expired
    if (new Date() > new Date(invitation.expires_at)) {
      return res.status(400).json({ error: 'La invitación ha expirado' });
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE LOWER(email) = $1', [
      invitation.email.toLowerCase(),
    ]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'El usuario ya está registrado. Por favor inicia sesión.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user (OAuth users have verified emails, so set to true for consistency)
    const userResult = await query(
      `INSERT INTO users (email, password_hash, nombre, email_verified)
       VALUES ($1, $2, $3, TRUE)
       RETURNING id, email, nombre, email_verified`,
      [invitation.email.toLowerCase(), passwordHash, nombre]
    );

    const user = userResult.rows[0];

    // Join user to group
    await query('INSERT INTO memberships (usuario_id, grupo_id) VALUES ($1, $2)', [
      user.id,
      invitation.grupo_id,
    ]);

    // Mark invitation as used
    await query('UPDATE invitation_tokens SET used = TRUE, used_at = NOW() WHERE token = $1', [token]);

    // Generate JWT
    const jwtToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        email_verified: user.email_verified,
      },
      groupId: invitation.grupo_id,
      message: 'Usuario registrado y agregado al grupo exitosamente',
    });
  } catch (error) {
    console.error('Register via magic link error:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
}

export async function joinGroupViaMagicLink(req, res) {
  try {
    const { token } = req.params;
    const userId = req.user?.id; // Optional - may not be logged in for Secret Santa

    if (!token) {
      return res.status(400).json({ error: 'Token requerido' });
    }

    // Find and validate invitation token
    const invitationResult = await query(
      `SELECT it.*, g.nombre_grupo, g.game_mode, g.id as grupo_id, g.pairings_done
       FROM invitation_tokens it
       JOIN groups g ON it.grupo_id = g.id
       WHERE it.token = $1 AND it.used = FALSE`,
      [token]
    );

    if (invitationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invitación no encontrada o ya utilizada' });
    }

    const invitation = invitationResult.rows[0];

    // Check if token expired
    if (new Date() > new Date(invitation.expires_at)) {
      return res.status(400).json({ error: 'La invitación ha expirado' });
    }

    // Find user by email from invitation
    const userResult = await query('SELECT id, nombre, email FROM users WHERE LOWER(email) = $1', [
      invitation.email.toLowerCase(),
    ]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuario no encontrado. Por favor completa tu registro primero.',
        requiresRegistration: true,
      });
    }

    const user = userResult.rows[0];

    // Check if user is already a member
    const membershipCheck = await query(
      'SELECT id FROM memberships WHERE usuario_id = $1 AND grupo_id = $2',
      [user.id, invitation.grupo_id]
    );

    if (membershipCheck.rows.length > 0) {
      // Mark invitation as used anyway
      await query('UPDATE invitation_tokens SET used = TRUE, used_at = NOW() WHERE token = $1', [token]);

      return res.status(200).json({
        message: 'Ya eres miembro de este grupo',
        groupId: invitation.grupo_id,
        alreadyMember: true,
      });
    }

    // Check if Secret Santa pairings already done (prevent joining after pairings)
    if (invitation.game_mode === 'Amigo Invisible' && invitation.pairings_done) {
      return res.status(403).json({
        error: 'No es posible unirse. Los emparejamientos de Amigo Invisible ya han sido realizados.',
      });
    }

    // Join user to group
    await query('INSERT INTO memberships (usuario_id, grupo_id) VALUES ($1, $2)', [
      user.id,
      invitation.grupo_id,
    ]);

    // Mark invitation as used
    await query('UPDATE invitation_tokens SET used = TRUE, used_at = NOW() WHERE token = $1', [token]);

    res.json({
      message: 'Te has unido al grupo exitosamente',
      groupId: invitation.grupo_id,
      groupName: invitation.nombre_grupo,
      gameMode: invitation.game_mode,
    });
  } catch (error) {
    console.error('Join group via magic link error:', error);
    res.status(500).json({ error: 'Error al unirse al grupo' });
  }
}
