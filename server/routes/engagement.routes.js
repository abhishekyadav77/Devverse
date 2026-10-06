import { Router } from 'express';
import { getLikeState, likeBlog, unlikeBlog } from '../controllers/like.controller.js';
import { bookmarkBlog, unbookmarkBlog } from '../controllers/bookmark.controller.js';
import { listComments, createComment } from '../controllers/comment.controller.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { engagementLimiter, commentLimiter } from '../middleware/rateLimiter.js';
import { commentSchema } from '../validators/comment.validator.js';

const router = Router();
router.param('id', validateObjectId);

router.get('/:id/like', optionalAuth, getLikeState);
router.post('/:id/like', protect, engagementLimiter, likeBlog);
router.delete('/:id/like', protect, engagementLimiter, unlikeBlog);

router.post('/:id/bookmark', protect, engagementLimiter, bookmarkBlog);
router.delete('/:id/bookmark', protect, engagementLimiter, unbookmarkBlog);

router.get('/:id/comments', optionalAuth, listComments);
router.post('/:id/comments', protect, commentLimiter, validate(commentSchema), createComment);

export default router;