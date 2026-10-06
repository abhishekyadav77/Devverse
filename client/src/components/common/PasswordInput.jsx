import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = forwardRef(function PasswordInput({ className = '', ...props }, ref) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input ref={ref} type={show ? 'text' : 'password'} className={`input pr-11 ${className}`} {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
});

export default PasswordInput;