import { Router } from 'express';
import {
  getBySlug, listMine, getMyStats, getForEdit,
  createBlog, updateBlog, deleteBlog, publishBlog, unpublishBlog,
} from '../controllers/blog.controller.js';
import { listBlogs } from '../controllers/listing.controller.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { blogSchema, publishSchema } from '../validators/blog.validator.js';

const router = Router();

router.get('/', listBlogs);

// Static paths must stay ABOVE '/:slug'
router.get('/mine', protect, listMine);
router.get('/mine/stats', protect, getMyStats);
router.get('/manage/:id', protect, getForEdit);

router.post('/', protect, validate(blogSchema), createBlog);
router.put('/:id', protect, validate(blogSchema), updateBlog);
router.delete('/:id', protect, deleteBlog);
router.post('/:id/publish', protect, validate(publishSchema), publishBlog);
router.post('/:id/unpublish', protect, unpublishBlog);

router.get('/:slug', optionalAuth, getBySlug);

export default router;