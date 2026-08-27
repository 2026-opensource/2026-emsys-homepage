const prisma = require('../lib/prisma');

// 특정 게시글의 전체 댓글 목록 조회 (최신순으로 정렬)
exports.getCommentsByPostId = async (postId) => {
    return await prisma.comments.findMany({
        where: { post_id: parseInt(postId) },
        orderBy: { created_at: 'desc' },
        include: {
            users: { select: { name: true, student_id: true, status: true, is_active: true, profile_image: true } }
        }
    });
};

// 새로운 댓글 작성 (parent_id가 있으면 대댓글)
exports.createComment = async (post_id, content, author_id, parent_id) => {
    const postIdInt = parseInt(post_id);
    let parentIdInt = null;

    if (parent_id !== undefined && parent_id !== null && parent_id !== "") {
        parentIdInt = parseInt(parent_id);

        if (Number.isNaN(parentIdInt)) {
            const error = new Error("parent_id는 숫자여야 합니다.");
            error.status = 400;
            throw error;
        }

        const parentComment = await prisma.comments.findUnique({
            where: { id: parentIdInt },
        });

        if (!parentComment || parentComment.post_id !== postIdInt) {
            const error = new Error("답글을 달 댓글을 찾을 수 없습니다.");
            error.status = 404;
            throw error;
        }

        // 대댓글은 1단계까지만 허용 (답글에는 답글 불가)
        if (parentComment.parent_id) {
            const error = new Error("답글에는 답글을 달 수 없습니다.");
            error.status = 400;
            throw error;
        }
    }

    const newComment = await prisma.comments.create({
        data: {
            post_id: postIdInt,
            author_id: author_id,
            content: content.trim(),
            parent_id: parentIdInt,
        },
        include: {
            users: {
                select: {
                    name: true,
                    student_id: true,
                    status: true,
                    is_active: true,
                    profile_image: true,
                },
            },
        },
    });

    return newComment;
};

// 댓글 수정 (본인만 가능)
exports.updateComment = async (id, content, userId) => {
    const commentId = parseInt(id);

    const existingComment = await prisma.comments.findUnique({
        where: { id: commentId }
    });

    if (!existingComment) {
        const error = new Error("댓글을 찾을 수 없습니다.");
        error.status = 404;
        throw error;
    }

    // 본인 확인
    if (existingComment.author_id !== userId) {
        const error = new Error("본인의 댓글만 수정할 수 있습니다.");
        error.status = 403;
        throw error;
    }

    // MySQL의 NOW()로 한국 시간 저장
    await prisma.$executeRaw
        `UPDATE comments 
    SET content = ${content.trim()}, updated_at = NOW() 
    WHERE id = ${commentId}`
        ;

    // 수정된 댓글 다시 조회
    const result = await prisma.comments.findUnique({
        where: { id: commentId },
        include: {
            users: { select: { name: true, student_id: true, status: true, is_active: true, profile_image: true, } }
        }
    });

    return result;
};

// 댓글 삭제 (본인 또는 임원 이상만)
exports.deleteComment = async (id, userId, userRole) => {
    const commentId = parseInt(id);

    const existingComment = await prisma.comments.findUnique({
        where: { id: commentId }
    });

    if (!existingComment) {
        const error = new Error("댓글을 찾을 수 없습니다.");
        error.status = 404;
        throw error;
    }

    // 본인이거나 임원 이상이면 삭제 가능
    const isOwner = existingComment.author_id === userId;
    const isAdmin = userRole === 'OFFICER' || userRole === 'PRESIDENT';

    if (!isOwner && !isAdmin) {
        const error = new Error("댓글 삭제 권한이 없습니다.");
        error.status = 403;
        throw error;
    }

    await prisma.comments.delete({
        where: { id: commentId }
    });
};
