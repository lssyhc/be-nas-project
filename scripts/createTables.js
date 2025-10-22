const db = require('../config/db');
const bcrypt = require('bcrypt');
require('dotenv').config();

const createTables = async () => {
  try {
    // Cek dan buat tabel users
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

    // Cek dan buat tabel testimonials
    const checkTestimonials = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'testimonials'
      );
    `);

    if (!checkTestimonials.rows[0].exists) {
      console.log('Membuat tabel testimonials...');
      await db.query(`
        CREATE TABLE testimonials (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(255),
          message TEXT NOT NULL,
          image VARCHAR(255),
          rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
          background_color VARCHAR(20) DEFAULT 'blue' CHECK (background_color IN ('blue', 'black')),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP
        );
      `);
      console.log('Tabel testimonials berhasil dibuat!');
    } else {
      console.log('Tabel testimonials sudah ada.');
    }

    // Cek dan buat tabel company_info
    const checkCompanyInfo = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'company_info'
      );
    `);

    if (!checkCompanyInfo.rows[0].exists) {
      console.log('Membuat tabel company_info...');
      await db.query(`
        CREATE TABLE company_info (
          id SERIAL PRIMARY KEY,
          address TEXT NOT NULL,
          phone_number VARCHAR(25) NOT NULL,
          email VARCHAR(255) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP
        );
      `);
      console.log('Tabel company_info berhasil dibuat!');
    } else {
      console.log('Tabel company_info sudah ada.');
    }

    // Cek dan buat tabel social_media
    const checkSocialMedia = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'social_media'
      );
    `);

    if (!checkSocialMedia.rows[0].exists) {
      console.log('Membuat tabel social_media...');
      await db.query(`
        CREATE TABLE social_media (
          id SERIAL PRIMARY KEY,
          platform VARCHAR(50) NOT NULL,
          url VARCHAR(255) NOT NULL,
          icon VARCHAR(100),
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP
        );
      `);
      console.log('Tabel social_media berhasil dibuat!');
    } else {
      console.log('Tabel social_media sudah ada.');
    }

    console.log('Migrasi semua tabel berhasil!');
  } catch (error) {
    console.error('Error dalam migrasi:', error);
  } finally {
    process.exit();
  }
};

createTables();
