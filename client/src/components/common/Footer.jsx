import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { brand } from '../../config/brand.js';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-200 dark:border-ink-800">
      <div className="container-page flex flex-col gap-8 py-12 md:flex-row md:justify-between">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm text-ink-500">
            {brand.tagline} {brand.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-4">
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-ink-900 dark:text-white">
              Read
            </span>
            <Link
              to="/explore"
              className="text-ink-500 hover:text-brand-600"
            >
              Explore
            </Link>
            <Link
              to="/search"
              className="text-ink-500 hover:text-brand-600"
            >
              Search
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-semibold text-ink-900 dark:text-white">
              Write
            </span>
            <Link
              to="/dashboard/write"
              className="text-ink-500 hover:text-brand-600"
            >
              Start writing
            </Link>
            <Link
              to="/dashboard"
              className="text-ink-500 hover:text-brand-600"
            >
              Dashboard
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-semibold text-ink-900 dark:text-white">
              Account
            </span>
            <Link
              to="/login"
              className="text-ink-500 hover:text-brand-600"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-ink-500 hover:text-brand-600"
            >
              Sign up
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-semibold text-ink-900 dark:text-white">
              About
            </span>

            <Link
              to="/about#devverse"
              className="text-ink-500 hover:text-brand-600"
            >
              About DevVerse
            </Link>

            <Link
              to="/about#developer"
              className="text-ink-500 hover:text-brand-600"
            >
              About the Developer
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-ink-100 py-5 text-center text-xs text-ink-400 dark:border-ink-800">
        &copy; {new Date().getFullYear()} {brand.name}. All rights reserved.
      </div>
    </footer>
  );
}