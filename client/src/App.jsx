import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createBook,
  deleteBook,
  fieldMap,
  getBooks,
  getGenres,
  updateBook,
} from "./api.js";
import BookDetails from "./components/BookDetails.jsx";
import BookForm from "./components/BookForm.jsx";
import BookGrid from "./components/BookGrid.jsx";
import ConfirmDialog from "./components/ConfirmDialog.jsx";
import Toast from "./components/Toast.jsx";

const EMPTY_FILTERS = { search: "", genre: "", sort: "createdAt" };

export default function App() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [selected, setSelected] = useState(null);
  const [formMode, setFormMode] = useState(null);
  const [formError, setFormError] = useState("");
  const [formFieldErrors, setFormFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, text) => {
    setToast({ type, text, id: Date.now() });
  }, []);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const data = await getBooks(filters);
      setBooks(data.items);
      setSelected((current) => {
        if (!current) return null;
        return data.items.find((book) => book.id === current.id) || null;
      });
    } catch (error) {
      setListError(error.message);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    getGenres()
      .then((data) => setGenres(data.items))
      .catch(() => setGenres([]));
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) =>
        current.search === searchInput ? current : { ...current, search: searchInput },
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(timer);
  }, [toast]);

  const stats = useMemo(() => {
    const uniqueAuthors = new Set(books.map((book) => book.author)).size;
    const withCover = books.filter((book) => book.coverUrl).length;
    return { total: books.length, uniqueAuthors, withCover };
  }, [books]);

  function openCreate() {
    setFormError("");
    setFormFieldErrors({});
    setFormMode({ type: "create", book: null });
  }

  function openEdit(book) {
    setFormError("");
    setFormFieldErrors({});
    setFormMode({ type: "edit", book });
  }

  async function handleSave(formData, { type, book }) {
    setSaving(true);
    setFormError("");
    setFormFieldErrors({});
    try {
      const saved =
        type === "create" ? await createBook(formData) : await updateBook(book.id, formData);
      setFormMode(null);
      showToast("success", type === "create" ? "Книга добавлена" : "Книга обновлена");
      await loadBooks();
      setSelected(saved);
    } catch (error) {
      setFormError(error.message);
      setFormFieldErrors(fieldMap(error.errors));
      if (error.status === 404) {
        showToast("error", error.message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    try {
      await deleteBook(pendingDelete.id);
      showToast("success", "Книга удалена");
      setPendingDelete(null);
      setSelected(null);
      await loadBooks();
    } catch (error) {
      setPendingDelete(null);
      showToast("error", error.message);
      if (error.status === 404) await loadBooks();
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            B
          </span>
          <div>
            <h1>Книжная полка</h1>
          </div>
        </div>
        <button className="btn btn-primary" type="button" onClick={openCreate}>
          Добавить книгу
        </button>
      </header>

      <section className="toolbar">
        <label className="search">
          <span className="sr-only">Поиск</span>
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Поиск по названию или автору"
          />
        </label>
        <label>
          <span className="sr-only">Жанр</span>
          <select
            value={filters.genre}
            onChange={(event) =>
              setFilters((current) => ({ ...current, genre: event.target.value }))
            }
          >
            <option value="">Все жанры</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Сортировка</span>
          <select
            value={filters.sort}
            onChange={(event) =>
              setFilters((current) => ({ ...current, sort: event.target.value }))
            }
          >
            <option value="createdAt">Сначала новые</option>
            <option value="title">По названию</option>
            <option value="author">По автору</option>
            <option value="year">По году</option>
          </select>
        </label>
      </section>

      <section className="stats">
        <article>
          <strong>{stats.total}</strong>
          <span>книг на полке</span>
        </article>
        <article>
          <strong>{stats.uniqueAuthors}</strong>
          <span>авторов</span>
        </article>
        <article>
          <strong>{stats.withCover}</strong>
          <span>с обложкой</span>
        </article>
      </section>

      {listError ? (
        <div className="banner banner-error" role="alert">
          <div>
            <strong>Не удалось загрузить каталог</strong>
            <p>{listError}</p>
          </div>
          <button className="btn btn-ghost" type="button" onClick={loadBooks}>
            Повторить
          </button>
        </div>
      ) : null}

      <BookGrid
        books={books}
        loading={loading}
        selectedId={selected?.id}
        onSelect={setSelected}
        onEdit={openEdit}
        onDelete={setPendingDelete}
      />

      {selected ? (
        <BookDetails
          book={selected}
          onClose={() => setSelected(null)}
          onEdit={() => openEdit(selected)}
          onDelete={() => setPendingDelete(selected)}
        />
      ) : null}

      {formMode ? (
        <BookForm
          mode={formMode.type}
          book={formMode.book}
          genres={genres}
          saving={saving}
          error={formError}
          fieldErrors={formFieldErrors}
          onClose={() => setFormMode(null)}
          onSubmit={(formData) => handleSave(formData, formMode)}
        />
      ) : null}

      {pendingDelete ? (
        <ConfirmDialog
          title="Удалить книгу?"
          text={`«${pendingDelete.title}» будет удалена безвозвратно, включая обложку.`}
          confirmLabel="Удалить"
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleDelete}
        />
      ) : null}

      {toast ? (
        <Toast
          type={toast.type}
          text={toast.text}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}
