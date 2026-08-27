const prisma = require("../lib/prisma");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { uploadToR2, deleteFromR2, extractR2Key } = require("../lib/uploadToR2");

const {
    isValidBoardType,
    isValidCommunityCategory,
    isValidGalleryCategory,
    isValidArchiveCategory,
    isValidMaintenanceCategory,
} = require("../utils/validators");

const {
    isAdmin,
    isOwner,
} = require("../utils/role.util");

// 폴더 경로
const POST_IMAGE_UPLOAD_PATH = [
    "/uploads/post-images/thumbnails/",
    "/uploads/post-images/display/",
];

const POST_FILE_UPLOAD_PATH = "/uploads/post-files/";

// 한 게시글에 첨부할 수 있는 이미지 총 용량 50MB
const MAX_POST_IMAGE_TOTAL_SIZE = 50 * 1024 * 1024;

// 한 사용자가 보유할 수 있는 임시저장 글 최대 개수 (전체 게시판 합산)
const MAX_DRAFT_COUNT = 10;

// 게시글 목록 조회
exports.getAllPosts = async (query, user) => {
    const {
        category,
        exclude_category,
        search,
        page = 1,
        limit = 10,
        board_type = 'COMMUNITY' // 타입 없음 일단 커뮤니티
    } = query;

    // 페이지네이션
    let pageNumber = parseInt(page, 10); // page를 10진수로 해석 (문자열 들어왔을 때 숫자로 변환)
    let limitNumber = parseInt(limit, 10);

    // pageNumber 값 예외처리
    if (Number.isNaN(pageNumber) || pageNumber < 1) {
        pageNumber = 1;
    }
    // limitNumber 값 예외처리
    if (Number.isNaN(limitNumber) || limitNumber < 1 || limitNumber > 10) {
        limitNumber = 10;
    }

    if (!isValidBoardType(board_type)) {
        const error = new Error("올바른 게시판 타입이 아닙니다.");
        error.status = 400;
        throw error;
    }

    if (board_type === "ARCHIVE" && !user) {
        const error = new Error("자료실은 로그인 후 이용할 수 있습니다.");
        error.status = 401;
        throw error;
    }

    if (category && category !== "all" && !isValidCategoryByBoardType(board_type, category)) {
        const error = new Error("올바른 카테고리가 아닙니다.");
        error.status = 400;
        throw error;
    }

    const where = { board_type, is_draft: false };

    if (category && category !== 'all') {
        where.category = category;
    }

    if (exclude_category) {
    where.category = { not: exclude_category };
    }   

    // 검색에 공백 조건 제거
    const trimmedSearch = search?.trim();
    if (trimmedSearch) {
        where.OR = [
            { title: { contains: trimmedSearch } },
            { content: { contains: trimmedSearch } },
        ];
    }

    const totalCount = await prisma.posts.count({ where });

    const posts = await prisma.posts.findMany({
        where,
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        orderBy: { created_at: 'desc' },
        include: {
            users: {
                select: {
                    name: true,
                    student_id: true,
                    status: true,
                    is_active: true,
                },
            },
            post_images: {
                orderBy: { sort_order: "asc" },
                take: 1,
                select: {
                    thumbnail_url: true,
                    display_url: true,
                    original_name: true,
                },
            },
            _count: {
                select: {
                    comments: true,
                    post_likes: true
                },
            },
        },
    });

    return {
        posts, // 게시글 목록
        pagination: {
            total: totalCount,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(totalCount / limitNumber),
        },
    };
};



// 특정 게시글 상세 조회
exports.getPostById = async ({ id, user }) => {
    const postId = parseInt(id, 10);

    // 게시글 id 예외처리
    if (Number.isNaN(postId) || postId < 1) {
        const error = new Error("잘못된 게시글 ID입니다.");
        error.status = 400;
        throw error;
    }

    const post = await prisma.posts.findUnique({
        where: { id: postId },
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
            comments: {
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
                orderBy: { created_at: "desc" },
            },
            post_images: {
                orderBy: {
                    sort_order: "asc",
                },
                select: {
                    id: true,
                    thumbnail_url: true,
                    display_url: true,
                    original_name: true,
                    caption: true,
                    sort_order: true,
                },
            },

            post_files: {
                orderBy: {
                    sort_order: "asc",
                },
                select: {
                    id: true,
                    original_name: true,
                    file_name: true,
                    file_url: true,
                    download_url: true,
                    size: true,
                    sort_order: true,
                },
            },
            _count: {
                select: {
                    post_likes: true,
                    post_dislikes: true,
                },
            },

        },
    });

    if (!post) {
        const error = new Error("게시글을 찾을 수 없습니다.")
        error.status = 404;
        throw error;
    }

    // 임시저장 글은 작성자 본인만 조회 가능
    if (post.is_draft && (!user || Number(user.id) !== Number(post.author_id))) {
        const error = new Error("게시글을 찾을 수 없습니다.");
        error.status = 404;
        throw error;
    }

    if (post.board_type === "ARCHIVE" && !user) {
        const error = new Error("자료실은 로그인 후 이용할 수 있습니다.");
        error.status = 401;
        throw error;
    }

    let existingLike = null;
    let existingDislike = null;

    if (user) {
        existingLike = await prisma.post_likes.findUnique({
            where: {
                post_id_user_id: {
                    post_id: postId,
                    user_id: user.id,
                },
            },
        });

        existingDislike = await prisma.post_dislikes.findUnique({
            where: {
                post_id_user_id: {
                    post_id: postId,
                    user_id: user.id,
                },
            },
        });
    }

    return {
        ...post,
        isLiked: Boolean(existingLike),
        isDisliked: Boolean(existingDislike),
    };
};


