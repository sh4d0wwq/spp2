import path from "node:path";

export const PORT = Number(process.env.PORT) || 3000;

export const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://bookshelf:bookshelf@localhost:5432/bookshelf";

export const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.resolve(process.cwd(), "uploads");

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const MIME_TO_EXT = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export const GENRES = [
  "роман",
  "фантастика",
  "детектив",
  "научная литература",
  "биография",
  "поэзия",
  "другое",
];
