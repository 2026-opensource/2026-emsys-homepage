const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");

function extractPostImageUrls(content) {
  if (!content) return [];

  const regex = /<img[^>]+src=["']([^"']+)["']/g;
  const urls = [];

  let match;
  while ((match = regex.exec(content)) !== null) {
    urls.push(match[1]);
  }

  return urls;
}

function deleteUploadedPostImage(imageUrl) {
  if (!imageUrl) return;

  // 우리 서버 uploads/posts 이미지만 삭제
  const uploadsIndex = imageUrl.indexOf("/uploads/posts/");
  if (uploadsIndex === -1) return;

  const relativePath = imageUrl.slice(uploadsIndex + 1);
  // uploads/posts/post-123.png

  const filePath = path.join(__dirname, "../../", relativePath);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

// 게시글 전체 조회 (검색, 카테고리 필터링, 페이지네이션 포함)
exports.getAllPosts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10, board_type = 'COMMUNITY' } = req.query;
    
    const where = { board_type };
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } }
      ];
    }
    
    const totalCount = await prisma.posts.count({ where });
    
    const posts = await prisma.posts.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { created_at: 'desc' },
      include: {
        users: {
          select: { name: true, student_id: true, status: true }
        },
        _count: {
          select: { comments: true, post_likes: true, post_dislikes: true }
        }
      }
    });
    
    res.status(200).json({ 
      success: true, 
      data: posts,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("게시글 전체 조회 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

// 특정 게시글 상세 조회
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.posts.findUnique({
      where: { id: parseInt(id) },
      include: {
        users: { select: { name: true, profile_image: true, student_id: true, status: true } },
        comments: {
          include: { 
            users: { select: { name: true, student_id: true, status: true } } 
          },
          orderBy: { created_at: 'desc' }
        },
        _count: {
          select: { post_likes: true, post_dislikes: true }
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

// 게시글 조회수 증가
exports.increaseViewCount = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedPost = await prisma.posts.update({
      where: {
        id: parseInt(id),
      },
      data: {
        view_count: {
          increment: 1,
        },
      },
      select: {
        id: true,
        view_count: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: updatedPost,
    });
  } catch (error) {
    console.error("게시글 조회수 증가 에러:", error);

    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
};

// 3. 새로운 게시글 작성
exports.createPost = async (req, res) => {
  try {
    const { board_type, category, title, content } = req.body;
    const author_id = req.user.id;
    const userRole = req.user.role;
    
    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: "제목과 내용을 입력해주세요." 
      });
    }
    
    // board_type 검증
    const validBoardTypes = ['COMMUNITY', 'GALLERY', 'ARCHIVE'];
    if (board_type && !validBoardTypes.includes(board_type)) {
      return res.status(400).json({
        success: false,
        message: "올바른 게시판 타입이 아닙니다. (COMMUNITY, GALLERY, ARCHIVE 중 하나)"
      });
    }
    
    // category 검증 추가!
    if ((board_type || "COMMUNITY") === "COMMUNITY" && category) {
      const validCategories = ["notice", "free", "qna", "recruit"];

      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "올바른 카테고리가 아닙니다.",
        });
      }
    }
    
    // 갤러리는 임원 이상만 작성 가능
    if (board_type === 'GALLERY' && userRole !== 'OFFICER' && userRole !== 'PRESIDENT') {
      return res.status(403).json({ 
        success: false, 
        message: "갤러리 게시판은 임원 이상만 작성할 수 있습니다." 
      });
    }
    
    // 자료실도 임원 이상만 작성 가능
    if (board_type === 'ARCHIVE' && userRole !== 'OFFICER' && userRole !== 'PRESIDENT') {
      return res.status(403).json({ 
        success: false, 
        message: "자료실 게시판은 임원 이상만 작성할 수 있습니다." 
      });
    }
    
    // 공지사항 카테고리는 임원 이상만 작성 가능
    if (category === "notice" && userRole !== "OFFICER" && userRole !== "PRESIDENT") {
      return res.status(403).json({
        success: false,
        message: "공지사항은 임원 이상만 작성할 수 있습니다.",
      });
    }

    const newPost = await prisma.posts.create({
      data: {
        board_type: board_type || "COMMUNITY",
        category,
        title,
        content,
        author_id: author_id,
      },
    });
    res.status(201).json({ success: true, message: "게시글이 작성되었습니다.", data: newPost });
  } catch (error) {
    console.error("게시글 작성 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

// 4. 게시글 수정 (본인만 가능)
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { board_type, category, title, content } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const postId = parseInt(id);

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "제목과 내용을 입력해주세요.",
      });
    }

    // category 검증
    if ((board_type || "COMMUNITY") === "COMMUNITY" && category) {
      const validCategories = ["notice", "free", "qna", "recruit"];

      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "올바른 카테고리가 아닙니다. (공지사항, 자유, 질문, 팀원 모집 중 하나)",
        });
      }
    }

    const existingPost = await prisma.posts.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: "게시글을 찾을 수 없습니다.",
      });
    }

    // 본인만 수정 가능
    if (existingPost.author_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "본인의 게시글만 수정할 수 있습니다.",
      });
    }

    // 공지사항 카테고리로 변경하려면 임원 이상이어야 함
    const isAdmin = userRole === "OFFICER" || userRole === "PRESIDENT";

    if (category === "notice" && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "공지사항 카테고리는 임원 이상만 사용할 수 있습니다.",
      });
    }

    // 기존 content 이미지 목록
    const oldImageUrls = extractPostImageUrls(existingPost.content);

    // 새 content 이미지 목록
    const newImageUrls = extractPostImageUrls(content);

    // 기존에는 있었는데 수정 후 content에서 빠진 이미지
    const removedImageUrls = oldImageUrls.filter(
      (oldUrl) => !newImageUrls.includes(oldUrl)
    );

    // MySQL의 NOW()로 수정 시간 저장
    await prisma.$executeRaw`
      UPDATE posts 
      SET 
        board_type = ${board_type || "COMMUNITY"}, 
        category = ${category}, 
        title = ${title}, 
        content = ${content},
        updated_at = NOW()
      WHERE id = ${postId}
    `;

    // 수정된 게시글 다시 조회
    const updatedPost = await prisma.posts.findUnique({
      where: { id: postId },
    });

    // DB 수정 성공 후, 본문에서 제거된 이미지 파일 삭제
    removedImageUrls.forEach(deleteUploadedPostImage);

    return res.status(200).json({
      success: true,
      message: "게시글이 수정되었습니다.",
      data: updatedPost,
    });
  } catch (error) {
    console.error("게시글 수정 에러:", error);

    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
};

