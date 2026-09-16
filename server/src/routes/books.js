import { Router } from "express";
import { GENRES } from "../config.js";
import { mapBook, pool, removeCoverFile } from "../db.js";
import { handleUpload } from "../middleware/upload.js";
import { validateBookPayload, validateIdParam } from "../middleware/validate.js";

const router = Router();
const SORT_FIELDS = {
  title: "title",
  author: "author",
  year: "year",
  createdAt: "created_at",
};

function cleanupUpload(file) {
  if (file?.filename) {
    return removeCoverFile(file.filename);
  }
  return Promise.resolve();
}

router.get("/", async (req, res, next) => {
  try {
    const search = String(req.query.search || "").trim();
    const genre = String(req.query.genre || "").trim();
    const requestedSort = String(req.query.sort || "createdAt");
    const sort = SORT_FIELDS[requestedSort] || "created_at";
    const defaultOrder = requestedSort === "createdAt" ? "DESC" : "ASC";
    const requestedOrder = String(req.query.order || "").toLowerCase();
    const order =
      requestedOrder === "asc" || requestedOrder === "desc"
        ? requestedOrder.toUpperCase()
        : defaultOrder;

    const conditions = [];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(
        `(title ILIKE $${values.length} OR author ILIKE $${values.length})`,
      );
    }

    if (genre) {
      if (!GENRES.includes(genre)) {
        return res.status(400).json({
          message: "Неизвестный жанр",
          errors: [{ field: "genre", message: `Допустимые жанры: ${GENRES.join(", ")}` }],
        });
      }
      values.push(genre);
      conditions.push(`genre = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const { rows } = await pool.query(
      `SELECT * FROM books ${where} ORDER BY ${sort} ${order}, id DESC`,
      values,
    );

    return res.status(200).json({
      items: rows.map(mapBook),
      total: rows.length,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", validateIdParam, async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM books WHERE id = $1", [
      req.bookId,
    ]);
    if (!rows[0]) {
      return res.status(404).json({ message: "Книга не найдена" });
    }
    return res.status(200).json(mapBook(rows[0]));
  } catch (error) {
    return next(error);
  }
});

router.post("/", handleUpload, async (req, res, next) => {
  try {
    const { errors, data } = validateBookPayload(req.body, { required: true });
    if (errors.length) {
      await cleanupUpload(req.file);
      return res.status(400).json({ message: "Ошибка валидации", errors });
    }

    const { rows } = await pool.query(
      `INSERT INTO books (title, author, year, genre, isbn, description, cover_filename)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.title,
        data.author,
        data.year,
        data.genre,
        data.isbn || null,
        data.description || null,
        req.file?.filename || null,
      ],
    );

    return res.status(201).json(mapBook(rows[0]));
  } catch (error) {
    await cleanupUpload(req.file);
    return next(error);
  }
});

router.put("/:id", validateIdParam, handleUpload, async (req, res, next) => {
  try {
    const existing = await pool.query("SELECT * FROM books WHERE id = $1", [
      req.bookId,
    ]);
    if (!existing.rows[0]) {
      await cleanupUpload(req.file);
      return res.status(404).json({ message: "Книга не найдена" });
    }

    const { errors, data } = validateBookPayload(req.body, { required: true });
    if (errors.length) {
      await cleanupUpload(req.file);
      return res.status(400).json({ message: "Ошибка валидации", errors });
    }

    const nextCover = req.file?.filename || existing.rows[0].cover_filename;
    const { rows } = await pool.query(
      `UPDATE books
       SET title = $1,
           author = $2,
           year = $3,
           genre = $4,
           isbn = $5,
           description = $6,
           cover_filename = $7,
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        data.title,
        data.author,
        data.year,
        data.genre,
        data.isbn || null,
        data.description || null,
        nextCover,
        req.bookId,
      ],
    );

    if (req.file && existing.rows[0].cover_filename) {
      await removeCoverFile(existing.rows[0].cover_filename);
    }

    return res.status(200).json(mapBook(rows[0]));
  } catch (error) {
    await cleanupUpload(req.file);
    return next(error);
  }
});

router.delete("/:id", validateIdParam, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "DELETE FROM books WHERE id = $1 RETURNING *",
      [req.bookId],
    );
    if (!rows[0]) {
      return res.status(404).json({ message: "Книга не найдена" });
    }
    await removeCoverFile(rows[0].cover_filename);
    return res.status(200).json({
      message: "Книга удалена",
      id: rows[0].id,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