// 게시글 조회수 증가
exports.increaseViewCount = async (id) => {
    const postId = parseInt(id, 10);

    // 게시글 id 예외처리
    if (Number.isNaN(postId) || postId < 1) {
        const error = new Error("잘못된 게시글 ID입니다.");
        error.status = 400;
        throw error;
    }

    const post = await prisma.posts.findUnique({
        where: {
            id: postId,
        },
        select: {
            id: true,
        },
    });

    if (!post) {
        const error = new Error("게시글을 찾을 수 없습니다.");
        error.status = 404;
        throw error;
    }

    const updatedPost = await prisma.posts.update({
        where: {
            id: postId,
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

    return updatedPost;
};



// 카테고리 검사
function isValidCategoryByBoardType(boardType, category) {
    if (boardType === "COMMUNITY") {
        return isValidCommunityCategory(category);
    }

    if (boardType === "GALLERY") {
        return isValidGalleryCategory(category);
    }

    if (boardType === "ARCHIVE") {
        return isValidArchiveCategory(category);
    }

    if (boardType === "MAINTENANCE") {
        return isValidMaintenanceCategory(category);
    }

    return false;
}

// 카테고리별 세부 말머리 목록 (없는 카테고리는 세부 말머리 선택 없이 큰 카테고리명이 그대로 말머리)
const SUB_CATEGORY_OPTIONS = {
    free: ["소모임", "게임", "기타"],
    recruit: ["공모전", "스터디", "소모임"],
    notice: ["공지"],
    study: ["초급반", "중급반", "심화반"],
    class: [
        "전필-수업자료/과제",
        "전필-족보",
        "전선-수업자료/과제",
        "전선-족보",
        "교양-수업자료/과제",
        "교양-족보",
    ],
};

function getSubCategoryOptions(category) {
    return SUB_CATEGORY_OPTIONS[category] || null;
}

// 세부 말머리 검사 (isDraft면 필수 검증은 생략하고, 값이 있을 때 유효성만 확인)
function validateSubCategory(category, subCategory, isDraft) {
    const options = getSubCategoryOptions(category);

    if (!options) {
        return null;
    }

    if (!isDraft && !subCategory) {
        const error = new Error("세부 말머리를 선택해주세요.");
        error.status = 400;
        throw error;
    }

    if (subCategory && !options.includes(subCategory)) {
        const error = new Error("올바른 세부 말머리가 아닙니다.");
        error.status = 400;
        throw error;
    }

    return subCategory || null;
}

// 새로운 게시글 작성
exports.createPost = async ({ body, user }) => {
    const { board_type, category, sub_category, title, content, files = [], is_draft } = body;
    const authorId = user.id;
    const userRole = user.role;
    const isDraft = Boolean(is_draft);

    // 임시저장이 아닐 때만 제목/내용 필수
    if (!isDraft && (!title || !content)) {
        const error = new Error("제목과 내용을 입력해주세요.");
        error.status = 400;
        throw error;
    }

    const finalBoardType = board_type || "COMMUNITY";

    // board_type 검사
    if (!isValidBoardType(finalBoardType)) {
        const error = new Error("올바른 게시판 타입이 아닙니다. (COMMUNITY, GALLERY, ARCHIVE, MAINTENANCE 중 하나)");
        error.status = 400;
        throw error;
    }

    // 카테고리 검사
    if (category && !isValidCategoryByBoardType(finalBoardType, category)) {
        const error = new Error("올바른 카테고리가 아닙니다.");
        error.status = 400;
        throw error;
    }

    // 커뮤니티의 공지사항 카테고리는 임원만 작성 가능
    if (finalBoardType === "COMMUNITY" && category === "notice" && !isAdmin(userRole)) {
        const error = new Error("공지사항은 임원만 작성할 수 있습니다.");
        error.status = 403;
        throw error;
    }

    // 자료실의 스터디 카테고리는 임원만 작성 가능
    if (finalBoardType === "ARCHIVE" && category === "study" && !isAdmin(userRole)) {
        const error = new Error("스터디 자료는 임원만 작성할 수 있습니다.");
        error.status = 403;
        throw error;
    }

    // 점검안내 게시판은 임원만 작성 가능
    if (finalBoardType === "MAINTENANCE" && !isAdmin(userRole)) {
        const error = new Error("점검안내는 임원만 작성할 수 있습니다.");
        error.status = 403;
        throw error;
    }

    // 임시저장 개수 제한 (전체 게시판 합산, 최대 10개)
    // 새 임시글을 생성하는 경우에만 검사 (기존 임시글을 이어서 저장하는 건 updatePost가 처리)
    if (isDraft) {
        const draftCount = await prisma.posts.count({
            where: { author_id: authorId, is_draft: true },
        });

        if (draftCount >= MAX_DRAFT_COUNT) {
            const error = new Error(
                `임시저장은 최대 ${MAX_DRAFT_COUNT}개까지 가능합니다. 임시저장 목록을 비운 후 다시 시도해주세요.`
            );
            error.status = 400;
            throw error;
        }
    }

    // 세부 말머리 검사
    const finalSubCategory = validateSubCategory(category, sub_category, isDraft);

    const postImages = extractPostImages(content);

    // 갤러리는 사진 1개 이상 필수 (임시저장은 예외)
    if (!isDraft && finalBoardType === "GALLERY" && postImages.length === 0) {
        const error = new Error("갤러리 게시글은 사진을 1개 이상 첨부해야 합니다.");
        error.status = 400;
        throw error;
    }

    // 한 게시글당 이미지 총 용량 제한
    // if (getPostImageTotalSize(content) > MAX_POST_IMAGE_TOTAL_SIZE) {
    //     const error = new Error("게시글 하나에 첨부할 수 있는 이미지의 총 용량은 50MB까지입니다.");
    //     error.status = 400;
    //     throw error;
    // } 로컬 파일 시스템 기준이라 R2에선 그대로 작동 X

    // transaction 사용해서 게시글 생성 + 이미지 저장 (둘 중 하나 실패하면 db에 둘 다 저장안됨)
    const newPost = await prisma.$transaction(async (tx) => {
        const createdPost = await tx.posts.create({
            data: {
                board_type: finalBoardType,
                category: category || null,
                sub_category: finalSubCategory,
                title: title || "",
                content: content || "",
                author_id: authorId,
                is_draft: isDraft,
            },
        });

        if (postImages.length > 0) {
            await tx.post_images.createMany({
                data: postImages.map((image) => ({
                    post_id: createdPost.id,
                    thumbnail_url: image.thumbnail_url,
                    display_url: image.display_url,
                    original_name: image.original_name,
                    caption: image.caption,
                    sort_order: image.sort_order,
                })),
            });
        }

        if (Array.isArray(files) && files.length > 0) {
            await tx.post_files.createMany({
                data: files.map((file, index) => ({
                    post_id: createdPost.id,
                    original_name: file.originalName,
                    file_name: file.fileName,
                    file_url: file.fileUrl,
                    download_url: file.downloadUrl,
                    size: file.size,
                    sort_order: index,
                })),
            });
        }

        return createdPost;
    });
    return newPost;
};



// 게시글 수정 (본인만 가능)
exports.updatePost = async ({ id, body, user }) => {
    const { board_type, category, sub_category, title, content, files = [], is_draft } = body;
    const userId = user.id;
    const userRole = user.role;
    const isDraft = Boolean(is_draft);

    const postId = parseInt(id, 10);

    if (Number.isNaN(postId) || postId < 1) {
        const error = new Error("잘못된 게시글 ID입니다.");
        error.status = 400;
        throw error;
    }

    // 임시저장이 아닐 때만 제목/내용 필수
    if (!isDraft && (!title || !content)) {
        const error = new Error("제목과 내용을 입력해주세요.");
        error.status = 400;
        throw error;
    }

    const existingPost = await prisma.posts.findUnique({
        where: {
            id: postId,
        },
        include: {
            post_images: true,
            post_files: true,
        },
    });

    if (!existingPost) {
        const error = new Error("게시글을 찾을 수 없습니다.");
        error.status = 404;
        throw error;
    }

    // 본인만 수정 가능
    if (!isOwner(existingPost.author_id, userId)) {
        const error = new Error("본인의 게시글만 수정할 수 있습니다.");
        error.status = 403;
        throw error;
    }

    const finalBoardType = board_type || existingPost.board_type;

    // board_type 검사
    if (!isValidBoardType(finalBoardType)) {
        const error = new Error("올바른 게시판 타입이 아닙니다. (COMMUNITY, GALLERY, ARCHIVE, MAINTENANCE 중 하나)");
        error.status = 400;
        throw error;
    }

    // category 검사
    if (category && !isValidCategoryByBoardType(finalBoardType, category)) {
        const error = new Error("올바른 카테고리가 아닙니다.");
        error.status = 400;
        throw error;
    }

    // 커뮤니티 공지사항은 임원만 가능
    if (finalBoardType === "COMMUNITY" && category === "notice" && !isAdmin(userRole)) {
        const error = new Error("공지사항 카테고리는 임원만 작성할 수 있습니다.");
        error.status = 403;
        throw error;
    }

    // 자료실 스터디는 임원만 가능
    if (finalBoardType === "ARCHIVE" && category === "study" && !isAdmin(userRole)) {
        const error = new Error("스터디 카테고리는 임원만 작성할 수 있습니다.");
        error.status = 403;
        throw error;
    }

    // 점검안내 게시판은 임원만 가능
    if (finalBoardType === "MAINTENANCE" && !isAdmin(userRole)) {
        const error = new Error("점검안내는 임원만 작성할 수 있습니다.");
        error.status = 403;
        throw error;
    }

    // 세부 말머리 검사
    const finalSubCategory = validateSubCategory(category, sub_category, isDraft);

    // 기존 content 이미지 목록
    const oldImageUrls = existingPost.post_images.flatMap((image) => [
        image.thumbnail_url,
        image.display_url,
    ]);

    // 새 content 이미지 목록
    const newImageUrls = extractPostImageUrls(content);
    const postImages = extractPostImages(content);

    const oldFileUrls = existingPost.post_files.map((file) => file.file_url);

    const newFileUrls = Array.isArray(files)
        ? files.map((file) => file.fileUrl).filter(Boolean)
        : [];

    // 갤러리는 수정 후에도 사진 1개 이상 필수 (임시저장은 예외)
    if (!isDraft && finalBoardType === "GALLERY" && postImages.length === 0) {
        const error = new Error("갤러리 게시글은 사진을 1개 이상 첨부해야 합니다.");
        error.status = 400;
        throw error;
    }

    // 한 게시글당 이미지 총 용량 제한
    // if (getPostImageTotalSize(content) > MAX_POST_IMAGE_TOTAL_SIZE) {
    //     const error = new Error("게시글 하나에 첨부할 수 있는 이미지의 총 용량은 50MB까지입니다.");
    //     error.status = 400;
    //     throw error;
    // } 로컬 파일 시스템 기준이라 R2에선 그대로 작동 안함

    // 기존에는 있었는데 수정 후 content에서 빠진 이미지
    const removedImageUrls = oldImageUrls.filter(
        (oldUrl) => !newImageUrls.includes(oldUrl)
    );

    const removedFileUrls = oldFileUrls.filter(
        (oldUrl) => !newFileUrls.includes(oldUrl)
    );

    const updatedPost = await prisma.$transaction(async (tx) => {
        await tx.posts.update({
            where: {
                id: postId,
            },
            data: {
                board_type: finalBoardType,
                category: category || null,
                sub_category: finalSubCategory,
                title: title || "",
                content: content || "",
                is_draft: isDraft,
                updated_at: new Date(),
            },
        });

        // 기존 이미지 DB 기록 삭제
        await tx.post_images.deleteMany({
            where: {
                post_id: postId,
            },
        });

        if (postImages.length > 0) {
            await tx.post_images.createMany({
                data: postImages.map((image) => ({
                    post_id: postId,
                    thumbnail_url: image.thumbnail_url,
                    display_url: image.display_url,
                    original_name: image.original_name,
                    caption: image.caption,
                    sort_order: image.sort_order,
                })),
            });
        }

        await tx.post_files.deleteMany({
            where: {
                post_id: postId,
            },
        });

        if (Array.isArray(files) && files.length > 0) {
            await tx.post_files.createMany({
                data: files.map((file, index) => ({
                    post_id: postId,
                    original_name: file.originalName,
                    file_name: file.fileName,
                    file_url: file.fileUrl,
                    download_url: file.downloadUrl,
                    size: file.size,
                    sort_order: index,
                })),
            });
        }

        return tx.posts.findUnique({
            where: {
                id: postId,
            },
        });
    });

    // DB 수정 성공 후 로컬 이미지 파일 삭제
    await Promise.all(removedImageUrls.map(deleteUploadedPostImage));
    await Promise.all(removedFileUrls.map(deleteUploadedPostFile));

    return updatedPost;
};



// 게시글 삭제 (본인 또는 임원 이상)
exports.deletePost = async ({ id, user }) => {
    const postId = parseInt(id, 10);

    const userId = user.id;
    const userRole = user.role;

    if (Number.isNaN(postId) || postId < 1) {
        const error = new Error("잘못된 게시글 ID입니다.");
        error.status = 400;
        throw error;
    }

    const existingPost = await prisma.posts.findUnique({
        where: { id: postId },
        include: {
            post_images: true,
            post_files: true,
        },
    });

    if (!existingPost) {
        const error = new Error("게시글을 찾을 수 없습니다.");
        error.status = 404;
        throw error;
    }

    // 본인이거나 임원 이상이면 삭제 가능
    if (!isOwner(existingPost.author_id, userId) && !isAdmin(userRole)) {
        const error = new Error("게시글 삭제 권한이 없습니다.");
        error.status = 403;
        throw error;
    }

    // 게시글 본문에 들어간 이미지, 파일 URL 목록 추출
    const imageUrls = existingPost.post_images.flatMap((image) => [
        image.thumbnail_url,
        image.display_url,
    ]);

    const fileUrls = existingPost.post_files.map((file) => file.file_url);

    await prisma.$transaction(async (tx) => {
        // 연결된 댓글 삭제
        await tx.comments.deleteMany({
            where: {
                post_id: postId,
            },
        });

        // 좋아요 삭제
        await tx.post_likes.deleteMany({
            where: {
                post_id: postId,
            },
        });

        // 싫어요 삭제
        await tx.post_dislikes.deleteMany({
            where: {
                post_id: postId,
            },
        });

        // 게시글 이미지 db 기록 삭제
        await tx.post_images.deleteMany({
            where: {
                post_id: postId,
            },
        });

        // 게시글 파일 db 기록 삭제
        await tx.post_files.deleteMany({
            where: {
                post_id: postId
            },
        });

        // 게시글 삭제
        await tx.posts.delete({
            where: {
                id: postId,
            },
        });
    });
    // db 삭제 성공 후, 로컬 이미지 파일 삭제
    await Promise.all([...new Set(imageUrls)].map(deleteUploadedPostImage));
    await Promise.all([...new Set(fileUrls)].map(deleteUploadedPostFile));

    return true;
};



// 게시글 좋아요 누르기
exports.toggleLike = async ({ postId, user }) => {
    const userId = user.id;
    const postIdInt = parseInt(postId, 10);

    if (Number.isNaN(postIdInt) || postIdInt < 1) {
        const error = new Error("잘못된 게시글 ID입니다.");
        error.status = 400;
        throw error;
    }

    const post = await prisma.posts.findUnique({
        where: {
            id: postIdInt,
        },
        select: {
            id: true,
        },
    });

    if (!post) {
        const error = new Error("게시글을 찾을 수 없습니다.");
        error.status = 404;
        throw error;
    }

    const existingDislike = await prisma.post_dislikes.findUnique({
        where: {
            post_id_user_id: {
                post_id: postIdInt,
                user_id: userId,
            },
        },
    });

    if (existingDislike) {
        const error = new Error("이미 싫어요를 누른 상태에서는 좋아요를 누를 수 없습니다.");
        error.status = 400;
        throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
        const existingLike = await tx.post_likes.findUnique({
            where: {
                post_id_user_id: {
                    post_id: postIdInt,
                    user_id: userId,
                },
            },
        });

        // 이미 좋아요를 눌렀으면 좋아요 취소
        if (existingLike) {
            await tx.post_likes.delete({
                where: {
                    id: existingLike.id,
                },
            });
        }
        // 좋아요를 안 눌렀으면 좋아요 추가
        else {
            await tx.post_likes.create({
                data: {
                    post_id: postIdInt,
                    user_id: userId,
                },
            });
        }

        // 좋아요 처리 후 최신 좋아요/싫어요 개수 조회
        const likeCount = await tx.post_likes.count({
            where: {
                post_id: postIdInt,
            },
        });

        const dislikeCount = await tx.post_dislikes.count({
            where: {
                post_id: postIdInt,
            },
        });

        return {
            likeCount,
            dislikeCount,
            isLiked: !existingLike,
            isDisliked: false,
        };
    });
    return result;
};



// 게시글 싫어요 누르기
exports.toggleDislike = async ({ postId, user }) => {
    const userId = user.id;
    const postIdInt = parseInt(postId, 10);

    if (Number.isNaN(postIdInt) || postIdInt < 1) {
        const error = new Error("잘못된 게시글 ID입니다.");
        error.status = 400;
        throw error;
    }

    const post = await prisma.posts.findUnique({
        where: {
            id: postIdInt,
        },
        select: {
            id: true,
        },
    });

    if (!post) {
        const error = new Error("게시글을 찾을 수 없습니다.");
        error.status = 404;
        throw error;
    }

    const existingLike = await prisma.post_likes.findUnique({
        where: {
            post_id_user_id: {
                post_id: postIdInt,
                user_id: userId,
            },
        },
    });

    if (existingLike) {
        const error = new Error("이미 좋아요 누른 상태에서는 싫어요를 누를 수 없습니다.");
        error.status = 400;
        throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
        const existingDislike = await tx.post_dislikes.findUnique({
            where: {
                post_id_user_id: {
                    post_id: postIdInt,
                    user_id: userId,
                },
            },
        });

        // 이미 싫어요를 눌렀으면 싫어요 취소
        if (existingDislike) {
            await tx.post_dislikes.delete({
                where: {
                    id: existingDislike.id,
                },
            });
        }
        // 싫어요를 안 눌렀으면 싫어요 추가
        else {
            await tx.post_dislikes.create({
                data: {
                    post_id: postIdInt,
                    user_id: userId,
                },
            });
        }

        const likeCount = await tx.post_likes.count({
            where: {
                post_id: postIdInt,
            },
        });

        const dislikeCount = await tx.post_dislikes.count({
            where: {
                post_id: postIdInt,
            },
        });

        return {
            likeCount,
            dislikeCount,
            isLiked: false,
            isDisliked: !existingDislike,
        };
    });
    return result;
};



// 게시글 이미지 업로드
exports.uploadPostImages = async (files) => {
    try {
        if (!files || files.length === 0) {
            const error = new Error("업로드된 이미지가 없습니다.");
            error.status = 400;
            throw error;
        }

        const uploadedImages = [];

        for (const file of files) {
            const baseName = Date.now() + "-" + Math.round(Math.random() * 1e9);

            // 게시글 목록/게시글 상세 미리보기용: WebP 픽셀 리사이징
            const thumbnailBuffer = await sharp(file.path)
                .rotate()
                .resize({ width: 400, withoutEnlargement: true })
                .webp({ quality: 75 })
                .toBuffer();

            // 저장용 JPEG
            const displayBuffer = await sharp(file.path)
                .rotate()
                .resize({ width: 1600, withoutEnlargement: true })
                .jpeg({ quality: 82, mozjpeg: true })
                .toBuffer();

            const thumbnailFileName = `${baseName}.webp`;
            const displayFileName = `${baseName}.jpg`;

            const thumbnailUrl = await uploadToR2(
                thumbnailBuffer,
                thumbnailFileName,
                "image/webp",
                "post-images/thumbnails"
            );

            const displayUrl = await uploadToR2(
                displayBuffer,
                displayFileName,
                "image/jpeg",
                "post-images/display"
            );

            // 임시 원본 삭제 (multer가 로컬에 저장한 원본)
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }

            uploadedImages.push({
                originalName: fixKoreanFileName(file.originalname),
                thumbnailFileName,
                displayFileName,
                thumbnailUrl,   // 완전한 R2 URL
                displayUrl,     // 완전한 R2 URL
                originalSize: file.size,
            });
        }

        return uploadedImages;
    } catch (error) {
        cleanupUploadedTempFiles(files);
        error.status = error.status || 500;
        error.message = error.message || "게시글 이미지 업로드 중 오류가 발생했습니다.";
        throw error;
    }
};


