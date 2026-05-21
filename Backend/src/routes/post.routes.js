const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

/**
 * @swagger
 * /api/posts:
 * get:
 * summary: 전체 게시글 조회
 * tags: [Post]
 * responses:
 * 200:
 * description: 조회 성공
 * post:
 * summary: 새로운 게시글 작성
 * tags: [Post]
 * responses:
 * 201:
 * description: 작성 성공
 * /api/posts/{id}:
 * get:
 * summary: 게시글 상세 조회
 * tags: [Post]
 * responses:
 * 200:
 * description: 조회 성공
 * delete:
 * summary: 게시글 삭제
 * tags: [Post]
 * responses:
 * 200:
 * description: 삭제 성공
 */
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.post('/', postController.createPost);
router.delete('/:id', postController.deletePost);

module.exports = router;