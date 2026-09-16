function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BookDetails({ book, onClose, onEdit, onDelete }) {
  return (
    <div className="drawer-backdrop" onClick={onClose} role="presentation">
      <aside
        className="drawer"
        role="dialog"
        aria-labelledby="book-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="icon-btn" type="button" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
        <div className="drawer-cover">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={`Обложка: ${book.title}`} />
          ) : (
            <div className="cover placeholder tall">
              <span>{book.title.slice(0, 1)}</span>
              <small>Нет обложки</small>
            </div>
          )}
        </div>
        <p className="genre">{book.genre}</p>
        <h2 id="book-title">{book.title}</h2>
        <p className="lead">
          {book.author}, {book.year}
        </p>
        {book.isbn ? <p className="isbn">ISBN {book.isbn}</p> : null}
        <p className="description">{book.description || "Описание не указано."}</p>
        <dl className="meta-list">
          <div>
            <dt>Создана</dt>
            <dd>{formatDate(book.createdAt)}</dd>
          </div>
          <div>
            <dt>Обновлена</dt>
            <dd>{formatDate(book.updatedAt)}</dd>
          </div>
        </dl>
        <div className="drawer-actions">
          <button className="btn btn-primary" type="button" onClick={onEdit}>
            Редактировать
          </button>
          <button className="btn btn-danger" type="button" onClick={onDelete}>
            Удалить
          </button>
        </div>
      </aside>
    </div>
  );
}
