const express = require("express");
const path = require("path");
const multer = require("multer");
const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../uploads/profile-images"));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${req.user.id}-${Date.now()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("이미지 파일만 업로드할 수 있습니다."));
        }

        cb(null, true);
    },
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 인증 관련 API
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 회원가입
 *     description: 사용자의 회원가입 정보를 받아 MySQL users 테이블에 저장합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - passwordConfirm
 *               - name
 *               - student_id
 *               - status
 *               - invitationCode
 *             properties:
 *               email:
 *                 type: string
 *                 example: "student@chungbuk.ac.kr"
 *               password:
 *                 type: string
 *                 example: "abc12345"
 *               passwordConfirm:
 *                 type: string
 *                 example: "abc12345"
 *               name:
 *                 type: string
 *                 example: "홍길동"
 *               student_id:
 *                 type: string
 *                 example: "202123456"
 *               status:
 *                 type: string
 *                 enum: ["재학생", "휴학생", "졸업생"]
 *                 example: "재학생"
 *               invitationCode:
 *                 type: string
 *                 example: "A1B2C3D4"
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *       400:
 *         description: 입력값 오류
 *       409:
 *         description: 이메일 또는 학번 중복
 *       500:
 *         description: 서버 오류
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 로그인
 *     description: 이메일과 비밀번호를 확인하고 JWT 토큰을 발급합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "student@chungbuk.ac.kr"
 *               password:
 *                 type: string
 *                 example: "abc12345"
 *     responses:
 *       200:
 *         description: 로그인 성공
 *       400:
 *         description: 입력값 오류
 *       401:
 *         description: 로그인 실패
 *       500:
 *         description: 서버 오류
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 현재 로그인 사용자 정보 조회
 *     description: JWT 토큰을 확인하고 현재 로그인한 사용자 정보를 반환합니다.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 인증 성공
 *       401:
 *         description: 인증 실패
 */

router.get("/me", requireAuth, (req, res) => {
    res.json({
        success: true,
        message: "인증 성공",
        data: req.user,
    });
});

/**
 * @swagger
 * /api/auth/find-email:
 *   post:
 *     summary: 아이디/이메일 찾기
 *     description: 이름과 학번을 확인하여 가입된 이메일을 반환합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - student_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: "홍길동"
 *               student_id:
 *                 type: string
 *                 example: "202123456"
 *     responses:
 *       200:
 *         description: 이메일 조회 성공
 *       400:
 *         description: 입력값 오류
 *       404:
 *         description: 일치하는 사용자 없음
 *       500:
 *         description: 서버 오류
 */
router.patch(
    "/me/profile-image",
    requireAuth,
    upload.single("profileImage"),
    authController.updateProfileImage
);

router.delete(
    "/me/profile-image",
    requireAuth,
    authController.resetProfileImage
);

router.post("/find-email", authController.findEmail);

/**
 * @swagger
 * /api/auth/verify-password-user:
 *   post:
 *     summary: 비밀번호 변경 전 사용자 정보 확인
 *     description: 이름, 학번, 이메일이 모두 일치하는지 확인하고 비밀번호 변경용 임시 토큰을 발급합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - student_id
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: "홍길동"
 *               student_id:
 *                 type: string
 *                 example: "202123456"
 *               email:
 *                 type: string
 *                 example: "student@chungbuk.ac.kr"
 *     responses:
 *       200:
 *         description: 사용자 정보 확인 성공
 *       400:
 *         description: 입력값 오류
 *       404:
 *         description: 사용자 정보 불일치
 *       500:
 *         description: 서버 오류
 */
router.post("/verify-password-user", authController.verifyPasswordUser);

/**
 * @swagger
 * /api/auth/password:
 *   patch:
 *     summary: 비밀번호 변경
 *     description: 비밀번호 변경용 임시 토큰을 확인한 뒤 새 비밀번호로 변경합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resetToken
 *               - newPassword
 *               - newPasswordConfirm
 *             properties:
 *               resetToken:
 *                 type: string
 *                 example: "temporary_reset_token"
 *               newPassword:
 *                 type: string
 *                 example: "newpass123"
 *               newPasswordConfirm:
 *                 type: string
 *                 example: "newpass123"
 *     responses:
 *       200:
 *         description: 비밀번호 변경 성공
 *       400:
 *         description: 입력값 오류
 *       401:
 *         description: 임시 토큰 만료 또는 유효하지 않음
 *       403:
 *         description: 비밀번호를 변경할 수 없는 계정
 *       500:
 *         description: 서버 오류
 */
router.patch("/password", authController.changePassword);

module.exports = router;
