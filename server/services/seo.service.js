import Blog from '../models/Blog.js';
import { site } from '../config/site.js';
import { env } from '../config/env.js';
import { escapeHtml, escapeXml, safeJson } from '../utils/escape.js';
import { sanitizeContent } from '../utils/sanitize.js';
import { textFromHtml } from '../utils/text.js';
import { liveFilter } from './blog.service.js';
import { categoriesWithCounts, popularTags } from './taxonomy.service.js';

const clip = (text = '', max = 160) => {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`;
};

// Facebook and X don't reliably handle WebP/AVIF, so share previews use a 1200x630 JPG
export const ogImage = (url) => {
  if (!url) return '';
  const marker = '/image/upload/f_auto,q_auto/';
  return url.includes(marker) ? url.replace(marker, '/image/upload/f_jpg,q_auto,w_1200,h_630,c_fill/') : url;
};

export const findPublicBlogForSeo = (slug) =>
  Blog.findOne({ slug: slug.toLowerCase(), ...liveFilter() })
    .populate([
      { path: 'author', select: 'name username' },
      { path: 'category', select: 'name slug' },
      { path: 'tags', select: 'name slug' },
    ])
    .lean();

// ---------- Article page for crawlers ----------

const blogJsonLd = (blog, { url, title, description, image, wordCount }) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  headline: title.slice(0, 110), // Google truncates headlines beyond 110 characters
  description,
  ...(image && { image: [image] }),
  datePublished: new Date(blog.publishedAt).toISOString(),
  dateModified: new Date(blog.modifiedAt || blog.publishedAt).toISOString(),
  author: {
    '@type': 'Person',
    name: blog.author?.name,
    url: `${site.url}/author/${blog.author?.username}`,
  },
  publisher: { '@type': 'Organization', name: site.name },
  ...(blog.category && { articleSection: blog.category.name }),
  ...(blog.tags?.length && { keywords: blog.tags.map((t) => t.name).join(', ') }),
  wordCount,
  inLanguage: 'en',
});

export const renderBlogHtml = (blog) => {
  const url = `${site.url}/blog/${blog.slug}`;
  const title = blog.seo?.title || blog.title;
  const content = sanitizeContent(blog.content); // re-sanitized on output as defence in depth
  const text = textFromHtml(content);
  const description = clip(blog.seo?.description || blog.subtitle || blog.excerpt || text);
  const image = ogImage(blog.coverImage);
  const authorUrl = `${site.url}/author/${blog.author?.username}`;
  const published = new Date(blog.publishedAt).toISOString();
  const modified = new Date(blog.modifiedAt || blog.publishedAt).toISOString();
  const wordCount = text ? text.split(/\s+/).length : 0;

  const meta = [
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<link rel="canonical" href="${escapeHtml(url)}">`,
    `<meta property="og:site_name" content="${escapeHtml(site.name)}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:url" content="${escapeHtml(url)}">`,
    image && `<meta property="og:image" content="${escapeHtml(image)}">`,
    image && `<meta property="og:image:width" content="1200">`,
    image && `<meta property="og:image:height" content="630">`,
    `<meta property="article:published_time" content="${published}">`,
    `<meta property="article:modified_time" content="${modified}">`,
    `<meta property="article:author" content="${escapeHtml(authorUrl)}">`,
    blog.category && `<meta property="article:section" content="${escapeHtml(blog.category.name)}">`,
    ...(blog.tags || []).map((t) => `<meta property="article:tag" content="${escapeHtml(t.name)}">`),
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">`,
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    image && `<meta name="twitter:image" content="${escapeHtml(image)}">`,
    `<script type="application/ld+json">${safeJson(blogJsonLd(blog, { url, title, description, image, wordCount }))}</script>`,
  ]
    .filter(Boolean)
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} | ${escapeHtml(site.name)}</title>
${meta}
</head>
<body>
<article>
<h1>${escapeHtml(blog.title)}</h1>
${blog.subtitle ? `<p>${escapeHtml(blog.subtitle)}</p>` : ''}
<p>By <a href="${escapeHtml(authorUrl)}">${escapeHtml(blog.author?.name || '')}</a>, <time datetime="${published}">${published.slice(0, 10)}</time></p>
${blog.coverImage ? `<img src="${escapeHtml(blog.coverImage)}" alt="">` : ''}
${content}
</article>
<p><a href="${escapeHtml(url)}">Read this article on ${escapeHtml(site.name)}</a></p>
</body>
</html>`;
};

export const renderNotFoundHtml = () => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Article not found | ${escapeHtml(site.name)}</title></head>
<body><h1>Article not found</h1><p><a href="${escapeHtml(site.url)}">Back to ${escapeHtml(site.name)}</a></p></body></html>`;

// ---------- robots.txt ----------

export const buildRobots = () =>
  [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /admin',
    'Disallow: /dashboard',
    'Disallow: /login',
    'Disallow: /register',
    'Disallow: /forgot-password',
    'Disallow: /reset-password',
    'Disallow: /search',
    '',
    `Sitemap: ${site.url}/sitemap.xml`,
    '',
  ].join('\n');

// ---------- sitemap.xml ----------

const buildSitemap = async () => {
  const [blogs, categories, tags, authors] = await Promise.all([
    Blog.find(liveFilter()).sort({ publishedAt: -1 }).limit(45000).select('slug publishedAt modifiedAt').lean(),
    categoriesWithCounts(),
    popularTags(2000),
    Blog.aggregate([
      { $match: liveFilter() },
      { $group: { _id: '$author', last: { $max: '$publishedAt' } } },
      { $limit: 2000 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'u' } },
      { $unwind: '$u' },
      { $match: { 'u.status': 'active' } },
      { $project: { _id: 0, username: '$u.username', last: 1 } },
    ]),
  ]);

  const urls = [
    { loc: '/' },
    { loc: '/explore' },
    ...blogs.map((b) => ({ loc: `/blog/${b.slug}`, lastmod: b.modifiedAt || b.publishedAt })),
    ...categories.filter((c) => c.postCount > 0).map((c) => ({ loc: `/category/${c.slug}` })),
    ...tags.map((t) => ({ loc: `/tag/${t.slug}` })),
    ...authors.map((a) => ({ loc: `/author/${a.username}`, lastmod: a.last })),
  ];

  const body = urls
    .map(
      (u) =>
        `  <url><loc>${escapeXml(site.url + u.loc)}</loc>${
          u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ''
        }</url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
};

// Cached for an hour in production (5 seconds in development so changes are easy to test).
// Concurrent requests share one rebuild.
const TTL = env.isProd ? 60 * 60 * 1000 : 5000;
let cached = null;
let building = null;

export const getSitemap = async () => {
  if (cached && Date.now() - cached.at < TTL) return cached.xml;
  if (!building) {
    building = buildSitemap()
      .then((xml) => {
        cached = { xml, at: Date.now() };
        return xml;
      })
      .finally(() => {
        building = null;
      });
  }
  return building;
};