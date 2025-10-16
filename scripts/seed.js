const db = require('../config/db');
const bcrypt = require('bcrypt');

const createSuperAdmin = async () => {
  try {
    // Cek apakah sudah ada superadmin
    const result = await db.query(
      "SELECT * FROM users WHERE role = 'superadmin'"
    );

    if (result.rows.length > 0) {
      console.log('Superadmin sudah ada, tidak perlu membuat lagi.');
      return;
    }

    // Buat superadmin baru
    const username = 'superadmin';
    const password = 'superadmin123'; // Ganti dengan password yang lebih aman
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (username, password, role, created_at) VALUES ($1, $2, 'superadmin', CURRENT_TIMESTAMP)",
      [username, hashedPassword]
    );

    console.log('Superadmin berhasil dibuat:');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('PENTING: Segera ganti password superadmin setelah login!');

  } catch (error) {
    console.error('Error membuat superadmin:', error);
  } finally {
    process.exit();
  }
};

createSuperAdmin();
