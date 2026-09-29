const express = require("express");
const path = require("path");
const multer = require("multer");
const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const uploadErrorHandler = require("../middlewares/uploadError.middleware");

const router = express.Router();

// 프로필 이미지는 서버 로컬 디스크에 저장하지 않고 메모리에 버퍼로만 담아둔 뒤
// Cloudflare R2에 업로드함. (배포 서버의 로컬 디스크는 재배포할 때마다 초기화되기
// 때문에, 로컬에 저장하면 재배포 후 이미지가 깨짐)
const allowedProfileImageTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
];

const allowedProfileImageExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
];

const uploadProfileImage = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();

        const isValidMimeType = allowedProfileImageTypes.includes(file.mimetype);
        const isValidExtension = allowedProfileImageExtensions.includes(ext);

        if (!isValidMimeType || !isValidExtension) {
            return cb(new Error("PNG, JPG, JPEG, WEBP 이미지만 업로드할 수 있습니다."));
        }

        cb(null, true);
    },
});

router.post("/register", authController.register);


router.post("/login", authController.login);

router.get("/me", requireAuth, authController.getMe);

router.get("/users/:id", requireAuth, authController.getUserProfile);

router.patch(
    "/me/profile-image",
    requireAuth,
    uploadProfileImage.single("profileImage"),
    authController.updateProfileImage
);

router.delete(
    "/me/profile-image",
    requireAuth,
    authController.resetProfileImage
);

router.patch(
    "/me/greeting",
    requireAuth,
    authController.updateGreetingMessage
);

router.post("/find-email", authController.findEmail);


router.post("/verify-password-user", authController.verifyPasswordUser);

router.patch("/password", authController.changePassword);

router.use(uploadErrorHandler);

module.exports = router;
