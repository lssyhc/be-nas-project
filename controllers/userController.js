const db = require('../config/db');
const bcrypt = require('bcrypt');

// Get semua users (hanya untuk superadmin)
exports.getAllUsers = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, username, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error dalam getAllUsers:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Get user berdasarkan ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT id, username, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error dalam getUserById:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Buat user baru (hanya superadmin bisa membuat admin)
exports.createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validasi input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password diperlukan' });
    }

    // Validasi role
    if (!role) {
      return res.status(400).json({ message: 'Role harus ditentukan' });
    }

    if (role !== 'admin' && role !== 'superadmin') {
      return res.status(400).json({ message: 'Role tidak valid' });
    }

    // Cek apakah username sudah ada
    const checkUser = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (checkUser.rows.length > 0) {
      return res.status(409).json({ message: 'Username sudah digunakan' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user baru
    const result = await db.query(
      'INSERT INTO users (username, password, role, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING id, username, role, created_at, updated_at',
      [username, hashedPassword, role]
    );

    res.status(201).json({
      message: 'User berhasil dibuat',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error dalam createUser:', error);
    if (error.code === '23505') {
      // Unique constraint error
      return res.status(409).json({ message: 'Username sudah digunakan' });
    }
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;

    // Cek apakah user ada
    const userCheck = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const currentUser = userCheck.rows[0];

    // Admin hanya dapat mengubah username dan password mereka sendiri
    // Superadmin dapat mengubah semua termasuk role
    let updateFields = [];
    let values = [];
    let paramIndex = 1;

    if (username) {
      updateFields.push(`username = $${paramIndex}`);
      values.push(username);
      paramIndex++;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push(`password = $${paramIndex}`);
      values.push(hashedPassword);
      paramIndex++;
    }

    // Hanya superadmin yang bisa mengubah role
    if (role && req.user.role === 'superadmin') {
      if (role !== 'admin' && role !== 'superadmin') {
        return res.status(400).json({ message: 'Role tidak valid' });
      }
      updateFields.push(`role = $${paramIndex}`);
      values.push(role);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Tidak ada data yang diupdate' });
    }

    // Tambahkan updated_at ke daftar field yang diupdate
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // Update query
    const updateQuery = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, username, role, created_at, updated_at
    `;

    values.push(id);
    const result = await db.query(updateQuery, values);

    res.json({
      message: 'User berhasil diupdate',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error dalam updateUser:', error);
    if (error.code === '23505') {
      // Unique constraint error
      return res.status(409).json({ message: 'Username sudah digunakan' });
    }
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Delete user (hanya superadmin bisa menghapus user)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah user ada
    const userCheck = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Mencegah superadmin menghapus diri sendiri
    if (parseInt(id) === req.user.id) {
      return res.status(403).json({ message: 'Tidak dapat menghapus akun sendiri' });
    }

    // Hapus user
    await db.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ message: 'User berhasil dihapus' });

  } catch (error) {
    console.error('Error dalam deleteUser:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
