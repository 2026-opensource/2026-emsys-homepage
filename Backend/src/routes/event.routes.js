const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');

/**
 * @swagger
 * /api/event:
 * get:
 * summary: 전체 동아리 일정 조회
 * tags: [Event]
 * responses:
 * 200:
 * description: 조회 성공
 * post:
 * summary: 새로운 동아리 일정 추가
 * tags: [Event]
 * responses:
 * 201:
 * description: 생성 성공
 * /api/event/{id}:
 * delete:
 * summary: 특정 일정 삭제
 * tags: [Event]
 * responses:
 * 200:
 * description: 삭제 성공
 * /api/event/excel:
 * get:
 * summary: 전체 일정 내역 엑셀 다운로드
 * tags: [Event]
 * responses:
 * 200:
 * description: 다운로드 성공
 */
router.get('/', eventController.getAllEvents);
router.post('/', eventController.createEvent);
router.delete('/:id', eventController.deleteEvent);
router.get('/excel', eventController.getEventsForExcel);

module.exports = router;