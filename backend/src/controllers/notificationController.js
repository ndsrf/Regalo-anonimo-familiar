import { query } from '../config/database.js';

export async function getUnreadNotifications(req, res) {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT n.*, g.nombre_grupo
       FROM notifications n
       LEFT JOIN groups g ON n.grupo_id = g.id
       WHERE n.target_user_id = $1 AND n.is_read = false
       ORDER BY n.created_at DESC`,
      [userId]
    );

    res.json({ notifications: result.rows });
  } catch (error) {
    console.error('Get unread notifications error:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
}

export async function markNotificationsAsRead(req, res) {
  try {
    const userId = req.user.id;
    const { notificationIds } = req.body;

    if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      await query(
        'UPDATE notifications SET is_read = true WHERE id = ANY($1) AND target_user_id = $2',
        [notificationIds, userId]
      );
    } else {
      // Mark all user's notifications as read
      await query('UPDATE notifications SET is_read = true WHERE target_user_id = $1', [userId]);
    }

    res.json({ message: 'Notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Mark notifications as read error:', error);
    res.status(500).json({ error: 'Error al marcar notificaciones' });
  }
}

export async function getAllNotifications(req, res) {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT n.*, g.nombre_grupo
       FROM notifications n
       LEFT JOIN groups g ON n.grupo_id = g.id
       WHERE n.target_user_id = $1
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json({ notifications: result.rows });
  } catch (error) {
    console.error('Get all notifications error:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
}
