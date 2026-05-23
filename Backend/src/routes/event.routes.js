const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');

/**
 * @swagger
 * /api/event:
 *   get:
 *     summary: 전체 동아리 일정 조회
 *     description: 누구나 조회 가능 (비회원 포함)
 *     tags: [Event]
 *     responses:
 *       200:
 *         description: 조회 성공
 */
router.get('/', eventController.getAllEvents);

/**
 * @swagger
 * /api/event:
 *   post:
 *     summary: 새로운 동아리 일정 추가
 *     description: 회장/임원만 추가 가능
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - start_time
 *             properties:
 *               title:
 *                 type: string
 *                 description: 일정 제목
 *                 example: "정기 MT"
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 description: 시작 시간
 *                 example: "2025-06-15T10:00:00Z"
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 description: 종료 시간 (선택)
 *                 example: "2025-06-16T18:00:00Z"
 *     responses:
 *       201:
 *         description: 생성 성공
 *       400:
 *         description: 필수 필드 누락
 *       401:
 *         description: 로그인 필요
 *       403:
 *         description: 관리자 권한 필요
 */
router.post('/', requireAuth, requireAdmin, eventController.createEvent);

/**
 * @swagger
 * /api/event/{id}:
 *   put:
 *     summary: 일정 수정
 *     description: 회장/임원만 수정 가능
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 일정 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - start_time
 *             properties:
 *               title:
 *                 type: string
 *                 description: 일정 제목
 *                 example: "수정된 MT"
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 description: 시작 시간
 *                 example: "2025-06-15T10:00:00Z"
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 description: 종료 시간
 *                 example: "2025-06-16T18:00:00Z"
 *     responses:
 *       200:
 *         description: 수정 성공
 *       401:
 *         description: 로그인 필요
 *       403:
 *         description: 관리자 권한 필요
 *       404:
 *         description: 일정을 찾을 수 없음
 */
router.put('/:id', requireAuth, requireAdmin, eventController.updateEvent);

/**
 * @swagger
 * /api/event/{id}:
 *   delete:
 *     summary: 특정 일정 삭제
 *     description: 회장/임원만 삭제 가능
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 일정 ID
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       401:
 *         description: 로그인 필요
 *       403:
 *         description: 관리자 권한 필요
 *       404:
 *         description: 일정을 찾을 수 없음
 */
router.delete('/:id', requireAuth, requireAdmin, eventController.deleteEvent);

/**
 * @swagger
 * /api/event/excel:
 *   get:
 *     summary: 기간별 일정 내역 조회 (엑셀 다운로드용)
 *     description: 회장/임원만 조회 가능
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 시작 날짜
 *         example: "2025-01-01T00:00:00Z"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 종료 날짜
 *         example: "2025-12-31T23:59:59Z"
 *     responses:
 *       200:
 *         description: 조회 성공
 *       400:
 *         description: 시작일/종료일 누락
 *       401:
 *         description: 로그인 필요
 *       403:
 *         description: 관리자 권한 필요
 */
router.get('/excel', requireAuth, requireAdmin, eventController.getEventsForExcel);

module.exports = router;