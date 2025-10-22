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

    console.log('Migrasi berhasil!');
  } catch (error) {
    console.error('Error dalam migrasi:', error);
  } finally {
    process.exit();
  }
};

createTables();
