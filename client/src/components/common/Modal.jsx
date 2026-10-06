import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, title, onClose, children }) {
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && closeRef.current();
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector('input, select, textarea')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="modal-title" className="card w-full max-w-md p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="btn-ghost !p-1.5" aria-label="Close"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}