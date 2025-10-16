const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/auth');
const { checkRole, checkSelfOrSuperAdmin } = require('../middleware/rbac');

// Mendapatkan semua user (hanya superadmin)
router.get('/', verifyToken, checkRole(['superadmin']), userController.getAllUsers);

// Mendapatkan user berdasarkan ID (admin hanya bisa melihat dirinya sendiri)
router.get('/:id', verifyToken, checkSelfOrSuperAdmin, userController.getUserById);

// Membuat user baru (hanya superadmin)
router.post('/', verifyToken, checkRole(['superadmin']), userController.createUser);

// Update user (admin hanya bisa update dirinya sendiri)
router.put('/:id', verifyToken, checkSelfOrSuperAdmin, userController.updateUser);

// Delete user (hanya superadmin)
router.delete('/:id', verifyToken, checkRole(['superadmin']), userController.deleteUser);

module.exports = router;
