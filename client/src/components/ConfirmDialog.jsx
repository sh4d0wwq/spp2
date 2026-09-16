export default function ConfirmDialog({ title, text, confirmLabel, onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop" onClick={onCancel} role="presentation">
      <div
        className="modal compact-modal"
        role="alertdialog"
        onClick={(event) => event.stopPropagation()}
      >
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" type="button" onClick={onCancel}>
            Отмена
          </button>
          <button className="btn btn-danger" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