// 업로드했지만 게시글에 사용하지 않은 이미지 삭제
exports.deleteUnusedPostImages = async (images) => {
    if (!Array.isArray(images)) {
        const error = new Error("삭제할 이미지 목록이 올바르지 않습니다.");
        error.status = 400;
        throw error;
    }

    await Promise.all(
        images.map(async (image) => {
            if (!image || typeof image !== "object") return;
            await deleteUploadedPostImage(image.thumbnailUrl);
            await deleteUploadedPostImage(image.displayUrl);
        })
    );

    return true;
};



// 파일 업로드
exports.uploadPostFiles = async (files) => {
    try {
        if (!files || files.length === 0) {
            const error = new Error("업로드된 파일이 없습니다.");
            error.status = 400;
            throw error;
        }

        const uploadedFiles = [];

        for (const file of files) {
            const originalName = fixKoreanFileName(file.originalname);
            const fileBuffer = fs.readFileSync(file.path);

            const fileUrl = await uploadToR2(
                fileBuffer,
                originalName,
                file.mimetype,
                "post-files"
            );

            // 로컬 임시 파일 삭제
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }

            uploadedFiles.push({
                originalName,
                fileName: originalName,
                fileUrl,          // 완전한 R2 URL
                downloadUrl: fileUrl, // R2 URL 자체가 다운로드 링크
                size: file.size,
            });
        }

        return uploadedFiles;
    } catch (error) {
        cleanupUploadedTempFiles(files);
        error.status = error.status || 500;
        error.message = error.message || "파일 업로드 중 오류가 발생했습니다.";
        throw error;
    }
};



