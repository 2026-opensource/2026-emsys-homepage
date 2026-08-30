const sliderService = require("../services/slider.service");

exports.getPublicImages = async (req, res) => {
  try {
    const result = await sliderService.getPublicImages();
    res.json({ success: true, data: result.images, configured: result.configured });
  } catch (error) {
    console.error("슬라이더 이미지 조회 실패:", error);
    res.status(500).json({ success: false, message: "슬라이더 이미지를 불러오지 못했습니다." });
  }
};

exports.getAllImages = async (req, res) => {
  try {
    res.json({ success: true, data: await sliderService.getAllImages() });
  } catch (error) {
    console.error("슬라이더 관리 목록 조회 실패:", error);
    res.status(500).json({ success: false, message: "이미지 목록을 불러오지 못했습니다." });
  }
};

exports.createImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "이미지 파일을 선택해주세요." });
    }
    const image = await sliderService.createImage(req.file, req.body.altText);
    res.status(201).json({ success: true, data: image, message: "이미지가 등록되었습니다." });
  } catch (error) {
    console.error("슬라이더 이미지 등록 실패:", error);
    if (error.message === "R2_CONFIG_MISSING") {
      return res.status(503).json({ success: false, message: "서버의 이미지 저장소가 설정되지 않았습니다." });
    }
    res.status(500).json({ success: false, message: "이미지 등록에 실패했습니다." });
  }
};

exports.updateImage = async (req, res) => {
  try {
    const data = {};
    if (typeof req.body.altText === "string") data.alt_text = req.body.altText.trim();
    if (typeof req.body.isActive === "boolean") data.is_active = req.body.isActive;
    const image = await sliderService.updateImage(Number(req.params.id), data);
    res.json({ success: true, data: image });
  } catch (error) {
    const status = error.code === "P2025" ? 404 : 500;
    res.status(status).json({ success: false, message: status === 404 ? "이미지를 찾을 수 없습니다." : "이미지 수정에 실패했습니다." });
  }
};

exports.reorderImages = async (req, res) => {
  try {
    const imageIds = req.body.imageIds;
    if (!Array.isArray(imageIds) || imageIds.some((id) => !Number.isInteger(id))) {
      return res.status(400).json({ success: false, message: "올바른 이미지 순서가 아닙니다." });
    }
    await sliderService.reorderImages(imageIds);
    res.json({ success: true, message: "표시 순서가 변경되었습니다." });
  } catch (error) {
    console.error("슬라이더 순서 변경 실패:", error);
    res.status(500).json({ success: false, message: "순서 변경에 실패했습니다." });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    await sliderService.deleteImage(Number(req.params.id));
    res.json({ success: true, message: "이미지가 삭제되었습니다." });
  } catch (error) {
    const status = error.code === "P2025" ? 404 : 500;
    res.status(status).json({ success: false, message: status === 404 ? "이미지를 찾을 수 없습니다." : "이미지 삭제에 실패했습니다." });
  }
};
