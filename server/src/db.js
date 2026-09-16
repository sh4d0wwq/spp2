import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { DATABASE_URL, UPLOAD_DIR } from "./config.js";

export const pool = new pg.Pool({
  connectionString: DATABASE_URL,
});

const SEED_BOOKS = [
  {
    title: "Мастер и Маргарита",
    author: "Михаил Булгаков",
    year: 1967,
    genre: "роман",
    isbn: "978-5-17-084595-8",
    description:
      "Роман о визите Воланда в Москву 1930-х и о вечной истории Понтия Пилата.",
  },
  {
    title: "Преступление и наказание",
    author: "Фёдор Достоевский",
    year: 1866,
    genre: "роман",
    isbn: "978-5-389-01234-5",
    description:
      "Психологический роман о студенте Раскольникове и цене человеческой жизни.",
  },
  {
    title: "1984",
    author: "Джордж Оруэлл",
    year: 1949,
    genre: "фантастика",
    isbn: "978-0-452-28423-4",
    description:
      "Антиутопия о тоталитарном государстве, где Большой Брат следит за каждым.",
  },
  {
    title: "Убийство в Восточном экспрессе",
    author: "Агата Кристи",
    year: 1934,
    genre: "детектив",
    isbn: "978-0-00-711931-8",
    description:
      "Эркюль Пуаро расследует убийство в застрявшем среди снега поезде.",
  },
  {
    title: "Краткая история времени",
    author: "Стивен Хокинг",
    year: 1988,
    genre: "научная литература",
    isbn: "978-0-553-38016-3",
    description:
      "Популярное введение в космологию: от Большого взрыва до чёрных дыр.",
  },
  {
    title: "Пикник на обочине",
    author: "Аркадий и Борис Стругацкие",
    year: 1972,
    genre: "фантастика",
    isbn: "978-5-17-090123-4",
    description:
      "Сталкеры проникают в Зону, оставленную после визита инопланетян.",
  },
];

export async function waitForDb(attempts = 30) {
  let lastError;
  for (let i = 1; i <= attempts; i += 1) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw lastError || new Error("Не удалось подключиться к базе данных");
}

export async function initDb() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      author VARCHAR(150) NOT NULL,
      year INTEGER NOT NULL,
      genre VARCHAR(50) NOT NULL,
      isbn VARCHAR(20),
      description TEXT,
      cover_filename VARCHAR(255),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM books");
  if (rows[0].count === 0) {
    for (const book of SEED_BOOKS) {
      await pool.query(
        `INSERT INTO books (title, author, year, genre, isbn, description)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [book.title, book.author, book.year, book.genre, book.isbn, book.description],
      );
    }
  }
}

export function mapBook(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    year: row.year,
    genre: row.genre,
    isbn: row.isbn,
    description: row.description,
    coverUrl: row.cover_filename ? `/uploads/${row.cover_filename}` : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function removeCoverFile(filename) {
  if (!filename) return;
  const filePath = path.join(UPLOAD_DIR, filename);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
