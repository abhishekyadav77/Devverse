import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, X, XCircle } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (type, message) => {
      const id = ++idRef.current;
      setToasts((t) => [...t, { id, type, message }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({ success: (m) => push('success', m), error: (m) => push('error', m) }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-ink-200 bg-white p-4 shadow-lg dark:border-ink-700 dark:bg-ink-900"
          >
            {t.type === 'success' ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brand-600" />
            ) : (
              <XCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
            )}
            <p className="flex-1 text-sm">{t.message}</p>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-200">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};