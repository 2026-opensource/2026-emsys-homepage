const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

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

module.exports = router;