const DEFAULT_MESSAGE = "Не удалось выполнить запрос";

async function parseBody(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(path, options);
  } catch {
    const error = new Error("Нет соединения с сервером");
    error.status = 0;
    throw error;
  }

  const data = await parseBody(response);
  if (!response.ok) {
    const error = new Error(data.message || DEFAULT_MESSAGE);
    error.status = response.status;
    error.errors = data.errors || [];
    throw error;
  }
  return data;
}

export function getBooks(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const suffix = query.toString() ? `?${query}` : "";
  return request(`/api/books${suffix}`);
}

export function getBook(id) {
  return request(`/api/books/${id}`);
}

export function getGenres() {
  return request("/api/genres");
}

export function createBook(formData) {
  return request("/api/books", { method: "POST", body: formData });
}

export function updateBook(id, formData) {
  return request(`/api/books/${id}`, { method: "PUT", body: formData });
}

export function deleteBook(id) {
  return request(`/api/books/${id}`, { method: "DELETE" });
}

export function fieldMap(errors = []) {
  return errors.reduce((acc, item) => {
    acc[item.field] = item.message;
    return acc;
  }, {});
}