// 파일 다운로드
exports.getPostFileForDownload = async ({ fileName, originalName }) => {
    if (!fileName) {
        const error = new Error("파일명이 올바르지 않습니다.");
        error.status = 400;
        throw error;
    }

    const safeFileName = path.basename(fileName);

    if (safeFileName !== fileName) {
        const error = new Error("잘못된 파일 경로입니다.");
        error.status = 400;
        throw error;
    }

    const fileDir = path.join(__dirname, "../../uploads/post-files");
    const filePath = path.join(fileDir, safeFileName);

    if (!fs.existsSync(filePath)) {
        const error = new Error("파일을 찾을 수 없습니다.");
        error.status = 404;
        throw error;
    }
    return {
        filePath,
        originalName: originalName || safeFileName,
    };
};



// 업로드했지만 게시글에 사용하지 않은 파일 삭제
exports.deleteUnusedPostFiles = async (files) => {
    if (!Array.isArray(files)) {
        const error = new Error("삭제할 파일 목록이 올바르지 않습니다.");
        error.status = 400;
        throw error;
    }

    await Promise.all(
        files.map(async (file) => {
            if (!file || typeof file !== "object") return;
            await deleteUploadedPostFile(file.fileUrl);
        })
    );

    return true;
};


exports.getMyPosts = async ({ user, query }) => {
    const userId = Number(user.id);
    const { page = 1, limit = 5, category = "all", sort = "latest" } = query;

    let pageNumber = parseInt(page, 10);
    let limitNumber = parseInt(limit, 10);

    if (Number.isNaN(userId) || userId < 1) {
        const error = new Error("잘못된 사용자 ID입니다.");
        error.statusCode = 400;
        throw error;
    }

    if (Number.isNaN(pageNumber) || pageNumber < 1) {
        pageNumber = 1;
    }

    if (Number.isNaN(limitNumber) || limitNumber < 1 || limitNumber > 10) {
        limitNumber = 5;
    }

    const validMyPostCategories = [
        "notice",
        "free",
        "qna",
        "recruit",
        "study",
        "class",
        "project",
        "contest",
        "activity",
        "maintenance",
        "uncategorized",
    ];
    const normalizedCategory = String(category || "all");
    const normalizedSort = String(sort || "latest");
    const orderByMap = {
        latest: [{ created_at: "desc" }, { id: "desc" }],
        views: [{ view_count: "desc" }, { created_at: "desc" }, { id: "desc" }],
        likes: [{ post_likes: { _count: "desc" } }, { created_at: "desc" }, { id: "desc" }],
        comments: [{ comments: { _count: "desc" } }, { created_at: "desc" }, { id: "desc" }],
    };

    if (normalizedCategory !== "all" && !validMyPostCategories.includes(normalizedCategory)) {
        const error = new Error("올바른 카테고리가 아닙니다.");
        error.statusCode = 400;
        throw error;
    }

    if (!orderByMap[normalizedSort]) {
        const error = new Error("올바른 정렬 기준이 아닙니다.");
        error.statusCode = 400;
        throw error;
    }

    const where = {
        author_id: userId,
        is_draft: false,
    };

    if (normalizedCategory === "uncategorized") {
        where.category = null;
    } else if (normalizedCategory !== "all") {
        where.category = normalizedCategory;
    }

    const totalCount = await prisma.posts.count({
        where,
    });

    const posts = await prisma.posts.findMany({
        where,
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        orderBy: orderByMap[normalizedSort],
        include: {
            users: {
                select: {
                    name: true,
                    student_id: true,
                    status: true,
                    is_active: true,
                },
            },
            _count: {
                select: {
                    comments: true,
                    post_likes: true,
                },
            },
        },
    });

    return {
        posts,
        pagination: {
            total: totalCount,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(totalCount / limitNumber),
        },
    };
};

