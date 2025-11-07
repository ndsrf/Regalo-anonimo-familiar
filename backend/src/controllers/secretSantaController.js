import { query } from '../config/database.js';
import emailService from '../services/emailService.js';

/**
 * Fisher-Yates shuffle algorithm for randomizing array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Create Secret Santa pairings for a group
 * Each member gives to the next person in a shuffled list
 */
export async function createPairings(req, res) {
  try {
    const { grupoId } = req.params;
    const userId = req.user.id;

    // Check if group exists and user is the creator
    const groupResult = await query(
      'SELECT * FROM groups WHERE id = $1',
      [grupoId]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    const group = groupResult.rows[0];

    if (group.creator_id !== userId) {
      return res.status(403).json({ error: 'Solo el creador puede realizar los emparejamientos' });
    }

    // Check if game mode is Secret Santa
    if (group.game_mode !== 'Amigo Invisible') {
      return res.status(400).json({ error: 'Este grupo no está en modo Amigo Invisible' });
    }

    // Check if pairings already done
    if (group.pairings_done) {
      return res.status(400).json({ error: 'Los emparejamientos ya han sido realizados' });
    }

    // Get all members
    const membersResult = await query(
      `SELECT u.id, u.nombre, u.email
       FROM users u
       JOIN memberships m ON u.id = m.usuario_id
       WHERE m.grupo_id = $1
       ORDER BY m.joined_at ASC`,
      [grupoId]
    );

    const members = membersResult.rows;

    // Need at least 2 members for Secret Santa
    if (members.length < 2) {
      return res.status(400).json({ error: 'Se necesitan al menos 2 miembros para realizar el sorteo' });
    }

    // Shuffle members to randomize pairings
    const shuffledMembers = shuffleArray(members);

    // Create pairings (circular: each person gives to the next)
    const pairings = [];
    for (let i = 0; i < shuffledMembers.length; i++) {
      const giver = shuffledMembers[i];
      const receiver = shuffledMembers[(i + 1) % shuffledMembers.length];

      await query(
        'INSERT INTO secret_santa_pairings (grupo_id, giver_id, receiver_id) VALUES ($1, $2, $3)',
        [grupoId, giver.id, receiver.id]
      );

      pairings.push({
        giver: giver.nombre,
        receiver: receiver.nombre,
        giverEmail: giver.email,
      });
    }

    // Mark pairings as done
    await query(
      'UPDATE groups SET pairings_done = TRUE WHERE id = $1',
      [grupoId]
    );

    // Send emails to all participants
    for (const pairing of pairings) {
      await emailService.sendSecretSantaAssignment(
        pairing.giverEmail,
        pairing.giver,
        pairing.receiver,
        group.nombre_grupo,
        group.tipo_celebracion,
        new Date(group.fecha_inicio).toLocaleDateString('es-ES')
      );
    }

    res.json({
      message: 'Emparejamientos realizados exitosamente',
      pairingsCount: pairings.length
    });
  } catch (error) {
    console.error('Create pairings error:', error);
    res.status(500).json({ error: 'Error al crear emparejamientos' });
  }
}

/**
 * Get the assigned person for the current user
 */
export async function getMyAssignment(req, res) {
  try {
    const { grupoId } = req.params;
    const userId = req.user.id;

    // Check if user is a member
    const membershipCheck = await query(
      'SELECT id FROM memberships WHERE usuario_id = $1 AND grupo_id = $2',
      [userId, grupoId]
    );

    if (membershipCheck.rows.length === 0) {
      return res.status(403).json({ error: 'No eres miembro de este grupo' });
    }

    // Check if group is in Secret Santa mode
    const groupResult = await query(
      'SELECT game_mode, pairings_done FROM groups WHERE id = $1',
      [grupoId]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    const group = groupResult.rows[0];

    if (group.game_mode !== 'Amigo Invisible') {
      return res.status(400).json({ error: 'Este grupo no está en modo Amigo Invisible' });
    }

    if (!group.pairings_done) {
      return res.json({
        hasPairing: false,
        message: 'Los emparejamientos aún no han sido realizados'
      });
    }

    // Get the assignment
    const pairingResult = await query(
      `SELECT u.nombre, u.email
       FROM secret_santa_pairings ssp
       JOIN users u ON ssp.receiver_id = u.id
       WHERE ssp.grupo_id = $1 AND ssp.giver_id = $2`,
      [grupoId, userId]
    );

    if (pairingResult.rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró tu emparejamiento' });
    }

    const receiver = pairingResult.rows[0];

    res.json({
      hasPairing: true,
      receiver: {
        nombre: receiver.nombre,
      }
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ error: 'Error al obtener emparejamiento' });
  }
}
