const express = require('express');
const router = express.Router();
const companyInfoController = require('../controllers/companyInfoController');
const verifyToken = require('../middleware/auth');

// Route admin - perlu otentikasi
router.get('/', verifyToken, companyInfoController.getCompanyInfo);
router.put('/', verifyToken, companyInfoController.updateCompanyInfo);

module.exports = router;
