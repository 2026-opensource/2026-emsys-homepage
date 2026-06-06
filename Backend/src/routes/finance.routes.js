const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');
const multer = require('multer');

// 파일 제한 (엑셀만 업로드 가능)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',  // xlsx
            'application/vnd.ms-excel'
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('엑셀 파일만 업로드 가능합니다.'));
        }
    }
});

router.post('/upload', requireAuth, requireAdmin, upload.single('file'), financeController.uploadFinanceExcel);
router.get('/semesters', requireAuth, requireAdmin, financeController.getAvailableSemesters);
router.get('/stats/semester', requireAuth, requireAdmin, financeController.getSemesterStats);
router.get('/stats/monthly', requireAuth, requireAdmin, financeController.getMonthlyStats);

module.exports = router;