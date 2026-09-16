import { GENRES } from "../config.js";

const TITLE_MAX = 200;
const AUTHOR_MAX = 150;
const DESCRIPTION_MAX = 2000;
const MIN_YEAR = 1000;
const ISBN_PATTERN = /^[0-9][0-9\- ]{8,18}[0-9Xx]$/;

function asString(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function push(errors, field, message) {
  errors.push({ field, message });
}

export function validateBookPayload(body, { required = true } = {}) {
  const errors = [];
  const data = {
    title: asString(body.title),
    author: asString(body.author),
    year: asString(body.year),
    genre: asString(body.genre),
    isbn: asString(body.isbn),
    description: asString(body.description),
  };

  if (required || body.title !== undefined) {
    if (!data.title) push(errors, "title", "Название обязательно");
    else if (data.title.length > TITLE_MAX) {
      push(errors, "title", `Название не длиннее ${TITLE_MAX} символов`);
    }
  }

  if (required || body.author !== undefined) {
    if (!data.author) push(errors, "author", "Автор обязателен");
    else if (data.author.length > AUTHOR_MAX) {
      push(errors, "author", `Имя автора не длиннее ${AUTHOR_MAX} символов`);
    }
  }

  if (required || body.year !== undefined) {
    const year = Number(data.year);
    const maxYear = new Date().getFullYear() + 1;
    if (!data.year) push(errors, "year", "Год издания обязателен");
    else if (!/^-?\d+$/.test(data.year) || !Number.isInteger(year)) {
      push(errors, "year", "Год должен быть целым числом");
    } else if (year < MIN_YEAR || year > maxYear) {
      push(errors, "year", `Год должен быть в диапазоне ${MIN_YEAR}–${maxYear}`);
    } else {
      data.year = year;
    }
  }

  if (required || body.genre !== undefined) {
    if (!data.genre) push(errors, "genre", "Жанр обязателен");
    else if (!GENRES.includes(data.genre)) {
      push(errors, "genre", `Жанр должен быть одним из: ${GENRES.join(", ")}`);
    }
  }

  if (body.isbn !== undefined || required) {
    if (data.isbn && !ISBN_PATTERN.test(data.isbn)) {
      push(errors, "isbn", "ISBN должен содержать 10–13 цифр, допускаются дефисы");
    }
  }

  if (body.description !== undefined || required) {
    if (data.description.length > DESCRIPTION_MAX) {
      push(
        errors,
        "description",
        `Описание не длиннее ${DESCRIPTION_MAX} символов`,
      );
    }
  }

  return { errors, data };
}

export function validateIdParam(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Некорректный идентификатор",
      errors: [{ field: "id", message: "id должен быть положительным целым числом" }],
    });
  }
  req.bookId = id;
  return next();
}
