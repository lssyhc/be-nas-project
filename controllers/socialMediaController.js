const db = require('../config/db');

// Get semua social media
exports.getAllSocialMedia = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM social_media ORDER BY sort_order ASC, created_at ASC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error dalam getAllSocialMedia:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Get social media berdasarkan ID
exports.getSocialMediaById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM social_media WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Social media tidak ditemukan' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error dalam getSocialMediaById:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Buat social media baru
exports.createSocialMedia = async (req, res) => {
  try {
    const { platform, url, icon, sort_order } = req.body;

    // Validasi input
    if (!platform || !url) {
      return res.status(400).json({ message: 'Platform dan URL diperlukan' });
    }

    const result = await db.query(
      'INSERT INTO social_media (platform, url, icon, sort_order, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *',
      [platform, url, icon || null, sort_order || 0]
    );

    res.status(201).json({
      message: 'Social media berhasil dibuat',
      social_media: result.rows[0]
    });
  } catch (error) {
    console.error('Error dalam createSocialMedia:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Update social media
exports.updateSocialMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, url, icon, sort_order } = req.body;

    // Cek apakah social media ada
    const socialMediaCheck = await db.query(
      'SELECT * FROM social_media WHERE id = $1',
      [id]
    );

    if (socialMediaCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Social media tidak ditemukan' });
    }

    let updateFields = [];
    let values = [];
    let paramIndex = 1;

    if (platform !== undefined) {
      updateFields.push(`platform = $${paramIndex}`);
      values.push(platform);
      paramIndex++;
    }

    if (url !== undefined) {
      updateFields.push(`url = $${paramIndex}`);
      values.push(url);
      paramIndex++;
    }

    if (icon !== undefined) {
      updateFields.push(`icon = $${paramIndex}`);
      values.push(icon);
      paramIndex++;
    }

    if (sort_order !== undefined) {
      updateFields.push(`sort_order = $${paramIndex}`);
      values.push(sort_order);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Tidak ada data yang diupdate' });
    }

    // Tambahkan updated_at ke daftar field yang diupdate
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // Update query
    const updateQuery = `
      UPDATE social_media
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    values.push(id);
    const result = await db.query(updateQuery, values);

    res.json({
      message: 'Social media berhasil diupdate',
      social_media: result.rows[0]
    });

  } catch (error) {
    console.error('Error dalam updateSocialMedia:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Delete social media
exports.deleteSocialMedia = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah social media ada
    const socialMediaCheck = await db.query(
      'SELECT * FROM social_media WHERE id = $1',
      [id]
    );

    if (socialMediaCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Social media tidak ditemukan' });
    }

    // Hapus social media
    await db.query('DELETE FROM social_media WHERE id = $1', [id]);

    res.json({ message: 'Social media berhasil dihapus' });

  } catch (error) {
    console.error('Error dalam deleteSocialMedia:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Mengatur ulang urutan (reorder)
exports.reorderSocialMedia = async (req, res) => {
  try {
    const { orderData } = req.body;

    // Validasi input
    if (!orderData || !Array.isArray(orderData)) {
      return res.status(400).json({
        message: 'Data urutan harus berupa array dengan format [{id: 1, sort_order: 0}, ...]'
      });
    }

    // Mulai transaksi database
    await db.query('BEGIN');

    for (const item of orderData) {
      if (!item.id || item.sort_order === undefined) {
        await db.query('ROLLBACK');
        return res.status(400).json({
          message: 'Setiap item harus memiliki id dan sort_order'
        });
      }

      await db.query(
        'UPDATE social_media SET sort_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [item.sort_order, item.id]
      );
    }

    await db.query('COMMIT');

    const result = await db.query('SELECT * FROM social_media ORDER BY sort_order ASC, created_at ASC');

    res.json({
      message: 'Urutan social media berhasil diperbarui',
      social_media: result.rows
    });

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error dalam reorderSocialMedia:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
