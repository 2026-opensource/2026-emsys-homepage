const express = require("express");
const multer = require("multer");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const r2 = require("../lib/r2Client");
const crypto = require("crypto");
const path = require("path");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB 제한 예시

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "파일 없음" });

    const ext = path.extname(req.file.originalname);
    const key = `uploads/${Date.now()}-${crypto.randomUUID()}${ext}`;

    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
    res.json({ url: publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "업로드 실패" });
  }
});

module.exports = router;