// Role-Based Access Control (RBAC)
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Tidak terautentikasi' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Tidak memiliki izin untuk aksi ini' });
    }

    next();
  };
};

// Middleware untuk verifikasi apakah user mengakses datanya sendiri
const checkSelfOrSuperAdmin = async (req, res, next) => {
  // Jika superadmin, berikan akses penuh
  if (req.user.role === 'superadmin') {
    return next();
  }

  // Jika admin mencoba mengakses data user lain
  if (req.params.id && req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({
      message: 'Tidak memiliki izin untuk mengakses data user lain'
    });
  }

  next();
};

module.exports = { checkRole, checkSelfOrSuperAdmin };
