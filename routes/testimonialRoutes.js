const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const verifyToken = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

// Route admin - perlu otentikasi
router.get('/', verifyToken, checkRole(['admin', 'superadmin']), testimonialController.getAllTestimonials);
router.get('/:id', verifyToken, checkRole(['admin', 'superadmin']), testimonialController.getTestimonialById);
router.post('/', verifyToken, checkRole(['admin', 'superadmin']), testimonialController.createTestimonial);
router.put('/:id', verifyToken, checkRole(['admin', 'superadmin']), testimonialController.updateTestimonial);
router.delete('/:id', verifyToken, checkRole(['admin', 'superadmin']), testimonialController.deleteTestimonial);
router.patch('/:id/toggle-status', verifyToken, checkRole(['admin', 'superadmin']), testimonialController.toggleTestimonialStatus);

module.exports = router;
