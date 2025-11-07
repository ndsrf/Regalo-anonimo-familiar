import { query } from '../config/database.js';
import { generateGroupCode } from '../utils/generateCode.js';

export async function createGroup(req, res) {
  try {
    const { nombreGrupo, gameMode, tipoCelebracion, fechaInicio } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!nombreGrupo || !gameMode || !tipoCelebracion || !fechaInicio) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Validate game mode
    const validGameModes = ['Lista de Deseos Anónimos', 'Amigo Invisible'];
    if (!validGameModes.includes(gameMode)) {
      return res.status(400).json({ error: 'Modo de juego inválido' });
    }

    // Validate celebration type
    const validTypes = ['Navidad', 'Reyes Magos', 'Boda', 'Cumpleaños', 'Otro'];
    if (!validTypes.includes(tipoCelebracion)) {
      return res.status(400).json({ error: 'Tipo de celebración inválido' });
    }

    // Generate unique code
    let codigoUrl = generateGroupCode();
    let isUnique = false;

    while (!isUnique) {
      const existing = await query('SELECT id FROM groups WHERE codigo_url = $1', [codigoUrl]);
      if (existing.rows.length === 0) {
        isUnique = true;
      } else {
        codigoUrl = generateGroupCode();
      }
    }

    // Create group
    const groupResult = await query(
      'INSERT INTO groups (nombre_grupo, game_mode, tipo_celebracion, fecha_inicio, codigo_url, creator_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nombreGrupo, gameMode, tipoCelebracion, fechaInicio, codigoUrl, userId]
    );

    const group = groupResult.rows[0];

    // Auto-join creator to the group
    await query('INSERT INTO memberships (usuario_id, grupo_id) VALUES ($1, $2)', [userId, group.id]);

    res.status(201).json({ group });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Error al crear grupo' });
  }
}

