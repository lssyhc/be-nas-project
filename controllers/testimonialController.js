const db = require('../config/db');

// Get semua testimonial
exports.getAllTestimonials = async (req, res) => {
  try {
    // Default tampilkan yang aktif saja, kecuali jika parameter all diberikan
    const showAll = req.query.all === 'true';

    let query = 'SELECT * FROM testimonials';
    if (!showAll) {
      query += ' WHERE is_active = true';
    }
    query += ' ORDER BY created_at DESC';

    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error dalam getAllTestimonials:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Get testimonial berdasarkan ID
exports.getTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM testimonials WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Testimonial tidak ditemukan' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error dalam getTestimonialById:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Buat testimonial baru
exports.createTestimonial = async (req, res) => {
  try {
    const { name, role, message, image, rating, background_color, is_active } = req.body;

    // Validasi input
    if (!name || !message) {
      return res.status(400).json({ message: 'Nama dan pesan diperlukan' });
    }

    // Validasi rating
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating harus antara 1 dan 5' });
    }

    // Validasi background_color
    if (background_color && !['blue', 'black'].includes(background_color)) {
      return res.status(400).json({ message: 'Background color hanya bisa blue atau black' });
    }

    const query = `
      INSERT INTO testimonials (name, role, message, image, rating, background_color, is_active, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [
      name,
      role || null,
      message,
      image || null,
      rating || null,
      background_color || 'blue',
      is_active !== undefined ? is_active : true
    ];

    const result = await db.query(query, values);

    res.status(201).json({
      message: 'Testimonial berhasil dibuat',
      testimonial: result.rows[0]
    });
  } catch (error) {
    console.error('Error dalam createTestimonial:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Update testimonial
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, message, image, rating, background_color, is_active } = req.body;

    // Cek apakah testimonial ada
    const testimonialCheck = await db.query(
      'SELECT * FROM testimonials WHERE id = $1',
      [id]
    );

    if (testimonialCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Testimonial tidak ditemukan' });
    }

    // Validasi rating
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating harus antara 1 dan 5' });
    }

    // Validasi background_color
    if (background_color && !['blue', 'black'].includes(background_color)) {
      return res.status(400).json({ message: 'Background color hanya bisa blue atau black' });
    }

    let updateFields = [];
    let values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex}`);
      values.push(name);
      paramIndex++;
    }

    if (role !== undefined) {
      updateFields.push(`role = $${paramIndex}`);
      values.push(role);
      paramIndex++;
    }

    if (message !== undefined) {
      updateFields.push(`message = $${paramIndex}`);
      values.push(message);
      paramIndex++;
    }

    if (image !== undefined) {
      updateFields.push(`image = $${paramIndex}`);
      values.push(image);
      paramIndex++;
    }

    if (rating !== undefined) {
      updateFields.push(`rating = $${paramIndex}`);
      values.push(rating);
      paramIndex++;
    }

    if (background_color !== undefined) {
      updateFields.push(`background_color = $${paramIndex}`);
      values.push(background_color);
      paramIndex++;
    }

    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex}`);
      values.push(is_active);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Tidak ada data yang diupdate' });
    }

    // Tambahkan updated_at ke daftar field yang diupdate
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // Update query
    const updateQuery = `
      UPDATE testimonials
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    values.push(id);
    const result = await db.query(updateQuery, values);

    res.json({
      message: 'Testimonial berhasil diupdate',
      testimonial: result.rows[0]
    });

  } catch (error) {
    console.error('Error dalam updateTestimonial:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Delete testimonial
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah testimonial ada
    const testimonialCheck = await db.query(
      'SELECT * FROM testimonials WHERE id = $1',
      [id]
    );

    if (testimonialCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Testimonial tidak ditemukan' });
    }

    // Hapus testimonial
    await db.query('DELETE FROM testimonials WHERE id = $1', [id]);

    res.json({ message: 'Testimonial berhasil dihapus' });

  } catch (error) {
    console.error('Error dalam deleteTestimonial:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Mengubah status aktif testimonial
exports.toggleTestimonialStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah testimonial ada
    const testimonialCheck = await db.query(
      'SELECT * FROM testimonials WHERE id = $1',
      [id]
    );

    if (testimonialCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Testimonial tidak ditemukan' });
    }

    const currentStatus = testimonialCheck.rows[0].is_active;
    const newStatus = !currentStatus;

    const result = await db.query(
      'UPDATE testimonials SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [newStatus, id]
    );

    res.json({
      message: `Status testimonial berhasil diubah menjadi ${newStatus ? 'aktif' : 'nonaktif'}`,
      testimonial: result.rows[0]
    });
  } catch (error) {
    console.error('Error dalam toggleTestimonialStatus:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
