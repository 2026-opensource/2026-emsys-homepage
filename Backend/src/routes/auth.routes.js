const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const uploadErrorHandler = require("../middlewares/uploadError.middleware");

const router = express.Router();

const uploadDir = path.join(__dirname, "../../uploads/profile-images");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const profileImageStorage  = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        const fileName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;

        cb(null, fileName);
    },
});

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
    storage: profileImageStorage,
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
