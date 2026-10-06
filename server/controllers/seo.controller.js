import { asyncHandler } from '../utils/asyncHandler.js';
import {
  buildRobots, findPublicBlogForSeo, getSitemap, renderBlogHtml, renderNotFoundHtml,
} from '../services/seo.service.js';

export const sitemap = asyncHandler(async (req, res) => {
  const xml = await getSitemap();
  res.type('application/xml').set('Cache-Control', 'public, max-age=3600').send(xml);
});

export const robots = (req, res) => {
  res.type('text/plain').set('Cache-Control', 'public, max-age=86400').send(buildRobots());
};

// Served to crawlers only (Vercel routes them here by User-Agent)
export const blogMeta = asyncHandler(async (req, res) => {
  // Lock the page down: no scripts, no styles, images over https only
  res.set('Content-Security-Policy', "default-src 'none'; img-src https:");

  const slug = String(req.params.slug || '');
  const blog = /^[a-z0-9-]{1,100}$/i.test(slug) ? await findPublicBlogForSeo(slug) : null;
  if (!blog) return res.status(404).type('html').send(renderNotFoundHtml());

  res.set('Cache-Control', 'public, max-age=300').type('html').send(renderBlogHtml(blog));
});