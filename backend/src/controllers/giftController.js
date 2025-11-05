import { query } from '../config/database.js';
import { scrapeImageFromUrl } from '../utils/imageScraper.js';

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
    const groupResult = await query('SELECT fecha_inicio FROM groups WHERE id = $1', [grupoId]);

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    const fechaInicio = new Date(groupResult.rows[0].fecha_inicio);
    const now = new Date();

    if (now < fechaInicio) {
      return res.json({
        gifts: [],
        message: 'La lista estará disponible a partir de la fecha de inicio',
        fecha_inicio: fechaInicio,
      });
    }

    // Get anonymous wishlist
    // Exclude: own gifts, deleted gifts
    // Include: gifts not purchased OR purchased by current user
    const result = await query(
      `SELECT id, nombre, descripcion, url, image_url, created_at, comprador_id
       FROM gifts
       WHERE grupo_id = $1
       AND solicitante_id != $2
       AND (comprador_id IS NULL OR comprador_id = $2)
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
