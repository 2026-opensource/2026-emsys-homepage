const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', requireAuth, requireAdmin, upload.single('file'), financeController.uploadFinanceExcel);
router.get('/semesters', requireAuth, requireAdmin, financeController.getAvailableSemesters);
router.get('/stats/semester', requireAuth, requireAdmin, financeController.getSemesterStats);
router.get('/stats/monthly', requireAuth, requireAdmin, financeController.getMonthlyStats);

module.exports = router;