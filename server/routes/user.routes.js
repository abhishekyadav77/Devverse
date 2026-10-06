import { Router } from 'express';
import { getPublicProfile, updateProfile } from '../controllers/user.controller.js';
import { listBookmarks, getBookmarkIds } from '../controllers/bookmark.controller.js';
import { getFollowState, followUser, unfollowUser } from '../controllers/follow.controller.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { engagementLimiter } from '../middleware/rateLimiter.js';
import { updateProfileSchema } from '../validators/user.validator.js';

const router = Router();
router.param('id', validateObjectId);

// Static routes must stay ABOVE '/:username'
router.get('/bookmarks', protect, listBookmarks);
router.get('/bookmarks/ids', protect, getBookmarkIds);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);

router.get('/:id/follow', optionalAuth, getFollowState);
router.post('/:id/follow', protect, engagementLimiter, followUser);
router.delete('/:id/follow', protect, engagementLimiter, unfollowUser);

router.get('/:username', optionalAuth, getPublicProfile);

export default router;