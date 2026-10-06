import { Outlet } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';
import ThemeToggle from '../components/common/ThemeToggle.jsx';
import { brand } from '../config/brand.js';
import { useSeo } from '../hooks/useSeo.js';


export default function AuthLayout() {

    useSeo({ noindex: true });
    
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-ink-950 p-12 text-white lg:flex">
        <Logo className="[&_span:last-child]:!text-white" />
        <div>
          <p className="font-display text-4xl font-bold leading-tight">{brand.tagline}</p>
          <p className="mt-4 max-w-sm text-ink-300">{brand.description}</p>
        </div>
        <p className="text-xs text-ink-500">&copy; {new Date().getFullYear()} {brand.name}</p>
      </div>
      <div className="relative flex items-center justify-center px-6 py-12">
        <div className="absolute right-4 top-4 flex items-center gap-2"><ThemeToggle /></div>
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
