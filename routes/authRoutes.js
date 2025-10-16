const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/auth');

// Route untuk login
router.post('/login', authController.login);

// Route untuk mendapatkan data user yang sedang login
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
