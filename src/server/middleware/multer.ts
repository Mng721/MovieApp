import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(), // Lưu file tạm thời trong bộ nhớ
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
});

export default upload;