// 임시저장 글 목록 조회 (본인만)
exports.getMyDrafts = async ({ user }) => {
    const userId = Number(user.id);

    if (Number.isNaN(userId) || userId < 1) {
        const error = new Error("잘못된 사용자 ID입니다.");
        error.status = 400;
        throw error;
    }

    const drafts = await prisma.posts.findMany({
        where: {
            author_id: userId,
            is_draft: true,
        },
        orderBy: { updated_at: "desc" },
        select: {
            id: true,
            board_type: true,
            category: true,
            title: true,
            updated_at: true,
            created_at: true,
        },
    });

    return drafts;
};

exports.getMyPostCategoryStats = async ({ user }) => {
    const userId = Number(user.id);

    if (Number.isNaN(userId) || userId < 1) {
        const error = new Error("잘못된 사용자 ID입니다.");
        error.statusCode = 400;
        throw error;
    }

    const stats = await prisma.posts.groupBy({
        by: ["category"],
        where: {
            author_id: userId,
        },
        _count: {
            _all: true,
        },
    });

    return stats
        .map((item) => ({
            category: item.category || "uncategorized",
            count: item._count._all,
        }))
        .sort((a, b) => b.count - a.count);
};

exports.getMyPostActivityStats = async ({ user, query }) => {
    const userId = Number(user.id);
    const currentYear = new Date().getFullYear();
    let yearNumber = parseInt(query.year, 10);

    if (Number.isNaN(userId) || userId < 1) {
        const error = new Error("잘못된 사용자 ID입니다.");
        error.statusCode = 400;
        throw error;
    }

    if (Number.isNaN(yearNumber) || yearNumber < 2000 || yearNumber > currentYear) {
        yearNumber = currentYear;
    }

    const posts = await prisma.posts.findMany({
        where: {
            author_id: userId,
            created_at: {
                gte: new Date(yearNumber, 0, 1),
                lt: new Date(yearNumber + 1, 0, 1),
            },
        },
        select: {
            created_at: true,
        },
    });

    const countByDate = posts.reduce((stats, post) => {
        if (!post.created_at) return stats;

        const date = new Date(post.created_at);
        const dateKey = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0"),
        ].join("-");

        stats[dateKey] = (stats[dateKey] || 0) + 1;
        return stats;
    }, {});

    const activity = Object.entries(countByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return {
        year: yearNumber,
        total: posts.length,
        activity,
    };
};







