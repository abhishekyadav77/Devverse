export default function EmptyState({ title, text, action }) {
  return (
    <div className="card mx-auto max-w-lg px-6 py-12 text-center">
      <p className="text-lg font-semibold text-ink-900 dark:text-white">{title}</p>
      {text && <p className="mt-2 text-sm text-ink-500">{text}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}