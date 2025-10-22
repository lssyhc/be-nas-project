const express = require('express');
const router = express.Router();
const socialMediaController = require('../controllers/socialMediaController');
const verifyToken = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

// Route admin - perlu otentikasi
router.get('/', verifyToken, checkRole(['admin', 'superadmin']), socialMediaController.getAllSocialMedia);
router.get('/:id', verifyToken, checkRole(['admin', 'superadmin']), socialMediaController.getSocialMediaById);
router.post('/', verifyToken, checkRole(['admin', 'superadmin']), socialMediaController.createSocialMedia);
router.put('/:id', verifyToken, checkRole(['admin', 'superadmin']), socialMediaController.updateSocialMedia);
router.delete('/:id', verifyToken, checkRole(['admin', 'superadmin']), socialMediaController.deleteSocialMedia);
router.post('/reorder', verifyToken, checkRole(['admin', 'superadmin']), socialMediaController.reorderSocialMedia);

module.exports = router;