//==========내부 helper 함수==========//

// 이미지 URL 서버 파일 경로로 변경
function getLocalPostImagePath(imageUrl) {
    if (!imageUrl) return null;

    const matchedPath = POST_IMAGE_UPLOAD_PATH.find((uploadPath) =>
        imageUrl.includes(uploadPath)
    );

    if (!matchedPath) return null;

    const uploadsIndex = imageUrl.indexOf(matchedPath);
    const relativePath = imageUrl.slice(uploadsIndex + 1);

    return path.join(__dirname, "../../", relativePath);
}

// 이미지 URL 뽑아내기
function extractPostImageUrls(content) {
    if (!content) return [];

    const urls = [];
    const imgRegex = /<img[^>]*>/g;

    let match;

    while ((match = imgRegex.exec(content)) !== null) {
        const imgTag = match[0];

        const srcMatch = imgTag.match(/src=["']([^"']+)["']/);
        const displayMatch = imgTag.match(/data-display=["']([^"']+)["']/);

        if (srcMatch) urls.push(srcMatch[1]);
        if (displayMatch) urls.push(displayMatch[1]);
    }

    return urls;
}

// 이미지 db로 저장하기
function extractPostImages(content) {
    if (!content) return [];

    const imgRegex = /<img[^>]*>/g;
    const images = [];

    let match;
    let index = 0;

    while ((match = imgRegex.exec(content)) !== null) {
        const imgTag = match[0];

        const srcMatch = imgTag.match(/src=["']([^"']+)["']/);
        if (!srcMatch) continue;

        const thumbnailUrl = srcMatch[1];
        const displayMatch = imgTag.match(/data-display=["']([^"']+)["']/);
        const altMatch = imgTag.match(/alt=["']([^"']*)["']/);

        images.push({
            thumbnail_url: thumbnailUrl,
            display_url: displayMatch ? displayMatch[1] : thumbnailUrl,
            original_name: altMatch ? altMatch[1] : null,
            caption: null,
            sort_order: index,
        });

        index++;
    }

    return images;
}

