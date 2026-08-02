const express = require("express");
const multer = require("multer");
const memberController = require("../controllers/member.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/role.middleware");

const router = express.Router();

// 엑셀 업로드용 - 메모리에 버퍼로만 저장 (디스크에 남기지 않음)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.get(
    "/invitation-members",
    requireAuth,
    requireAdmin,
    memberController.getInvitationMembers
);

router.post(
    "/invitation-members",
    requireAuth,
    requireAdmin,
    memberController.createInvitationMember
);

router.put(
    "/invitation-members/:id",
    requireAuth,
    requireAdmin,
    memberController.updateInvitationMember
);

router.post(
    "/invitation-members/upload",
    requireAuth,
    requireAdmin,
    upload.single("file"),
    memberController.uploadInvitationExcel
);

module.exports = router;