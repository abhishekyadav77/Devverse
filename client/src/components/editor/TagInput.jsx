import { useId, useState } from 'react';
import { X } from 'lucide-react';

export default function TagInput({ value, onChange, max = 5, suggestions = [] }) {
  const [input, setInput] = useState('');
  const listId = useId();

  const add = (raw) => {
    const name = raw.trim().replace(/\s+/g, ' ');
    if (name.length < 2 || name.length > 30) return false;
    if (value.length >= max || value.some((t) => t.toLowerCase() === name.toLowerCase())) return false;
    onChange([...value, name]);
    return true;
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (add(input)) setInput('');
    } else if (e.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-800 dark:bg-brand-900/30 dark:text-brand-200">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} aria-label={`Remove tag ${tag}`}>
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => add(input) && setInput('')}
        disabled={value.length >= max}
        list={listId}
        className="input mt-2"
        placeholder={value.length >= max ? `Maximum of ${max} tags` : 'Type a tag and press Enter'}
        aria-label="Add a tag"
      />
      <datalist id={listId}>
        {suggestions.map((s) => <option key={s} value={s} />)}
      </datalist>
    </div>
  );
}