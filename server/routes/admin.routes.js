import { Router } from 'express';
import {
  getStats, getAnalytics, listUsers, suspendUser, restoreUser,
  listPosts, hidePost, restorePost, deletePost, listComments,
  listTags, updateTag, deleteTag,
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { tagSchema } from '../validators/admin.validator.js';

const router = Router();
router.param('id', validateObjectId);

// Every admin route requires a valid session AND the admin role
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/analytics', getAnalytics);

router.get('/users', listUsers);
router.patch('/users/:id/suspend', suspendUser);
router.patch('/users/:id/restore', restoreUser);

router.get('/posts', listPosts);
router.patch('/posts/:id/hide', hidePost);
router.patch('/posts/:id/restore', restorePost);
router.delete('/posts/:id', deletePost);

router.get('/comments', listComments);

router.get('/tags', listTags);
router.put('/tags/:id', validate(tagSchema), updateTag);
router.delete('/tags/:id', deleteTag);

export default router;