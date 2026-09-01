const express = require("express");
const router = express.Router();

const postController = require("../controllers/post.controller");
const { requireAuth, optionalAuth } = require("../middlewares/auth.middleware");
const { uploadPostImages, uploadPostFiles } = require("../middlewares/post.middleware");
const uploadErrorHandler = require("../middlewares/uploadError.middleware");

// 게시글 이미지 업로드 라우터
router.post(
    "/upload/post-images",
    requireAuth,
    uploadPostImages.array("images"),
    postController.uploadPostImages
);

// 게시글 첨부파일 업로드 라우터
router.post(
    "/upload/post-files",
    requireAuth,
    uploadPostFiles.array("files"),
    postController.uploadPostFiles
);

// 게시글 이미지 삭제 라우터
router.delete(
    "/upload/post-images",
    requireAuth,
    postController.deleteUnusedPostImages
);

// 게시글 첨부파일 삭제 라우터
router.delete(
    "/upload/post-files",
    requireAuth,
    postController.deleteUnusedPostFiles
);

// 업로드(멀터) 관련 라우터에서 발생한 에러만 여기서 처리.
// 라우터 맨 아래에 두면 이후에 등록된 모든 라우트(글쓰기, 점검 조회 등)의
// 에러까지 전부 가로채서 무조건 400으로 뭉개버리기 때문에, 업로드 라우터
// 바로 다음(다른 라우트들보다 앞)에 둬야 함.
router.use(uploadErrorHandler);

// 게시글 첨부파일 다운로드 라우터
router.get(
    "/download/post-files/:fileName",
    requireAuth,
    postController.downloadPostFile
);

router.get("/download-proxy", requireAuth, postController.downloadImageProxy);

router.get('/', optionalAuth, postController.getAllPosts);

router.get('/popular', optionalAuth, postController.getPopularPosts);

router.get('/maintenance/active', postController.getActiveMaintenancePost);

router.get('/maintenance/latest', postController.getLatestMaintenancePost);

// 사용자 본인 게시글만 불러오게
router.get('/my/category-stats', requireAuth, postController.getMyPostCategoryStats);

router.get('/my/activity', requireAuth, postController.getMyPostActivityStats);

router.get('/my/drafts', requireAuth, postController.getMyDrafts);

router.get('/my', requireAuth, postController.getMyPosts);

router.get('/users/:userId/category-stats', requireAuth, postController.getUserPostCategoryStats);

router.get('/users/:userId/activity', requireAuth, postController.getUserPostActivityStats);

router.get('/users/:userId', requireAuth, postController.getUserPosts);

router.post('/:id/view', postController.increaseViewCount);

router.get('/:id', optionalAuth, postController.getPostById);

router.post('/', requireAuth, postController.createPost);

router.put('/:id', requireAuth, postController.updatePost);

router.delete('/:id', requireAuth, postController.deletePost);

router.post('/:postId/like', requireAuth, postController.toggleLike);

router.post('/:postId/dislike', requireAuth, postController.toggleDislike);

module.exports = router;
