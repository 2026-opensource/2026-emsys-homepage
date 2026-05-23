const express = require("express");
const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

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
 *                 example: "EMSYS-ABC123"
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

module.exports = router;