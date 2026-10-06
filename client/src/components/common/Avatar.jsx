const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-24 w-24 text-2xl' };

export default function Avatar({ src, name = '', size = 'sm', className = '' }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
  const base = `${sizes[size]} shrink-0 rounded-full ${className}`;

  if (src) return <img src={src} alt={name} className={`${base} object-cover`} loading="lazy" />;
  return (
    <span className={`${base} grid place-items-center bg-brand-100 font-semibold text-brand-800 dark:bg-brand-900 dark:text-brand-200`} aria-hidden="true">
      {initials}
    </span>
  );
}