// 서버에 저장된 이미지 파일 삭제하기 (R2)
async function deleteUploadedPostImage(imageUrl) {
    const key = extractR2Key(imageUrl);
    if (!key) return;
    try {
        await deleteFromR2(key);
    } catch (err) {
        console.error("R2 이미지 삭제 실패:", err);
    }
}

// 이미지 하나 당 용량 제한
function getUploadedImageFileSize(imageUrl) {
    const filePath = getLocalPostImagePath(imageUrl);

    if (!filePath) return 0;

    if (!fs.existsSync(filePath)) return 0;

    return fs.statSync(filePath).size;
}

// 게시글 당 이미지 용량 제한
function getPostImageTotalSize(content) {
    const imageUrls = extractPostImageUrls(content);
    const uniqueImageUrls = [...new Set(imageUrls)];

    return uniqueImageUrls.reduce((total, imageUrl) => {
        return total + getUploadedImageFileSize(imageUrl);
    }, 0);
}

// 서버 폴더 없으면 생성
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function deleteLocalFile(filePath) {
    if (!filePath) return;

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

// 올렸던 파일 제거 기능 (R2)
async function deleteUploadedPostFile(fileUrl) {
    const key = extractR2Key(fileUrl);
    if (!key) return;
    try {
        await deleteFromR2(key);
    } catch (err) {
        console.error("R2 파일 삭제 실패:", err);
    }
}

function cleanupUploadedTempFiles(files) {
    if (!files) return;

    files.forEach((file) => {
        deleteLocalFile(file.path);
    });
}

// 한글 파일명 깨짐 방지 함수
function fixKoreanFileName(fileName) {
    try {
        const decodedName = Buffer.from(fileName, "latin1").toString("utf8");

        if (decodedName.includes("�")) {
            return fileName;
        }

        return decodedName;
    } catch {
        return fileName;
    }
}

exports.streamImageDownload = async ({ url, filename, res }) => {
  if (!url || !url.startsWith(process.env.R2_PUBLIC_URL)) {
    const error = new Error("잘못된 요청입니다.");
    error.status = 400;
    throw error;
  }

  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error("이미지를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  res.setHeader(
    "Content-Disposition",
    `attachment; filename*=UTF-8''${encodeURIComponent(filename || "image.jpg")}`
  );
  res.setHeader("Content-Type", response.headers.get("content-type") || "image/jpeg");

  const buffer = Buffer.from(await response.arrayBuffer());
  res.send(buffer);
};
