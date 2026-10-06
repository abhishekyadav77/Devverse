import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

const MAX = 2000;

export default function CommentForm({
  onSubmit, onCancel, initialValue = '', placeholder = 'Add to the discussion', submitLabel = 'Post comment', autoFocus = false,
}) {
  const [text, setText] = useState(initialValue);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  const submit = async (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return setError('Write something first');
    setBusy(true);
    setError('');
    try {
      await onSubmit(value);
      setText(''); // success: reset (editing/reply forms are closed by the parent)
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <label className="sr-only" htmlFor={`c-${placeholder}`}>{placeholder}</label>
      <textarea
        id={`c-${placeholder}`}
        ref={ref}
        rows={3}
        maxLength={MAX}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="input resize-y"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span className={`text-xs ${text.length > MAX - 100 ? 'text-amber-600' : 'text-ink-400'}`}>{text.length}/{MAX}</span>
        <div className="flex gap-2">
          {onCancel && <button type="button" className="btn-ghost" onClick={onCancel} disabled={busy}>Cancel</button>}
          <button type="submit" className="btn-primary" disabled={busy || !text.trim()}>
            {busy && <Loader2 size={16} className="animate-spin" />} {submitLabel}
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
    </form>
  );
}