// 5. 게시글 삭제 (본인 또는 임원 이상)
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const postId = parseInt(id);

    const existingPost = await prisma.posts.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: "게시글을 찾을 수 없습니다.",
      });
    }

    // 본인이거나 임원 이상이면 삭제 가능
    const isOwner = existingPost.author_id === userId;
    const isAdmin = userRole === "OFFICER" || userRole === "PRESIDENT";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "게시글 삭제 권한이 없습니다.",
      });
    }

    // 게시글 본문에 들어간 이미지 URL 목록 추출
    const imageUrls = extractPostImageUrls(existingPost.content);

    // 연결된 데이터 먼저 삭제
    await prisma.comments.deleteMany({
      where: { post_id: postId },
    });

    await prisma.post_likes.deleteMany({
      where: { post_id: postId },
    });

    await prisma.post_dislikes.deleteMany({
      where: { post_id: postId },
    });

    // 게시글 삭제
    await prisma.posts.delete({
      where: { id: postId },
    });

    // DB 삭제 성공 후, 게시글에 들어간 이미지 파일 삭제
    imageUrls.forEach(deleteUploadedPostImage);

    return res.status(200).json({
      success: true,
      message: "게시글이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("게시글 삭제 에러:", error);

    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
};

// 6. 게시글 좋아요 누르기
exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const postIdInt = parseInt(postId);

    const existingDislike = await prisma.post_dislikes.findUnique({
      where: {
        post_id_user_id: {
          post_id: postIdInt,
          user_id: userId,
        },
      },
    });

    if (existingDislike) {
      return res.status(400).json({
        success: false,
        message: "이미 싫어요를 누른 상태에서는 좋아요를 누를 수 없습니다.",
      });
    }

    const existingLike = await prisma.post_likes.findUnique({
      where: {
        post_id_user_id: {
          post_id: postIdInt,
          user_id: userId,
        },
      },
    });

    // 이미 좋아요를 눌렀으면 좋아요 취소
    if (existingLike) {
      await prisma.post_likes.delete({
        where: {
          id: existingLike.id,
        },
      });
    } 
    // 좋아요를 안 눌렀으면 좋아요 추가
    else {
      await prisma.post_likes.create({
        data: {
          post_id: postIdInt,
          user_id: userId,
        },
      });
    }

    // 좋아요 처리 후 최신 좋아요/싫어요 개수 조회
    const likeCount = await prisma.post_likes.count({
      where: {
        post_id: postIdInt,
      },
    });

    const dislikeCount = await prisma.post_dislikes.count({
      where: {
        post_id: postIdInt,
      },
    });

    return res.status(200).json({
      success: true,
      message: "좋아요 처리가 완료되었습니다.",
      data: {
        likeCount,
        dislikeCount,
      },
    });
  } catch (error) {
    console.error("좋아요 처리 에러:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
};

// 7. 게시글 싫어요 누르기
exports.toggleDislike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const postIdInt = parseInt(postId);

    const existingLike = await prisma.post_likes.findUnique({
      where: {
        post_id_user_id: {
          post_id: postIdInt,
          user_id: userId,
        },
      },
    });

    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: "이미 좋아요를 누른 상태에서는 싫어요를 누를 수 없습니다.",
      });
    }

    const existingDislike = await prisma.post_dislikes.findUnique({
      where: {
        post_id_user_id: {
          post_id: postIdInt,
          user_id: userId,
        },
      },
    });

    // 이미 싫어요를 눌렀으면 싫어요 취소
    if (existingDislike) {
      await prisma.post_dislikes.delete({
        where: {
          id: existingDislike.id,
        },
      });
    } 
    // 싫어요를 안 눌렀으면 싫어요 추가
    else {
      await prisma.post_dislikes.create({
        data: {
          post_id: postIdInt,
          user_id: userId,
        },
      });
    }

    // 싫어요 처리 후 최신 좋아요/싫어요 개수 조회
    const likeCount = await prisma.post_likes.count({
      where: {
        post_id: postIdInt,
      },
    });

    const dislikeCount = await prisma.post_dislikes.count({
      where: {
        post_id: postIdInt,
      },
    });

    return res.status(200).json({
      success: true,
      message: "싫어요 처리가 완료되었습니다.",
      data: {
        likeCount,
        dislikeCount,
      },
    });
  } catch (error) {
    console.error("싫어요 처리 에러:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
};