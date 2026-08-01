// backend/lib/uploadToR2.js
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const r2 = require("./r2Client");
const crypto = require("crypto");
const path = require("path");

async function uploadToR2(buffer, originalName, mimetype, folder = "uploads") {
  const ext = path.extname(originalName);
  const key = `${folder}/${Date.now()}-${crypto.randomUUID()}${ext}`;

  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  }));

  // 완전한 공개 URL을 만들어서 반환
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

async function deleteFromR2(key) {
  await r2.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  }));
}

// R2 공개 URL에서 key만 뽑아내기 (삭제할 때 필요)
function extractR2Key(url) {
  if (!url) return null;
  const prefix = `${process.env.R2_PUBLIC_URL}/`;
  if (!url.startsWith(prefix)) return null;
  return url.slice(prefix.length);
}

module.exports = { uploadToR2, deleteFromR2, extractR2Key };