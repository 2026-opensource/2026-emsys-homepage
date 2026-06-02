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
        users: { select: { name: true, student_id: true, status: true } }
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
    const { post_id, content } = req.body;
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

    const newComment = await prisma.comments.create({
      data: {
        post_id: postIdInt,
        author_id: author_id,
        content: content.trim(),
      },
      include: {
        users: {
          select: {
            name: true,
            student_id: true,
            status: true,
          },
        },
      },
    });
    res.status(201).json({ 
      success: true, 
      message: "댓글이 등록되었습니다.", 
      data: newComment
    });
  } catch (error) {
    console.error("댓글 작성 에러:", error);

    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: "존재하지 않는 게시글입니다."
      });
    }

    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

// 3. 댓글 수정 (본인만 가능)
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

    const existingComment = await prisma.comments.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: "댓글을 찾을 수 없습니다."
      });
    }

    // 본인 확인
    if (existingComment.author_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "본인의 댓글만 수정할 수 있습니다."
      });
    }

    // MySQL의 NOW()로 한국 시간 저장
    const updatedComment = await prisma.$executeRaw`
      UPDATE comments 
      SET content = ${content.trim()}, updated_at = NOW() 
      WHERE id = ${parseInt(id)}
    `;

    // 수정된 댓글 다시 조회
    const result = await prisma.comments.findUnique({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: "댓글이 수정되었습니다.",
      data: updatedComment
    });
  } catch (error) {
    console.error("댓글 수정 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

// 4. 댓글 삭제 (본인 또는 임원 이상)
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const existingComment = await prisma.comments.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: "댓글을 찾을 수 없습니다."
      });
    }

    // 본인이거나 임원 이상이면 삭제 가능
    const isOwner = existingComment.author_id === userId;
    const isAdmin = userRole === 'OFFICER' || userRole === 'PRESIDENT';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "댓글 삭제 권한이 없습니다."
      });
    }

    await prisma.comments.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ success: true, message: "댓글이 정상적으로 삭제되었습니다." });
  } catch (error) {
    console.error("댓글 삭제 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};