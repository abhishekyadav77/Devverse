import { Link } from 'react-router-dom';
import { useSeo } from '../../hooks/useSeo.js';

export default function NotFound() {
  useSeo({ title: 'Page not found', noindex: true });
  return (
    <section className="container-page py-24 text-center">
      <p className="font-display text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-bold">That page doesn't exist</h1>
      <p className="mt-2 text-ink-500">The link may be broken or the page may have moved.</p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </section>
  );
}