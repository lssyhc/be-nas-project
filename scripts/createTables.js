const db = require('../config/db');

const createTables = async () => {
  try {
    // Cek apakah tabel testimonials sudah ada
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

    // Cek apakah tabel company_info sudah ada
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

    // Cek apakah tabel social_media sudah ada
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

    console.log('Migrasi berhasil!');
  } catch (error) {
    console.error('Error dalam migrasi:', error);
  } finally {
    process.exit();
  }
};

createTables();
