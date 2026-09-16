export default function BookGrid({
  books,
  loading,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="card skeleton" key={index}>
            <div className="cover" />
            <div className="card-body">
              <div className="bone" />
              <div className="bone short" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!books.length) {
    return (
      <div className="empty">
        <div className="empty-art" aria-hidden="true" />
        <h2>Полка пуста</h2>
        <p>Добавьте первую книгу или измените параметры поиска.</p>
      </div>
    );
  }

  return (
    <div className="grid">
      {books.map((book) => (
        <article
          className={`card ${selectedId === book.id ? "is-selected" : ""}`}
          key={book.id}
        >
          <button
            className="cover-btn"
            type="button"
            onClick={() => onSelect(book)}
            aria-label={`Открыть «${book.title}»`}
          >
            {book.coverUrl ? (
              <img src={book.coverUrl} alt="" />
            ) : (
              <div className="cover placeholder">
                <span>{book.title.slice(0, 1)}</span>
              </div>
            )}
          </button>
          <div className="card-body">
            <p className="genre">{book.genre}</p>
            <h3>{book.title}</h3>
            <p className="meta">
              {book.author} · {book.year}
            </p>
            <div className="card-actions">
              <button type="button" onClick={() => onSelect(book)}>
                Подробнее
              </button>
              <button type="button" onClick={() => onEdit(book)}>
                Изменить
              </button>
              <button
                className="danger"
                type="button"
                onClick={() => onDelete(book)}
              >
                Удалить
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
