import Blog from '../models/Blog.js';
import Category from '../models/Category.js';
import Tag from '../models/Tag.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { parsePagination, buildPagination } from '../utils/pagination.js';
import { liveFilter } from '../services/blog.service.js';
import { resolveSort, populateCards } from '../services/listing.service.js';

// Query-string values can be arrays or objects (?category[$ne]=x). Only plain strings are accepted.
const asSlug = (value) => (typeof value === 'string' ? value.trim().toLowerCase().slice(0, 100) : '');

// GET /api/blogs?category=&tag=&author=&sort=latest|popular|views&page=&limit=
export const listBlogs = asyncHandler(async (req, res) => {
  const pg = parsePagination(req.query, { defaultLimit: 9 });
  const filter = liveFilter();
  const empty = () => sendSuccess(res, { blogs: [] }, 200, { pagination: buildPagination(pg, 0) });

  const category = asSlug(req.query.category);
  if (category) {
    const doc = await Category.findOne({ slug: category }).select('_id').lean();
    if (!doc) return empty();
    filter.category = doc._id;
  }

  const tag = asSlug(req.query.tag);
  if (tag) {
    const doc = await Tag.findOne({ slug: tag }).select('_id').lean();
    if (!doc) return empty();
    filter.tags = doc._id;
  }

  const author = asSlug(req.query.author);
  if (author) {
    const doc = await User.findOne({ username: author, status: 'active' }).select('_id').lean();
    if (!doc) return empty();
    filter.author = doc._id;
  }

  const [blogs, total] = await Promise.all([
    populateCards(
      Blog.find(filter).select('-content').sort(resolveSort(req.query.sort)).skip(pg.skip).limit(pg.limit)
    ),
    Blog.countDocuments(filter),
  ]);

  sendSuccess(res, { blogs }, 200, { pagination: buildPagination(pg, total) });
});