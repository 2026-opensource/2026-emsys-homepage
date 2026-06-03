const multer = require("multer");
const path = require("path");
const fs = require("fs");

const postTempDir = path.join(__dirname, "../../uploads/temp");

if (!fs.existsSync(postTempDir)) {
    fs.mkdirSync(postTempDir, { recursive: true });
}

const postTempStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, postTempDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        const fileName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;

        cb(null, fileName);
    },
});

const allowedImageTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
];

const allowedImageExtensions = [".png", ".jpg", ".jpeg", ".webp"];

const uploadPostImages = multer({
    storage: postTempStorage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 100,
    },
    fileFilter: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();

        const isValidMimeType = allowedImageTypes.includes(file.mimetype);
        const isValidExtension = allowedImageExtensions.includes(ext);

        if (!isValidMimeType || !isValidExtension) {
            return cb(new Error("PNG, JPG, JPEG, WEBP 이미지만 업로드할 수 있습니다."));
        }

        cb(null, true);
    },
});

module.exports = {
    uploadPostImages,
};