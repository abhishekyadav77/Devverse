import { brand } from '../config/brand.js';

export const siteUrl = () => (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/+$/, '');

export const clip = (text = '', max = 160) => {
  const t = String(text).replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`;
};

// Share previews work best as a 1200x630 JPG (same transformation the server uses)
export const ogImage = (url) => {
  if (!url) return '';
  const marker = '/image/upload/f_auto,q_auto/';
  return url.includes(marker) ? url.replace(marker, '/image/upload/f_jpg,q_auto,w_1200,h_630,c_fill/') : url;
};

export const blogJsonLd = (blog) => {
  const base = siteUrl();
  const title = blog.seo?.title || blog.title || '';
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${base}/blog/${blog.slug}` },
    headline: title.slice(0, 110),
    description: clip(blog.seo?.description || blog.subtitle || blog.excerpt),
    ...(blog.coverImage && { image: [ogImage(blog.coverImage)] }),
    datePublished: blog.publishedAt,
    dateModified: blog.modifiedAt || blog.publishedAt,
    author: { '@type': 'Person', name: blog.author?.name, url: `${base}/author/${blog.author?.username}` },
    publisher: { '@type': 'Organization', name: brand.name },
    ...(blog.category && { articleSection: blog.category.name }),
    ...(blog.tags?.length && { keywords: blog.tags.map((t) => t.name).join(', ') }),
    inLanguage: 'en',
  };
};