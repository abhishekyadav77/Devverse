import Blog from '../models/Blog.js';
import Category from '../models/Category.js';
import Tag from '../models/Tag.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { escapeRegex } from '../utils/regex.js';
import { liveFilter } from '../services/blog.service.js';
import { categoriesWithCounts, popularTags } from '../services/taxonomy.service.js';
import { slugify } from '../utils/slugify.js';

const slugParam = (req) => String(req.params.slug || '').toLowerCase();

// GET /api/categories?sort=popular
export const listCategories = asyncHandler(async (req, res) => {
  const categories = await categoriesWithCounts();
  categories.sort(
    req.query.sort === 'popular'
      ? (a, b) => b.postCount - a.postCount || a.name.localeCompare(b.name)
      : (a, b) => a.name.localeCompare(b.name)
  );
  sendSuccess(res, { categories });
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: slugParam(req) }).lean();
  if (!category) throw ApiError.notFound('Category not found');
  const postCount = await Blog.countDocuments({ ...liveFilter(), category: category._id });
  sendSuccess(res, { category: { ...category, postCount } });
});

// GET /api/tags?q=rea  (prefix match, used by editor suggestions)
export const listTags = asyncHandler(async (req, res) => {
  const filter = {};
  if (typeof req.query.q === 'string' && req.query.q.trim()) {
    filter.name = new RegExp(`^${escapeRegex(req.query.q.trim())}`, 'i');
  }
  const tags = await Tag.find(filter).sort({ name: 1 }).limit(50);
  sendSuccess(res, { tags });
});

export const listPopularTags = asyncHandler(async (req, res) => {
  sendSuccess(res, { tags: await popularTags(20) });
});

export const getTag = asyncHandler(async (req, res) => {
  const tag = await Tag.findOne({ slug: slugParam(req) }).lean();
  if (!tag) throw ApiError.notFound('Tag not found');
  const postCount = await Blog.countDocuments({ ...liveFilter(), tags: tag._id });
  sendSuccess(res, { tag: { ...tag, postCount } });
});

// ---------- Admin: category management ----------

const OBJECT_ID = /^[a-f\d]{24}$/i;

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const slug = slugify(name);
  if (!slug) throw ApiError.badRequest('Use letters or numbers in the name');
  if (await Category.exists({ $or: [{ slug }, { name }] })) {
    throw new ApiError(409, 'A category with that name already exists');
  }

  const category = await Category.create({ name, slug, description });
  sendSuccess(res, { category: { ...category.toObject(), postCount: 0 } }, 201);
});

// Renaming also regenerates the slug, so old /category/<slug> links stop working
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  const { name, description } = req.body;
  const slug = slugify(name);
  if (!slug) throw ApiError.badRequest('Use letters or numbers in the name');
  if (await Category.exists({ $or: [{ slug }, { name }], _id: { $ne: category._id } })) {
    throw new ApiError(409, 'A category with that name already exists');
  }

  Object.assign(category, { name, slug, description });
  await category.save();
  sendSuccess(res, { category });
});

// DELETE /api/categories/:id?reassignTo=<categoryId>
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  if ((await Category.countDocuments()) <= 1) {
    throw ApiError.badRequest('Keep at least one category. Posts need a category to be published');
  }

  const used = await Blog.countDocuments({ category: category._id });
  if (used > 0) {
    const target = typeof req.query.reassignTo === 'string' ? req.query.reassignTo : '';
    if (!OBJECT_ID.test(target) || target === String(category._id)) {
      throw new ApiError(
        409,
        `${used} ${used === 1 ? 'post uses' : 'posts use'} this category. Choose a category to move them to`
      );
    }
    if (!(await Category.exists({ _id: target }))) throw ApiError.badRequest('The category to move posts into does not exist');
    await Blog.updateMany({ category: category._id }, { category: target });
  }

  await category.deleteOne();
  sendSuccess(res, { message: 'Category deleted', moved: used });
});
