const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. 특정 게시글의 전체 댓글 목록 조회 (최신순 정렬)
exports.getCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await prisma.comments.findMany({
      where: { post_id: parseInt(postId) },
      orderBy: { created_at: 'desc' },
      include: {
        users: { select: { name: true, student_id: true } }
      }
    });
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error("댓글 조회 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

// 2. 새로운 댓글 작성
exports.createComment = async (req, res) => {
  try {
    const { post_id, author_id, content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ success: false, message: "댓글 내용을 입력해주세요." });
    }

    const newComment = await prisma.comments.create({
      data: {
        post_id: parseInt(post_id),
        author_id: parseInt(author_id),
        content
      }
    });
    res.status(201).json({ success: true, message: "댓글이 등록되었습니다.", data: newComment });
  } catch (error) {
    console.error("댓글 작성 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

// 3. 댓글 삭제
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.comments.delete({
      where: { id: parseInt(id) }
    });
    res.status(200).json({ success: true, message: "댓글이 정상적으로 삭제되었습니다." });
  } catch (error) {
    console.error("댓글 삭제 에러:", error);
    res.status(500).json({ success: false, message: "이미 삭제되었거나 존재하지 않는 댓글입니다." });
  }
};

// 4. 게시글 좋아요 누르기
exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const existingDislike = await prisma.post_dislikes.findUnique({
      where: { post_id_user_id: { post_id: parseInt(postId), user_id: parseInt(userId) } }
    });

    if (existingDislike) {
      return res.status(400).json({ 
        success: false, 
        message: "이미 싫어요를 누른 상태에서는 좋아요를 누를 수 없습니다." 
      });
    }

    const existingLike = await prisma.post_likes.findUnique({
      where: { post_id_user_id: { post_id: parseInt(postId), user_id: parseInt(userId) } }
    });

    if (existingLike) {
      await prisma.post_likes.delete({ where: { id: existingLike.id } });
      return res.status(200).json({ success: true, message: "좋아요를 취소했습니다." });
    } else {
      await prisma.post_likes.create({ data: { post_id: parseInt(postId), user_id: parseInt(userId) } });
      return res.status(201).json({ success: true, message: "게시글을 좋아요 했습니다." });
    }
  } catch (error) {
    console.error("좋아요 처리 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

// 5. 게시글 싫어요 누르기
exports.toggleDislike = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const existingLike = await prisma.post_likes.findUnique({
      where: { post_id_user_id: { post_id: parseInt(postId), user_id: parseInt(userId) } }
    });

    if (existingLike) {
      return res.status(400).json({ 
        success: false, 
        message: "이미 좋아요를 누른 상태에서는 싫어요를 누를 수 없습니다." 
      });
    }

    const existingDislike = await prisma.post_dislikes.findUnique({
      where: { post_id_user_id: { post_id: parseInt(postId), user_id: parseInt(userId) } }
    });

    if (existingDislike) {
      await prisma.post_dislikes.delete({ where: { id: existingDislike.id } });
      return res.status(200).json({ success: true, message: "싫어요를 취소했습니다." });
    } else {
      await prisma.post_dislikes.create({ data: { post_id: parseInt(postId), user_id: parseInt(userId) } });
      return res.status(201).json({ success: true, message: "게시글을 싫어요 했습니다." });
    }
  } catch (error) {
    console.error("싫어요 처리 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};