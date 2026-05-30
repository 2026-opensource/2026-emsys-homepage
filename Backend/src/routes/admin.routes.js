const express = require("express");
const adminController = require("../controllers/admin.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireAdmin, requirePresident  } = require("../middlewares/role.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: 관리자 관련 API
 */

/**
 * @swagger
 * /api/admin/test:
 *   get:
 *     summary: 관리자 권한 테스트
 *     description: JWT 토큰을 확인하고, 임원 또는 회장 권한이 있는 사용자만 접근할 수 있습니다.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 관리자 권한 확인 성공
 *       401:
 *         description: 로그인 필요 또는 토큰 오류
 *       403:
 *         description: 관리자 권한 없음
 *       500:
 *         description: 서버 오류
 */
router.get("/test", 
    requireAuth, 
    requireAdmin,
    adminController.adminTest
);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: 부원 목록 조회
 *     description: 관리자 권한을 가진 사용자가 부원 목록을 조회합니다. keyword로 이름 또는 학번 검색이 가능하고, active 값으로 활동/비활성 회원을 필터링할 수 있습니다.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: false
 *         schema:
 *           type: string
 *         description: 이름 또는 학번 검색어
 *         example: "홍길동"
 *       - in: query
 *         name: active
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: 활동 여부 필터. true는 활동 중, false는 비활성 회원
 *         example: "true"
 *     responses:
 *       200:
 *         description: 부원 목록 조회 성공
 *       401:
 *         description: 로그인 필요 또는 토큰 오류
 *       403:
 *         description: 관리자 권한 없음
 *       500:
 *         description: 서버 오류
 */
router.get("/users", 
    requireAuth, 
    requireAdmin, 
    adminController.getUsers
);

/**
 * @swagger
 * /api/admin/users/status:
 *   patch:
 *     summary: 부원 학적 상태 일괄 변경
 *     description: 관리자 권한을 가진 사용자가 선택한 부원들의 학적 상태를 일괄 변경합니다.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *               - status
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               status:
 *                 type: string
 *                 enum: ["재학생", "휴학생", "졸업생"]
 *                 example: "휴학생"
 *     responses:
 *       200:
 *         description: 부원 학적 상태 변경 성공
 *       400:
 *         description: 입력값 오류
 *       401:
 *         description: 로그인 필요 또는 토큰 오류
 *       403:
 *         description: 관리자 권한 없음
 *       500:
 *         description: 서버 오류
 */
router.patch(
    "/users/status",
    requireAuth,
    requireAdmin,
    adminController.updateUsersStatus
);

/**
 * @swagger
 * /api/admin/users/withdraw:
 *   patch:
 *     summary: 부원 탈퇴/제명 처리
 *     description: 관리자 권한을 가진 사용자가 선택한 부원을 비활성화 처리합니다.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *               - withdrawReason
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1]
 *               withdrawReason:
 *                 type: string
 *                 enum: ["자진 탈퇴", "제명", "동아리 이동", "기타"]
 *                 example: "제명"
 *     responses:
 *       200:
 *         description: 부원 탈퇴 처리 성공
 *       400:
 *         description: 입력값 오류
 *       401:
 *         description: 로그인 필요 또는 토큰 오류
 *       403:
 *         description: 관리자 권한 없음
 *       500:
 *         description: 서버 오류
 */
router.patch(
    "/users/withdraw",
    requireAuth,
    requireAdmin,
    adminController.withdrawUsers
);

router.get(
    "/officers",
    requireAuth,
    requireAdmin,
    adminController.getOfficers
);

/**
 * @swagger
 * /api/admin/officers/{userId}/dismiss:
 *   patch:
 *     summary: 임원 해임
 *     description: 회장 권한을 가진 사용자가 특정 임원을 일반 부원으로 변경합니다.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 해임할 임원의 사용자 id
 *         example: 3
 *     responses:
 *       200:
 *         description: 임원 해임 성공
 *       400:
 *         description: 잘못된 요청 또는 해임 대상 오류
 *       401:
 *         description: 로그인 필요 또는 토큰 오류
 *       403:
 *         description: 회장 권한 없음
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.patch(
    "/officers/:userId/dismiss",
    requireAuth,
    requirePresident,
    adminController.dismissOfficer
);

/**
 * @swagger
 * /api/admin/officers/{userId}/appoint:
 *   patch:
 *     summary: 임원 임명
 *     description: 회장 권한을 가진 사용자가 일반 부원을 임원으로 임명합니다.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 임명할 사용자의 id
 *         example: 3
 *     responses:
 *       200:
 *         description: 임원 임명 성공
 *       400:
 *         description: 잘못된 요청 또는 임명 대상 오류
 *       401:
 *         description: 로그인 필요 또는 토큰 오류
 *       403:
 *         description: 회장 권한 없음
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.patch(
    "/officers/:userId/appoint", 
    requireAuth, 
    requirePresident,
    adminController.appointOfficer
);

/**
 * @swagger
 * /api/admin/president/delegate:
 *   patch:
 *     summary: 회장 권한 위임
 *     description: 현재 회장이 특정 사용자에게 회장 권한을 위임합니다. confirmText에 "위임합니다"를 정확히 입력해야 합니다.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *               - confirmText
 *             properties:
 *               targetUserId:
 *                 type: integer
 *                 example: 3
 *               confirmText:
 *                 type: string
 *                 example: "위임합니다"
 *     responses:
 *       200:
 *         description: 회장 권한 위임 성공
 *       400:
 *         description: 잘못된 요청 또는 입력값 오류
 *       401:
 *         description: 로그인 필요 또는 토큰 오류
 *       403:
 *         description: 회장 권한 없음
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.patch(
    "/president/delegate", 
    requireAuth, 
    requirePresident, 
    adminController.delegatePresident
);

module.exports = router;