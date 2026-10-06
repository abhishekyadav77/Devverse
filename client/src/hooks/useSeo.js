import { useEffect } from 'react';
import { brand } from '../config/brand.js';
import { clip, siteUrl } from '../utils/seo.js';

// Creates or updates a tag and records how to undo it
function setMeta(undo, attr, name, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (el) {
    const previous = el.getAttribute('content');
    el.setAttribute('content', content);
    undo.push(() => el.setAttribute('content', previous ?? ''));
  } else {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    el.setAttribute('content', content);
    document.head.appendChild(el);
    undo.push(() => el.remove());
  }
}

function setCanonical(undo, href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (el) {
    const previous = el.getAttribute('href');
    el.setAttribute('href', href);
    undo.push(() => el.setAttribute('href', previous ?? ''));
  } else {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    el.setAttribute('href', href);
    document.head.appendChild(el);
    undo.push(() => el.remove());
  }
}

/**
 * Per-page head tags. Everything is restored when the page unmounts, so tags never leak
 * from one page to the next.
 * seo: { title, description, image, path, type, noindex, jsonLd }
 *   title   - page title WITHOUT the brand name (it is appended)
 *   path    - the page's canonical path, e.g. "/blog/my-post"
 */
export function useSeo(seo = {}) {
  const key = JSON.stringify(seo);

  useEffect(() => {
    const cfg = JSON.parse(key);
    const undo = [];
    const description = cfg.description ? clip(cfg.description) : '';

    if (cfg.title) {
      const previous = document.title;
      document.title = `${cfg.title} | ${brand.name}`;
      undo.push(() => {
        document.title = previous;
      });
    }

    setMeta(undo, 'name', 'robots', cfg.noindex ? 'noindex, nofollow' : '');
    setMeta(undo, 'name', 'description', description);

    const url = cfg.path ? `${siteUrl()}${cfg.path}` : '';
    if (url) {
      setCanonical(undo, url);
      setMeta(undo, 'property', 'og:url', url);
    }

    setMeta(undo, 'property', 'og:title', cfg.title);
    setMeta(undo, 'property', 'og:description', description);
    setMeta(undo, 'property', 'og:type', cfg.type);
    setMeta(undo, 'property', 'og:image', cfg.image);
    setMeta(undo, 'name', 'twitter:title', cfg.title);
    setMeta(undo, 'name', 'twitter:description', description);
    setMeta(undo, 'name', 'twitter:image', cfg.image);
    setMeta(undo, 'name', 'twitter:card', cfg.image && cfg.type === 'article' ? 'summary_large_image' : '');

    if (cfg.jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(cfg.jsonLd);
      document.head.appendChild(script);
      undo.push(() => script.remove());
    }

    return () => undo.reverse().forEach((fn) => fn());
  }, [key]);
}