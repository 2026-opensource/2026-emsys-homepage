const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /api/finance/upload:
 *   post:
 *     summary: 엑셀 파일 업로드 (회비 내역 일괄 등록)
 *     description: 회장/임원만 업로드 가능
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 엑셀 파일 (.xlsx, .xls)
 *     responses:
 *       201:
 *         description: 업로드 성공
 *       401:
 *         description: 로그인 필요
 *       403:
 *         description: 관리자 권한 필요
 */
router.post('/upload', requireAuth, requireAdmin, upload.single('file'), financeController.uploadFinanceExcel);

/**
 * @swagger
 * /api/finance/stats:
 *   get:
 *     summary: 월별 통계 데이터 조회
 *     description: 회장/임원만 조회 가능
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 12
 *         description: 조회할 개월 수
 *     responses:
 *       200:
 *         description: 조회 성공
 *       401:
 *         description: 로그인 필요
 *       403:
 *         description: 관리자 권한 필요
 */
router.get('/stats', requireAuth, requireAdmin, financeController.getFinanceStats);

module.exports = router;