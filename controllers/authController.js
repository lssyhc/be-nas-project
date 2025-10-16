const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Controller untuk login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password diperlukan' });
    }

    // Cek apakah user ada
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    // Buat token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Kirim response dengan token dan data user (tanpa password)
    const { password: _, ...userData } = user;
    res.json({
      message: 'Login berhasil',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Error dalam login:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Controller untuk cek status user (bisa digunakan untuk validasi token)
exports.getMe = async (req, res) => {
  try {
    // req.user berisi informasi user dari middleware auth
    const result = await db.query(
      'SELECT id, username, role, created_at, updated_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error dalam getMe:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
