import { query } from '../config/database.js';
import { scrapeImageFromUrl } from '../utils/imageScraper.js';
import emailService from '../services/emailService.js';

export async function createGift(req, res) {
  try {
    const { nombre, descripcion, url, grupoId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!nombre || !grupoId) {
      return res.status(400).json({ error: 'Nombre y grupoId son requeridos' });
    }

    // Check if user is member of the group
    const membershipCheck = await query(
      'SELECT id FROM memberships WHERE usuario_id = $1 AND grupo_id = $2',
      [userId, grupoId]
    );

    if (membershipCheck.rows.length === 0) {
      return res.status(403).json({ error: 'No eres miembro de este grupo' });
    }

    // Check if group is archived
    const groupCheck = await query(
      'SELECT archived FROM groups WHERE id = $1',
      [grupoId]
    );

    if (groupCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    if (groupCheck.rows[0].archived) {
      return res.status(403).json({ error: 'No se pueden añadir regalos a un grupo archivado' });
    }

    // Scrape image if URL provided
    let imageUrl = null;
    if (url) {
      imageUrl = await scrapeImageFromUrl(url);
    }

    // Create gift
    const result = await query(
      'INSERT INTO gifts (nombre, descripcion, url, image_url, solicitante_id, grupo_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nombre, descripcion || null, url || null, imageUrl, userId, grupoId]
    );

    res.status(201).json({ gift: result.rows[0] });
  } catch (error) {
    console.error('Create gift error:', error);
    res.status(500).json({ error: 'Error al crear regalo' });
  }
}

export async function getMyGifts(req, res) {
  try {
    const { grupoId } = req.params;
    const userId = req.user.id;

    // Check if user is member of the group
    const membershipCheck = await query(
      'SELECT id FROM memberships WHERE usuario_id = $1 AND grupo_id = $2',
      [userId, grupoId]
    );

    if (membershipCheck.rows.length === 0) {
      return res.status(403).json({ error: 'No eres miembro de este grupo' });
    }

    // Get user's gifts (including those marked as deleted)
    const result = await query(
      `SELECT * FROM gifts
       WHERE solicitante_id = $1 AND grupo_id = $2 AND is_deleted_by_solicitante = false
       ORDER BY created_at DESC`,
      [userId, grupoId]
    );

    res.json({ gifts: result.rows });
  } catch (error) {
    console.error('Get my gifts error:', error);
    res.status(500).json({ error: 'Error al obtener regalos' });
  }
}

export async function getGroupWishlist(req, res) {
  try {
    const { grupoId } = req.params;
    const userId = req.user.id;

    // Check if user is member of the group
    const membershipCheck = await query(
      'SELECT id FROM memberships WHERE usuario_id = $1 AND grupo_id = $2',
      [userId, grupoId]
    );

    if (membershipCheck.rows.length === 0) {
      return res.status(403).json({ error: 'No eres miembro de este grupo' });
    }

    // Check if fecha_inicio has passed
    const groupResult = await query(
      'SELECT fecha_inicio, nombre_grupo, tipo_celebracion FROM groups WHERE id = $1',
      [grupoId]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    const group = groupResult.rows[0];
    const fechaInicio = new Date(group.fecha_inicio);
    const now = new Date();

    if (now < fechaInicio) {
      return res.json({
        gifts: [],
        message: 'La lista estará disponible a partir de la fecha de inicio',
        fecha_inicio: fechaInicio,
      });
    }

    // Check if we need to send event date notification
    // Only send if fecha_inicio is today and we haven't sent it yet
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fechaInicioDate = new Date(group.fecha_inicio);
    fechaInicioDate.setHours(0, 0, 0, 0);

    if (today.getTime() === fechaInicioDate.getTime()) {
      // Check if we already sent notification for this user
      const membershipResult = await query(
        'SELECT last_event_notification_sent FROM memberships WHERE usuario_id = $1 AND grupo_id = $2',
        [userId, grupoId]
      );

      if (
        membershipResult.rows.length > 0 &&
        membershipResult.rows[0].last_event_notification_sent !== fechaInicioDate.toISOString().split('T')[0]
      ) {
        // Get all members to send notifications
        const membersResult = await query(
          `SELECT u.id, u.email, u.nombre
           FROM users u
           JOIN memberships m ON u.id = m.usuario_id
           WHERE m.grupo_id = $1`,
          [grupoId]
        );

        // Send email notifications to all members (fire and forget)
        membersResult.rows.forEach(member => {
          // Update last notification sent
          query(
            'UPDATE memberships SET last_event_notification_sent = $1 WHERE usuario_id = $2 AND grupo_id = $3',
            [fechaInicioDate.toISOString().split('T')[0], member.id, grupoId]
          ).catch(err => console.error('Error actualizando fecha de notificación:', err));

          // Send email
          emailService
            .sendEventDateNotification({
              to: member.email,
              name: member.nombre,
              groupName: group.nombre_grupo,
              eventDate: group.fecha_inicio,
              eventType: group.tipo_celebracion,
            })
            .catch(err => console.error('Error enviando email de fecha de evento:', err));
        });
      }
    }

    // Get anonymous wishlist
    // Exclude: own gifts, deleted gifts
    // Include: ALL gifts from other users (showing purchase status)
    const result = await query(
      `SELECT id, nombre, descripcion, url, image_url, created_at, comprador_id
       FROM gifts
       WHERE grupo_id = $1
       AND solicitante_id != $2
       AND is_deleted_by_solicitante = false
       ORDER BY RANDOM()`,
      [grupoId, userId]
    );

    res.json({ gifts: result.rows });
  } catch (error) {
    console.error('Get group wishlist error:', error);
    res.status(500).json({ error: 'Error al obtener lista de deseos' });
  }
}

export async function updateGift(req, res) {
  try {
    const { giftId } = req.params;
    const { nombre, descripcion, url } = req.body;
    const userId = req.user.id;

    // Find gift
    const giftResult = await query('SELECT * FROM gifts WHERE id = $1', [giftId]);

    if (giftResult.rows.length === 0) {
      return res.status(404).json({ error: 'Regalo no encontrado' });
    }

    const gift = giftResult.rows[0];

    // Check if user is the solicitante
    if (gift.solicitante_id !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para editar este regalo' });
    }

    // Check if group is archived
    const groupCheck = await query(
      'SELECT archived FROM groups WHERE id = $1',
      [gift.grupo_id]
    );

    if (groupCheck.rows.length > 0 && groupCheck.rows[0].archived) {
      return res.status(403).json({ error: 'No se pueden modificar regalos en un grupo archivado' });
    }

    // Check if someone already bought it (send notification)
    if (gift.comprador_id !== null) {
      await query(
        `INSERT INTO notifications (target_user_id, message, grupo_id, original_gift_name)
         VALUES ($1, $2, $3, $4)`,
        [
          gift.comprador_id,
          `¡Atención! El regalo "${gift.nombre}" que habías comprado ha sido MODIFICADO por el solicitante.`,
          gift.grupo_id,
          gift.nombre,
        ]
      );

      // Send email notification
      const compradorResult = await query(
        'SELECT email, nombre FROM users WHERE id = $1',
        [gift.comprador_id]
      );
      const grupoResult = await query(
        'SELECT nombre_grupo FROM groups WHERE id = $1',
        [gift.grupo_id]
      );

      if (compradorResult.rows.length > 0 && grupoResult.rows.length > 0) {
        emailService
          .sendGiftChangeNotification({
            to: compradorResult.rows[0].email,
            name: compradorResult.rows[0].nombre,
            giftName: gift.nombre,
            action: 'updated',
            groupName: grupoResult.rows[0].nombre_grupo,
          })
          .catch(err => console.error('Error enviando email de cambio de regalo:', err));
      }
    }

    // Scrape new image if URL changed
    let imageUrl = gift.image_url;
    if (url && url !== gift.url) {
      const scrapedImage = await scrapeImageFromUrl(url);
      if (scrapedImage) {
        imageUrl = scrapedImage;
      }
    }

    // Update gift
    const result = await query(
      'UPDATE gifts SET nombre = $1, descripcion = $2, url = $3, image_url = $4 WHERE id = $5 RETURNING *',
      [nombre, descripcion || null, url || null, imageUrl, giftId]
    );

    res.json({ gift: result.rows[0] });
  } catch (error) {
    console.error('Update gift error:', error);
    res.status(500).json({ error: 'Error al actualizar regalo' });
  }
}

export async function deleteGift(req, res) {
  try {
    const { giftId } = req.params;
    const userId = req.user.id;

    // Find gift
    const giftResult = await query('SELECT * FROM gifts WHERE id = $1', [giftId]);

    if (giftResult.rows.length === 0) {
      return res.status(404).json({ error: 'Regalo no encontrado' });
    }

    const gift = giftResult.rows[0];

    // Check if user is the solicitante
    if (gift.solicitante_id !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este regalo' });
    }

    // Check if group is archived
    const groupCheck = await query(
      'SELECT archived FROM groups WHERE id = $1',
      [gift.grupo_id]
    );

    if (groupCheck.rows.length > 0 && groupCheck.rows[0].archived) {
      return res.status(403).json({ error: 'No se pueden eliminar regalos en un grupo archivado' });
    }

    // Check if someone already bought it
    if (gift.comprador_id !== null) {
      // Send notification to buyer
      await query(
        `INSERT INTO notifications (target_user_id, message, grupo_id, original_gift_name)
         VALUES ($1, $2, $3, $4)`,
        [
          gift.comprador_id,
          `¡Atención! El regalo "${gift.nombre}" que habías comprado ha sido ELIMINADO por el solicitante.`,
          gift.grupo_id,
          gift.nombre,
        ]
      );

      // Send email notification
      const compradorResult = await query(
        'SELECT email, nombre FROM users WHERE id = $1',
        [gift.comprador_id]
      );
      const grupoResult = await query(
        'SELECT nombre_grupo FROM groups WHERE id = $1',
        [gift.grupo_id]
      );

      if (compradorResult.rows.length > 0 && grupoResult.rows.length > 0) {
        emailService
          .sendGiftChangeNotification({
            to: compradorResult.rows[0].email,
            name: compradorResult.rows[0].nombre,
            giftName: gift.nombre,
            action: 'deleted',
            groupName: grupoResult.rows[0].nombre_grupo,
          })
          .catch(err => console.error('Error enviando email de eliminación de regalo:', err));
      }

      // Soft delete
      await query('UPDATE gifts SET is_deleted_by_solicitante = true WHERE id = $1', [giftId]);
    } else {
      // Hard delete
      await query('DELETE FROM gifts WHERE id = $1', [giftId]);
    }

    res.json({ message: 'Regalo eliminado exitosamente' });
  } catch (error) {
    console.error('Delete gift error:', error);
    res.status(500).json({ error: 'Error al eliminar regalo' });
  }
}

export async function markAsBought(req, res) {
  try {
    const { giftId } = req.params;
    const userId = req.user.id;

    // Find gift
    const giftResult = await query('SELECT * FROM gifts WHERE id = $1', [giftId]);

    if (giftResult.rows.length === 0) {
      return res.status(404).json({ error: 'Regalo no encontrado' });
    }

    const gift = giftResult.rows[0];

    // Check if user is trying to buy their own gift
    if (gift.solicitante_id === userId) {
      return res.status(403).json({ error: 'No puedes comprar tu propio regalo' });
    }

    // Check if already bought
    if (gift.comprador_id !== null) {
      return res.status(409).json({ error: 'Este regalo ya ha sido comprado' });
    }

    // Check if user is member of the group
    const membershipCheck = await query(
      'SELECT id FROM memberships WHERE usuario_id = $1 AND grupo_id = $2',
      [userId, gift.grupo_id]
    );

    if (membershipCheck.rows.length === 0) {
      return res.status(403).json({ error: 'No eres miembro de este grupo' });
    }

    // Check if group is archived
    const groupCheck = await query(
      'SELECT archived FROM groups WHERE id = $1',
      [gift.grupo_id]
    );

    if (groupCheck.rows.length > 0 && groupCheck.rows[0].archived) {
      return res.status(403).json({ error: 'No se pueden comprar regalos en un grupo archivado' });
    }

    // Mark as bought
    const result = await query(
      'UPDATE gifts SET comprador_id = $1, fecha_compra = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [userId, giftId]
    );

    res.json({ gift: result.rows[0] });
  } catch (error) {
    console.error('Mark as bought error:', error);
    res.status(500).json({ error: 'Error al marcar como comprado' });
  }
}

export async function unmarkAsBought(req, res) {
  try {
    const { giftId } = req.params;
    const userId = req.user.id;

    // Find gift
    const giftResult = await query('SELECT * FROM gifts WHERE id = $1', [giftId]);

    if (giftResult.rows.length === 0) {
      return res.status(404).json({ error: 'Regalo no encontrado' });
    }

    const gift = giftResult.rows[0];

    // Check if the gift was bought by the current user
    if (gift.comprador_id !== userId) {
      return res.status(403).json({ error: 'Solo puedes desmarcar regalos que tú compraste' });
    }

    // Check if group is archived
    const groupCheck = await query(
      'SELECT archived FROM groups WHERE id = $1',
      [gift.grupo_id]
    );

    if (groupCheck.rows.length > 0 && groupCheck.rows[0].archived) {
      return res.status(403).json({ error: 'No se pueden desmarcar regalos en un grupo archivado' });
    }

    // Unmark as bought
    const result = await query(
      'UPDATE gifts SET comprador_id = NULL, fecha_compra = NULL WHERE id = $1 RETURNING *',
      [giftId]
    );

    res.json({ gift: result.rows[0] });
  } catch (error) {
    console.error('Unmark as bought error:', error);
    res.status(500).json({ error: 'Error al desmarcar como comprado' });
  }
}
