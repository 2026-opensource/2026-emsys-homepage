const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

router.get('/post/:postId', requireAuth, commentController.getCommentsByPostId);


router.post('/', requireAuth, commentController.createComment);

router.put('/:id', requireAuth, commentController.updateComment);


router.delete('/:id', requireAuth, commentController.deleteComment);

module.exports = router;