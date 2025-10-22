const db = require('../config/db');

// Get company info (biasanya hanya satu record)
exports.getCompanyInfo = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM company_info ORDER BY created_at DESC LIMIT 1');

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Informasi perusahaan belum diatur' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error dalam getCompanyInfo:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Buat atau update company info
exports.updateCompanyInfo = async (req, res) => {
  try {
    const { address, phone_number, email } = req.body;

    // Validasi input
    if (!address || !phone_number || !email) {
      return res.status(400).json({ message: 'Alamat, nomor telepon, dan email diperlukan' });
    }

    // Cek apakah sudah ada company info
    const checkInfo = await db.query('SELECT * FROM company_info');

    let result;

    if (checkInfo.rows.length === 0) {
      // Jika belum ada, buat baru
      result = await db.query(
        'INSERT INTO company_info (address, phone_number, email, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *',
        [address, phone_number, email]
      );

      res.status(201).json({
        message: 'Informasi perusahaan berhasil dibuat',
        company_info: result.rows[0]
      });
    } else {
      // Jika sudah ada, update record yang ada
      const infoId = checkInfo.rows[0].id;

      result = await db.query(
        'UPDATE company_info SET address = $1, phone_number = $2, email = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
        [address, phone_number, email, infoId]
      );

      res.json({
        message: 'Informasi perusahaan berhasil diupdate',
        company_info: result.rows[0]
      });
    }
  } catch (error) {
    console.error('Error dalam updateCompanyInfo:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
