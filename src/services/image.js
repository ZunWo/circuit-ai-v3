import { aiConfig } from "../config/aiConfig.js";

export function validateImageFile(file) {
  if (!file) throw new Error("กรุณาเลือกภาพหนึ่งไฟล์");
  if (!aiConfig.imageTypes.includes(file.type))
    throw new Error("รองรับเฉพาะภาพ JPG, JPEG, PNG และ WebP");
  if (file.size === 0) throw new Error("ไฟล์ภาพว่าง กรุณาเลือกไฟล์ใหม่");
  if (file.size > aiConfig.maxImageBytes)
    throw new Error("ภาพมีขนาดเกิน 10 MB กรุณาเลือกภาพที่เล็กลง");
  return true;
}

export async function decodeImage(url) {
  const image = new Image();
  image.src = url;
  try {
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight)
      throw new Error("empty image");
    return image;
  } catch {
    throw new Error(
      "ไม่สามารถอ่านภาพนี้ได้ ไฟล์อาจเสียหายหรือไม่ได้เป็นภาพจริง",
    );
  }
}
