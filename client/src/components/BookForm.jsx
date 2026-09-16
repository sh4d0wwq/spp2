import { useMemo, useState } from "react";

const INITIAL = {
  title: "",
  author: "",
  year: "",
  genre: "",
  isbn: "",
  description: "",
};

function toFormState(book) {
  if (!book) return { ...INITIAL };
  return {
    title: book.title || "",
    author: book.author || "",
    year: book.year || "",
    genre: book.genre || "",
    isbn: book.isbn || "",
    description: book.description || "",
  };
}

export default function BookForm({
  mode,
  book,
  genres,
  saving,
  error,
  fieldErrors,
  onClose,
  onSubmit,
}) {
  const [values, setValues] = useState(() => toFormState(book));
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");

  const preview = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    return book?.coverUrl || "";
  }, [file, book]);

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  function onFileChange(event) {
    const next = event.target.files?.[0];
    setFileError("");
    if (!next) {
      setFile(null);
      return;
    }
    if (!next.type.startsWith("image/")) {
      setFileError("Можно загрузить только изображение");
      event.target.value = "";
      return;
    }
    if (next.size > 5 * 1024 * 1024) {
      setFileError("Файл больше 5 МБ");
      event.target.value = "";
      return;
    }
    setFile(next);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (file) formData.append("cover", file);
    onSubmit(formData);
  }

  const title = mode === "create" ? "Новая книга" : "Редактирование книги";

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <form
        className="modal"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        {error ? (
          <div className="banner banner-error compact" role="alert">
            {error}
          </div>
        ) : null}

        <div className="form-grid">
          <label className="full">
            Название
            <input
              name="title"
              value={values.title}
              onChange={updateField}
              maxLength={200}
              required
            />
            {fieldErrors.title ? <small className="field-error">{fieldErrors.title}</small> : null}
          </label>
          <label>
            Автор
            <input
              name="author"
              value={values.author}
              onChange={updateField}
              maxLength={150}
              required
            />
            {fieldErrors.author ? <small className="field-error">{fieldErrors.author}</small> : null}
          </label>
          <label>
            Год
            <input
              name="year"
              type="number"
              value={values.year}
              onChange={updateField}
              required
            />
            {fieldErrors.year ? <small className="field-error">{fieldErrors.year}</small> : null}
          </label>
          <label>
            Жанр
            <select name="genre" value={values.genre} onChange={updateField} required>
              <option value="">Выберите жанр</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
            {fieldErrors.genre ? <small className="field-error">{fieldErrors.genre}</small> : null}
          </label>
          <label>
            ISBN
            <input
              name="isbn"
              value={values.isbn}
              onChange={updateField}
              placeholder="необязательно"
            />
            {fieldErrors.isbn ? <small className="field-error">{fieldErrors.isbn}</small> : null}
          </label>
          <label className="full">
            Описание
            <textarea
              name="description"
              value={values.description}
              onChange={updateField}
              rows="4"
              maxLength={2000}
            />
            {fieldErrors.description ? (
              <small className="field-error">{fieldErrors.description}</small>
            ) : null}
          </label>
          <div className="full cover-field">
            <span>Обложка</span>
            <label className={`cover-picker ${preview ? "has-image" : ""}`}>
              <input
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={onFileChange}
              />
              {preview ? (
                <>
                  <img src={preview} alt="Предпросмотр обложки" />
                  <span className="cover-picker-overlay">Изменить</span>
                </>
              ) : (
                <span className="cover-picker-empty">Выбрать файл</span>
              )}
            </label>
            {fileError ? <small className="field-error">{fileError}</small> : null}
            {fieldErrors.cover ? <small className="field-error">{fieldErrors.cover}</small> : null}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" type="button" onClick={onClose} disabled={saving}>
            Отмена
          </button>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </form>
    </div>
  );
}
