const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');

/**
 * @swagger
 * /api/comment/post/{postId}:
 * get:
 * summary: 특정 게시글의 모든 댓글 조회
 * tags: [Comment]
 * responses:
 * 200:
 * description: 조회 성공
 * /api/comment:
 * post:
 * summary: 댓글 작성
 * tags: [Comment]
 * responses:
 * 201:
 * description: 작성 성공
 * /api/comment/{id}:
 * delete:
 * summary: 댓글 삭제
 * tags: [Comment]
 * responses:
 * 200:
 * description: 삭제 성공
 * /api/comment/post/{postId}/like:
 * post:
 * summary: 댓글 좋아요 토글
 * tags: [Comment]
 * responses:
 * 200:
 * description: 성공
 * /api/comment/post/{postId}/dislike:
 * post:
 * summary: 댓글 싫어요 토글
 * tags: [Comment]
 * responses:
 * 200:
 * description: 성공
 */
router.get('/post/:postId', commentController.getCommentsByPostId);
router.post('/', commentController.createComment);
router.delete('/:id', commentController.deleteComment);
router.post('/post/:postId/like', commentController.toggleLike);
router.post('/post/:postId/dislike', commentController.toggleDislike);

module.exports = router;