export async function getGroupByCode(req, res) {
  try {
    const { codigoUrl } = req.params;

    const result = await query(
      `SELECT g.*, u.nombre as creator_name
       FROM groups g
       JOIN users u ON g.creator_id = u.id
       WHERE g.codigo_url = $1`,
      [codigoUrl]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    const group = result.rows[0];

    // Check if user is a member
    const membershipResult = await query(
      'SELECT id FROM memberships WHERE usuario_id = $1 AND grupo_id = $2',
      [req.user.id, group.id]
    );

    const isMember = membershipResult.rows.length > 0;

    // Get member count
    const memberCountResult = await query(
      'SELECT COUNT(*) as count FROM memberships WHERE grupo_id = $1',
      [group.id]
    );

    res.json({
      group: {
        ...group,
        is_member: isMember,
        member_count: parseInt(memberCountResult.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Error al obtener grupo' });
  }
}

export async function joinGroup(req, res) {
  try {
    const { codigoUrl } = req.params;
    const userId = req.user.id;

    // Find group
    const groupResult = await query('SELECT id, game_mode, pairings_done FROM groups WHERE codigo_url = $1', [codigoUrl]);

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    const group = groupResult.rows[0];
    const groupId = group.id;

    // Check if Secret Santa pairings already done
    if (group.game_mode === 'Amigo Invisible' && group.pairings_done) {
      return res.status(403).json({ error: 'No es posible unirse. Los emparejamientos ya han sido realizados.' });
    }

    // Check if already a member
    const existingMembership = await query(
      'SELECT id FROM memberships WHERE usuario_id = $1 AND grupo_id = $2',
      [userId, groupId]
    );

    if (existingMembership.rows.length > 0) {
      return res.status(409).json({ error: 'Ya eres miembro de este grupo' });
    }

    // Join group
    await query('INSERT INTO memberships (usuario_id, grupo_id) VALUES ($1, $2)', [userId, groupId]);

    res.json({ message: 'Te has unido al grupo exitosamente' });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Error al unirse al grupo' });
  }
}

export async function getUserGroups(req, res) {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT g.*, u.nombre as creator_name,
       (SELECT COUNT(*) FROM memberships WHERE grupo_id = g.id) as member_count
       FROM groups g
       JOIN memberships m ON g.id = m.grupo_id
       JOIN users u ON g.creator_id = u.id
       WHERE m.usuario_id = $1 AND g.archived = FALSE
       ORDER BY g.created_at DESC`,
      [userId]
    );

    res.json({ groups: result.rows });
  } catch (error) {
    console.error('Get user groups error:', error);
    res.status(500).json({ error: 'Error al obtener grupos' });
  }
}

export async function getGroupMembers(req, res) {
  try {
    const { grupoId } = req.params;
    const userId = req.user.id;

    // Check if user is member
    const membershipCheck = await query(
      'SELECT id FROM memberships WHERE usuario_id = $1 AND grupo_id = $2',
      [userId, grupoId]
    );

    if (membershipCheck.rows.length === 0) {
      return res.status(403).json({ error: 'No eres miembro de este grupo' });
    }

    // Get members
    const result = await query(
      `SELECT u.id, u.nombre, u.email, m.joined_at
       FROM users u
       JOIN memberships m ON u.id = m.usuario_id
       WHERE m.grupo_id = $1
       ORDER BY m.joined_at ASC`,
      [grupoId]
    );

    res.json({ members: result.rows });
  } catch (error) {
    console.error('Get group members error:', error);
    res.status(500).json({ error: 'Error al obtener miembros' });
  }
}

export async function updateGroup(req, res) {
  try {
    const { grupoId } = req.params;
    const { nombreGrupo, tipoCelebracion, fechaInicio } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!nombreGrupo || !tipoCelebracion || !fechaInicio) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Validate celebration type
    const validTypes = ['Navidad', 'Reyes Magos', 'Boda', 'Cumpleaños', 'Otro'];
    if (!validTypes.includes(tipoCelebracion)) {
      return res.status(400).json({ error: 'Tipo de celebración inválido' });
    }

    // Check if group exists and user is the creator
    const groupResult = await query(
      'SELECT creator_id, archived FROM groups WHERE id = $1',
      [grupoId]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    const group = groupResult.rows[0];

    if (group.creator_id !== userId) {
      return res.status(403).json({ error: 'Solo el creador puede editar el grupo' });
    }

    if (group.archived) {
      return res.status(403).json({ error: 'No se puede editar un grupo archivado' });
    }

    // Update group
    const updateResult = await query(
      'UPDATE groups SET nombre_grupo = $1, tipo_celebracion = $2, fecha_inicio = $3 WHERE id = $4 RETURNING *',
      [nombreGrupo, tipoCelebracion, fechaInicio, grupoId]
    );

    res.json({ group: updateResult.rows[0] });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: 'Error al actualizar grupo' });
  }
}

export async function archiveGroup(req, res) {
  try {
    const { grupoId } = req.params;
    const userId = req.user.id;

    // Check if group exists and user is the creator
    const groupResult = await query(
      'SELECT creator_id, archived FROM groups WHERE id = $1',
      [grupoId]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    const group = groupResult.rows[0];

    if (group.creator_id !== userId) {
      return res.status(403).json({ error: 'Solo el creador puede archivar el grupo' });
    }

    if (group.archived) {
      return res.status(400).json({ error: 'El grupo ya está archivado' });
    }

    // Archive the group
    const updateResult = await query(
      'UPDATE groups SET archived = TRUE WHERE id = $1 RETURNING *',
      [grupoId]
    );

    res.json({
      message: 'Grupo archivado exitosamente',
      group: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Archive group error:', error);
    res.status(500).json({ error: 'Error al archivar grupo' });
  }
}

export async function getArchivedGroups(req, res) {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT g.*, u.nombre as creator_name,
       (SELECT COUNT(*) FROM memberships WHERE grupo_id = g.id) as member_count
       FROM groups g
       JOIN memberships m ON g.id = m.grupo_id
       JOIN users u ON g.creator_id = u.id
       WHERE m.usuario_id = $1 AND g.archived = TRUE
       ORDER BY g.created_at DESC`,
      [userId]
    );

    res.json({ groups: result.rows });
  } catch (error) {
    console.error('Get archived groups error:', error);
    res.status(500).json({ error: 'Error al obtener grupos archivados' });
  }
}
