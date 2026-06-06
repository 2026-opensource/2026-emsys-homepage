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

const allowedFileExtensions = [
    ".pdf",
    ".zip",
    ".ppt",
    ".pptx",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".hwp",
    ".txt",
];

const blockedFileExtensions = [
    ".exe",
    ".bat",
    ".cmd",
    ".sh",
    ".js",
    ".mjs",
];

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
        fileSize: 10 * 1024 * 1024, // 파일 1개당 10MB
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

const uploadPostFiles = multer({
    storage: postTempStorage,
    limits: {
        fileSize: 30 * 1024 * 1024, // 파일 1개당 30MB
    },
    fileFilter: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();

        if (blockedFileExtensions.includes(ext)) {
            return cb(new Error("업로드할 수 없는 파일 형식입니다."));
        }

        if (!allowedFileExtensions.includes(ext)) {
            return cb(new Error("PDF, ZIP, PPT, DOC, XLS, HWP, TXT 파일만 업로드할 수 있습니다."));
        }

        cb(null, true);
    },
});

module.exports = {
    uploadPostImages,
    uploadPostFiles,
};