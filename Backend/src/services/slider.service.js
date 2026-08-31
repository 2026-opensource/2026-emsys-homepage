const prisma = require("../lib/prisma");
const { uploadToR2, deleteFromR2, extractR2Key } = require("../lib/uploadToR2");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const localSliderDirectory = path.join(__dirname, "../../uploads/slider-images");

function isR2Configured() {
  return [
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET_NAME",
    "R2_PUBLIC_URL",
  ].every((key) => Boolean(process.env[key]));
}

async function storeSliderImage(file) {
  if (isR2Configured()) {
    return uploadToR2(file.buffer, file.originalname, file.mimetype, "slider-images");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("R2_CONFIG_MISSING");
  }

  await fs.mkdir(localSliderDirectory, { recursive: true });
  const extension = path.extname(file.originalname).toLowerCase();
  const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  await fs.writeFile(path.join(localSliderDirectory, filename), file.buffer);
  const publicBaseUrl = (process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, "");
  return `${publicBaseUrl}/uploads/slider-images/${filename}`;
}

async function removeSliderImage(imageUrl) {
  const r2Key = extractR2Key(imageUrl);
  if (r2Key) {
    await deleteFromR2(r2Key);
    return;
  }

  const localMarker = "/uploads/slider-images/";
  const markerIndex = imageUrl.indexOf(localMarker);
  if (markerIndex === -1) return;
  const filename = path.basename(imageUrl.slice(markerIndex + localMarker.length));
  await fs.unlink(path.join(localSliderDirectory, filename)).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
}

exports.getPublicImages = async () => {
  const [total, images] = await Promise.all([
    prisma.slider_images.count(),
    prisma.slider_images.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: "asc" }, { id: "asc" }],
    }),
  ]);

  return { configured: total > 0, images };
};

exports.getAllImages = () => prisma.slider_images.findMany({
  orderBy: [{ sort_order: "asc" }, { id: "asc" }],
});

exports.createImage = async (file, altText) => {
  const lastImage = await prisma.slider_images.findFirst({
    orderBy: { sort_order: "desc" },
  });
  const imageUrl = await storeSliderImage(file);

  try {
    return await prisma.slider_images.create({
      data: {
        image_url: imageUrl,
        original_name: file.originalname,
        alt_text: altText?.trim() || "EMSYS 배너 이미지",
        sort_order: (lastImage?.sort_order ?? -1) + 1,
      },
    });
  } catch (error) {
    await removeSliderImage(imageUrl).catch(() => {});
    throw error;
  }
};

exports.updateImage = (id, data) => prisma.slider_images.update({
  where: { id },
  data,
});

exports.reorderImages = async (imageIds) => prisma.$transaction(
  imageIds.map((id, index) => prisma.slider_images.update({
    where: { id },
    data: { sort_order: index },
  })),
);

exports.deleteImage = async (id) => {
  const image = await prisma.slider_images.delete({ where: { id } });
  await removeSliderImage(image.image_url).catch((error) => {
    console.error("슬라이더 R2 이미지 삭제 실패:", error);
  });
  return image;
};
