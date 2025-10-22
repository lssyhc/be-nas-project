const db = require('../config/db');
const bcrypt = require('bcrypt');
require('dotenv').config();

const createUsersTable = async () => {
  try {
    // Cek apakah tabel users sudah ada
    const checkUsers = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `);

    if (!checkUsers.rows[0].exists) {
      console.log('Membuat tabel users...');
      await db.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) CHECK (role IN ('admin', 'superadmin')),
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP
        );
      `);
      console.log('Tabel users berhasil dibuat!');

      // Buat superadmin default
      console.log('Membuat superadmin default...');
      const username = 'superadmin';
      const password = 'superadmin123'; // Ganti dengan password yang lebih aman di produksi
      const hashedPassword = await bcrypt.hash(password, 10);

      await db.query(
        "INSERT INTO users (username, password, role, created_at) VALUES ($1, $2, 'superadmin', CURRENT_TIMESTAMP)",
        [username, hashedPassword]
      );

      console.log('Superadmin default berhasil dibuat:');
      console.log('Username:', username);
      console.log('Password:', password);
      console.log('PENTING: Segera ganti password superadmin setelah login!');
    } else {
      console.log('Tabel users sudah ada.');
    }

    console.log('Migrasi users selesai!');
  } catch (error) {
    console.error('Error dalam migrasi users:', error);
  } finally {
    process.exit();
  }
};

createUsersTable();
