const express = require("express");
const multer = require("multer");
const sliderController = require("../controllers/slider.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/role.middleware");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(new Error("JPG, PNG, WEBP, GIF 이미지만 업로드할 수 있습니다."));
    }
    callback(null, true);
  },
});

router.get("/", sliderController.getPublicImages);
router.get("/admin", requireAuth, requireAdmin, sliderController.getAllImages);
router.post("/", requireAuth, requireAdmin, upload.single("image"), sliderController.createImage);
router.patch("/order", requireAuth, requireAdmin, sliderController.reorderImages);
router.patch("/:id", requireAuth, requireAdmin, sliderController.updateImage);
router.delete("/:id", requireAuth, requireAdmin, sliderController.deleteImage);

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError || error.message?.includes("이미지만")) {
    return res.status(400).json({ success: false, message: error.code === "LIMIT_FILE_SIZE" ? "이미지는 10MB 이하여야 합니다." : error.message });
  }
  next(error);
});

module.exports = router;
