import { Router } from 'express';
import { updateComment, deleteComment, likeComment, unlikeComment } from '../controllers/comment.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { engagementLimiter, commentLimiter } from '../middleware/rateLimiter.js';
import { updateCommentSchema } from '../validators/comment.validator.js';

const router = Router();
router.param('id', validateObjectId);

router.put('/:id', protect, commentLimiter, validate(updateCommentSchema), updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, engagementLimiter, likeComment);
router.delete('/:id/like', protect, engagementLimiter, unlikeComment);

export default router;