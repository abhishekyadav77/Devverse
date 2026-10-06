import { Router } from 'express';
import { searchBlogs } from '../controllers/search.controller.js';
import { searchLimiter } from '../middleware/rateLimiter.js';

const router = Router();
router.get('/', searchLimiter, searchBlogs);

export default router;