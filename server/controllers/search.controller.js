import Blog from '../models/Blog.js';
import Category from '../models/Category.js';
import Tag from '../models/Tag.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { parsePagination, buildPagination } from '../utils/pagination.js';
import { escapeRegex } from '../utils/regex.js';
import { liveFilter } from '../services/blog.service.js';
import { resolveSort, populateCards } from '../services/listing.service.js';

const MIN_QUERY = 2;

// GET /api/search?q=react&sort=latest|popular|views&page=&limit=
export const searchBlogs = asyncHandler(async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
  const pg = parsePagination(req.query, { defaultLimit: 10 });

  if (q.length < MIN_QUERY) {
    return sendSuccess(res, { blogs: [], query: q }, 200, { pagination: buildPagination(pg, 0) });
  }

  const regex = new RegExp(escapeRegex(q), 'i');

  // 1) Resolve every way a post can match: content, tags, categories, authors
  const [textHits, tags, categories, authors] = await Promise.all([
    Blog.find({ $text: { $search: q }, ...liveFilter() }).select('_id').limit(1000).lean(),
    Tag.find({ name: regex }).select('_id').limit(50).lean(),
    Category.find({ name: regex }).select('_id').limit(20).lean(),
    User.find({ status: 'active', $or: [{ name: regex }, { username: regex }] }).select('_id').limit(50).lean(),
  ]);

  // 2) One paginated query over the union, always restricted to live posts
  const filter = {
    $and: [
      liveFilter(),
      {
        $or: [
          { _id: { $in: textHits.map((h) => h._id) } },
          { title: regex },
          { subtitle: regex },
          { tags: { $in: tags.map((t) => t._id) } },
          { category: { $in: categories.map((c) => c._id) } },
          { author: { $in: authors.map((a) => a._id) } },
        ],
      },
    ],
  };

  const [blogs, total] = await Promise.all([
    populateCards(
      Blog.find(filter).select('-content').sort(resolveSort(req.query.sort)).skip(pg.skip).limit(pg.limit)
    ),
    Blog.countDocuments(filter),
  ]);

  sendSuccess(res, { blogs, query: q }, 200, { pagination: buildPagination(pg, total) });
});