export function notFoundHandler(_req, res) {
  res.status(404).json({ message: "Маршрут не найден" });
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      message: "Некорректный JSON",
      errors: [{ field: "body", message: "Тело запроса должно быть валидным JSON" }],
    });
  }

  console.error(error);
  const status = error.status || 500;
  return res.status(status).json({
    message: status === 500 ? "Внутренняя ошибка сервера" : error.message,
  });
}

