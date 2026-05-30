const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

const postImageDir = path.join(__dirname, "../../uploads/posts");

if (!fs.existsSync(postImageDir)) {
    fs.mkdirSync(postImageDir, { recursive: true });
}

function imageFileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("이미지 파일만 업로드할 수 있습니다."));
    }

    cb(null, true);
}

const postImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, postImageDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = `post-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

        cb(null, filename);
    },
});

const uploadPostImage = multer({
    storage: postImageStorage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: imageFileFilter,
});

router.post("/posts/image", requireAuth, uploadPostImage.single("image"), (req, res) => {
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/posts/${req.file.filename}`;

    return res.status(200).json({
        success: true,
        imageUrl,
    });
});

module.exports = router;