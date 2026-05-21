const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');

/**
 * @swagger
 * /api/finance:
 * get:
 * summary: 전체 회계 내역 조회
 * tags: [Finance]
 * responses:
 * 200:
 * description: 조회 성공
 * /api/finance/create:
 * post:
 * summary: 새로운 회계 내역 등록
 * tags: [Finance]
 * responses:
 * 21:
 * description: 등록 성공
 */
router.get('/', financeController.getAllFinances);
router.post('/', financeController.createFinanceItem);

module.exports = router;