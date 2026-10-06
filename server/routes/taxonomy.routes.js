import { Router } from 'express';
import {
  listCategories, getCategory, createCategory, updateCategory, deleteCategory,
  listTags, listPopularTags, getTag,
} from '../controllers/taxonomy.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { categorySchema } from '../validators/admin.validator.js';

export const categoryRouter = Router();
categoryRouter.param('id', validateObjectId);

categoryRouter.get('/', listCategories);
categoryRouter.get('/:slug', getCategory);
// Writes are admin-only, enforced here on the server
categoryRouter.post('/', protect, authorize('admin'), validate(categorySchema), createCategory);
categoryRouter.put('/:id', protect, authorize('admin'), validate(categorySchema), updateCategory);
categoryRouter.delete('/:id', protect, authorize('admin'), deleteCategory);

export const tagRouter = Router();
tagRouter.get('/', listTags);
tagRouter.get('/popular', listPopularTags); // must stay above '/:slug'
tagRouter.get('/:slug', getTag);