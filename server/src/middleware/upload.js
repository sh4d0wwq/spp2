import fs from "node:fs";
import multer from "multer";
import { randomBytes } from "node:crypto";
import { ALLOWED_MIME, MAX_FILE_SIZE, MIME_TO_EXT, UPLOAD_DIR } from "../config.js";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = MIME_TO_EXT[file.mimetype] || "";
    cb(null, `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`);
  },
});

export const uploadCover = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      const error = new Error(
        "Допустимы только изображения JPEG, PNG, WebP или GIF",
      );
      error.status = 400;
      error.code = "INVALID_FILE_TYPE";
      return cb(error);
    }
    cb(null, true);
  },
}).single("cover");

export function handleUpload(req, res, next) {
  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("multipart/form-data")) {
    return next();
  }

  uploadCover(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "Файл слишком большой. Максимальный размер — 5 МБ",
          errors: [{ field: "cover", message: "Максимальный размер файла — 5 МБ" }],
        });
      }
      return res.status(400).json({
        message: "Ошибка загрузки файла",
        errors: [{ field: "cover", message: error.message }],
      });
    }

    return res.status(error.status || 400).json({
      message: error.message || "Ошибка загрузки файла",
      errors: [{ field: "cover", message: error.message }],
    });
  });
}
