import { Router } from 'express';
import { sitemap, robots, blogMeta } from '../controllers/seo.controller.js';
import { seoLimiter } from '../middleware/rateLimiter.js';

// Mounted at the site root (not under /api) so /sitemap.xml and /robots.txt are real URLs
const router = Router();

router.get('/sitemap.xml', seoLimiter, sitemap);
router.get('/robots.txt', seoLimiter, robots);
router.get('/seo/blog/:slug', seoLimiter, blogMeta);

export default router;