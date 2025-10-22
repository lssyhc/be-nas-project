const express = require('express');
const router = express.Router();
const companyInfoController = require('../controllers/companyInfoController');
const verifyToken = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

// Route admin - perlu otentikasi
router.get('/', verifyToken, checkRole(['admin', 'superadmin']), companyInfoController.getCompanyInfo);
router.put('/', verifyToken, checkRole(['admin', 'superadmin']), companyInfoController.updateCompanyInfo);

module.exports = router;
