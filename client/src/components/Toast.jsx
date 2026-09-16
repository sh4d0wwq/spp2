export default function Toast({ type, text, onClose }) {
  return (
    <div className={`toast toast-${type}`} role="status">
      <span>{text}</span>
      <button type="button" onClick={onClose} aria-label="Закрыть уведомление">
        ×
      </button>
    </div>
  );
}
