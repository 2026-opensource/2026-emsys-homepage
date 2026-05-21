const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. 게시글 전체 조회 (최신순 정렬 + 작성자 이름 포함)
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.posts.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        users: { // 작성자 정보 엮어서 가져오기
          select: { name: true, student_id: true }
        },
        _count: { // 댓글 갯수, 좋아요 갯수도 포함해주면 프론트가 좋아함
          select: { comments: true, post_likes: true }
        }
      }
    });
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error("게시글 전체 조회 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

// 2. 특정 게시글 상세 조회 (조회수 1 증가 + 상세 정보 포함)
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 2-1. 먼저 해당 게시글의 조회수를 1 올려줌
    await prisma.posts.update({
      where: { id: parseInt(id) },
      data: { view_count: { increment: 1 } }
    });

    // 2-2. 게시글 상세 정보와 작성자, 댓글들을 함께 불러옴
    const post = await prisma.posts.findUnique({
      where: { id: parseInt(id) },
      include: {
        users: { select: { name: true, profile_image: true } },
        comments: {
          include: { users: { select: { name: true } } },
          orderBy: { created_at: 'asc' }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ success: false, message: "게시글을 찾을 수 없습니다." });
    }
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error("게시글 상세 조회 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

// 3. 새로운 게시글 작성
exports.createPost = async (req, res) => {
  try {
    const { board_type, category, title, content, author_id } = req.body;
    
    const newPost = await prisma.posts.create({
      data: {
        board_type: board_type || "COMMUNITY", // 프론트에서 안 주면 기본값 적용
        category,
        title,
        content,
        author_id: parseInt(author_id),
      },
    });
    res.status(201).json({ success: true, message: "게시글이 작성되었습니다.", data: newPost });
  } catch (error) {
    console.error("게시글 작성 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

// 4. 게시글 삭제
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 스키마에 onDelete: Cascade가 설정되어 있어서 글을 지우면 댓글과 좋아요도 DB에서 알아서 날아감
    await prisma.posts.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({ success: true, message: "게시글이 삭제되었습니다." });
  } catch (error) {
    console.error("게시글 삭제 에러:", error);
    res.status(500).json({ success: false, message: "게시글을 삭제할 수 없거나 이미 삭제되었습니다." });
  }
};