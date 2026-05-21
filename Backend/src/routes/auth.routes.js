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

router.get("/me", requireAuth, (req, res) => {
    res.json({
        success: true,
        message: "인증 성공",
        data: req.user,
    });
});

module.exports = router;