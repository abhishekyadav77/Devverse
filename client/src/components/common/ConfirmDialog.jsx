import { useEffect, useRef } from 'react';

export default function ConfirmDialog({
  open, title, message, confirmLabel = 'Delete', danger = true, loading = false, onConfirm, onCancel,
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    cancelRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className="card w-full max-w-md p-6 shadow-xl">
        <h2 id="confirm-title" className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-sm text-ink-500">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button ref={cancelRef} className="btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} disabled={loading}>
            {loading ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}