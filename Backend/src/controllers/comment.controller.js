const prisma = require('../lib/prisma');
const commentService = require('../services/comment.service');

// 특정 게시글의 전체 댓글 목록 조회 (최신순으로 정렬)
exports.getCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await commentService.getCommentsByPostId(postId);

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error("댓글 조회 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};


// 새로운 댓글 작성
exports.createComment = async (req, res) => {
  try {
    const { post_id, content, parent_id } = req.body;
    const author_id = req.user.id;

    if (!content || content.trim() === "") {
      return res.status(400).json({ success: false, message: "댓글 내용을 입력해주세요." });
    }

    const postIdInt = parseInt(post_id);
    if (isNaN(postIdInt)) {
      return res.status(400).json({
        success: false,
        message: "post_id는 숫자여야 합니다."
      });
    }

    const newComment = await commentService.createComment(post_id, content, author_id, parent_id);

    res.status(201).json({
      success: true,
      message: "댓글이 등록되었습니다.",
      data: newComment
    });
  } catch (error) {
    console.error("댓글 작성 에러:", error);

    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }

    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: "존재하지 않는 게시글입니다."
      });
    }

    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};


// 댓글 수정 (본인만 가능)
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "댓글 내용을 입력해주세요."
      });
    }

    const result = await commentService.updateComment(id, content, userId);

    res.status(200).json({
      success: true,
      message: "댓글이 수정되었습니다.",
      data: result
    });
  } catch (error) {
    console.error("댓글 수정 에러:", error);

    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};


// 댓글 삭제 (본인 또는 임원 이상만)
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    await commentService.deleteComment(id, userId, userRole);

    res.status(200).json({ success: true, message: "댓글이 정상적으로 삭제되었습니다." });
  } catch (error) {
    console.error("댓글 삭제 에러:", error);

    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};