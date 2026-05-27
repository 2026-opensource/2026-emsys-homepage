const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/comment/post/{postId}:
 *   get:
 *     summary: 특정 게시글의 모든 댓글 조회
 *     description: 로그인한 회원만 조회 가능
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 게시글 ID
 *     responses:
 *       200:
 *         description: 조회 성공
 *       401:
 *         description: 로그인 필요
 */
router.get('/post/:postId', requireAuth, commentController.getCommentsByPostId);

/**
 * @swagger
 * /api/comment:
 *   post:
 *     summary: 댓글 작성
 *     description: 로그인한 회원만 작성 가능
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - post_id
 *               - content
 *             properties:
 *               post_id:
 *                 type: integer
 *                 description: 게시글 ID
 *                 example: 1
 *               content:
 *                 type: string
 *                 description: 댓글 내용
 *                 example: "좋은 글 감사합니다!"
 *     responses:
 *       201:
 *         description: 작성 성공
 *       401:
 *         description: 로그인 필요
 *       400:
 *         description: 필수 필드 누락 또는 유효하지 않은 ID
 */
router.post('/', requireAuth, commentController.createComment);

/**
 * @swagger
 * /api/comment/{id}:
 *   put:
 *     summary: 댓글 수정
 *     description: 본인 댓글만 수정 가능
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 댓글 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 수정할 댓글 내용
 *                 example: "수정된 댓글입니다."
 *     responses:
 *       200:
 *         description: 수정 성공
 *       401:
 *         description: 로그인 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 댓글을 찾을 수 없음
 */
router.put('/:id', requireAuth, commentController.updateComment);

/**
 * @swagger
 * /api/comment/{id}:
 *   delete:
 *     summary: 댓글 삭제
 *     description: 본인 또는 임원 이상만 삭제 가능
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 댓글 ID
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       401:
 *         description: 로그인 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 댓글을 찾을 수 없음
 */
router.delete('/:id', requireAuth, commentController.deleteComment);

module.exports = router;