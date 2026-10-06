import { Construction } from 'lucide-react';

// Temporary shell used until each page is built in its own phase.
export default function PagePlaceholder({ title, description, phase, children }) {
  return (
    <section className="container-page py-16">
      <div className="card mx-auto max-w-2xl p-8 text-center">
        <Construction className="mx-auto text-brand-600" size={28} />
        <h1 className="mt-4 text-2xl font-bold">{title}</h1>
        {description && <p className="mt-2 text-ink-500">{description}</p>}
        {phase && <p className="mt-4 text-xs text-ink-400">Built in Phase {phase}</p>}
        {children}
      </div>
    </section>
  );
}
