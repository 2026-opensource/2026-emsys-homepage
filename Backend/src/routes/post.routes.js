const express = require("express");
const router = express.Router();

const postController = require("../controllers/post.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
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

// 게시글 첨부파일 다운로드 라우터
router.get(
    "/download/post-files/:fileName",
    postController.downloadPostFile
);

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: 전체 게시글 조회 (검색, 필터링, 페이지네이션 포함)
 *     description: 누구나 조회 가능 (비회원 포함)
 *     tags: [Post]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 카테고리 필터 (전체, 자유, 공지사항, 공모전/대회, 질문)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 검색어 (제목 또는 내용)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지당 게시글 수
 *       - in: query
 *         name: board_type
 *         schema:
 *           type: string
 *           default: COMMUNITY
 *         description: 게시판 타입 (COMMUNITY, ARCHIVE, GALLERY 등)
 *     responses:
 *       200:
 *         description: 조회 성공
 */
router.get('/', postController.getAllPosts);

// 사용자 본인 게시글만 불러오게
router.get('/my', requireAuth, postController.getMyPosts);

/**
 * @swagger
 * /api/posts/{id}/view:
 *   post:
 *     summary: 게시글 조회수 증가
 *     description: 게시글 상세 페이지에 처음 진입했을 때 조회수를 1 증가시킵니다.
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 게시글 ID
 *     responses:
 *       200:
 *         description: 조회수 증가 성공
 *       401:
 *         description: 로그인 필요
 *       404:
 *         description: 게시글을 찾을 수 없음
 */
router.post('/:id/view', requireAuth, postController.increaseViewCount);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: 게시글 상세 조회
 *     description: 로그인한 회원만 조회 가능
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 게시글 ID
 *     responses:
 *       200:
 *         description: 조회 성공
 *       401:
 *         description: 로그인 필요
 *       404:
 *         description: 게시글을 찾을 수 없음
 */
router.get('/:id', requireAuth, postController.getPostById);

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: 새로운 게시글 작성
 *     description: 로그인한 회원만 작성 가능 (공지사항은 임원 이상만)
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               board_type:
 *                 type: string
 *                 description: 게시판 타입 (COMMUNITY, ARCHIVE, GALLERY)
 *                 example: "COMMUNITY"
 *               category:
 *                 type: string
 *                 description: 카테고리 (자유, 공지사항, 공모전/대회, 질문)
 *                 example: "자유"
 *               title:
 *                 type: string
 *                 description: 게시글 제목
 *                 example: "첫 번째 게시글입니다"
 *               content:
 *                 type: string
 *                 description: 게시글 내용
 *                 example: "안녕하세요, 반갑습니다!"
 *     responses:
 *       201:
 *         description: 작성 성공
 *       400:
 *         description: 필수 필드 누락
 *       401:
 *         description: 로그인 필요
 *       403:
 *         description: 권한 없음 (갤러리/공지사항)
 */
router.post('/', requireAuth, postController.createPost);

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: 게시글 수정
 *     description: 본인 또는 임원 이상만 수정 가능
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 게시글 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               board_type:
 *                 type: string
 *                 description: 게시판 타입
 *                 example: "COMMUNITY"
 *               category:
 *                 type: string
 *                 description: 카테고리
 *                 example: "자유게시판"
 *               title:
 *                 type: string
 *                 description: 게시글 제목
 *                 example: "수정된 제목"
 *               content:
 *                 type: string
 *                 description: 게시글 내용
 *                 example: "수정된 내용입니다."
 *     responses:
 *       200:
 *         description: 수정 성공
 *       401:
 *         description: 로그인 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 게시글을 찾을 수 없음
 */
router.put('/:id', requireAuth, postController.updatePost);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: 게시글 삭제
 *     description: 본인 또는 임원 이상만 삭제 가능
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 게시글 ID
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       401:
 *         description: 로그인 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 게시글을 찾을 수 없음
 */
router.delete('/:id', requireAuth, postController.deletePost);

/**
 * @swagger
 * /api/posts/{postId}/like:
 *   post:
 *     summary: 게시글 좋아요 토글
 *     description: 로그인한 회원만 가능
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 게시글 ID
 *     responses:
 *       200:
 *         description: 좋아요 토글 성공
 *       400:
 *         description: 이미 싫어요를 누른 상태
 *       401:
 *         description: 로그인 필요
 */
router.post('/:postId/like', requireAuth, postController.toggleLike);

/**
 * @swagger
 * /api/posts/{postId}/dislike:
 *   post:
 *     summary: 게시글 싫어요 토글
 *     description: 로그인한 회원만 가능
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 게시글 ID
 *     responses:
 *       200:
 *         description: 싫어요 토글 성공
 *       400:
 *         description: 이미 좋아요를 누른 상태
 *       401:
 *         description: 로그인 필요
 */
router.post('/:postId/dislike', requireAuth, postController.toggleDislike);

router.use(uploadErrorHandler);

module.exports = router;