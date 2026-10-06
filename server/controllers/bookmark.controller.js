import Blog from '../models/Blog.js';
import Bookmark from '../models/Bookmark.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { parsePagination, buildPagination } from '../utils/pagination.js';
import { liveFilter } from '../services/blog.service.js';
import { populateCards } from '../services/listing.service.js';
import { findLiveBlog, isDuplicateKey } from '../services/engagement.service.js';

const MAX_BOOKMARKS = 1000;

export const bookmarkBlog = asyncHandler(async (req, res) => {
  const blogId = req.params.id;
  await findLiveBlog(blogId);

  try {
    await Bookmark.create({ user: req.user._id, blog: blogId });
    await Blog.updateOne({ _id: blogId }, { $inc: { bookmarksCount: 1 } });
  } catch (err) {
    if (!isDuplicateKey(err)) throw err;
  }
  sendSuccess(res, { bookmarked: true });
});

export const unbookmarkBlog = asyncHandler(async (req, res) => {
  const blogId = req.params.id;
  if (!(await Blog.exists({ _id: blogId }))) throw ApiError.notFound('Article not found');

  const result = await Bookmark.deleteOne({ user: req.user._id, blog: blogId });
  if (result.deletedCount === 1) {
    await Blog.updateOne({ _id: blogId }, { $inc: { bookmarksCount: -1 } });
  }
  sendSuccess(res, { bookmarked: false });
});

// GET /api/users/bookmarks/ids  (lets every card show the right bookmark state)
export const getBookmarkIds = asyncHandler(async (req, res) => {
  const ids = await Bookmark.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(MAX_BOOKMARKS)
    .distinct('blog');
  sendSuccess(res, { ids });
});

// GET /api/users/bookmarks?page=&limit=  (newest bookmark first, live posts only)
export const listBookmarks = asyncHandler(async (req, res) => {
  const pg = parsePagination(req.query, { defaultLimit: 9 });

  const saved = await Bookmark.find({ user: req.user._id })
    .sort({ createdAt: -1, _id: -1 })
    .limit(MAX_BOOKMARKS)
    .select('blog')
    .lean();
  const savedIds = saved.map((b) => b.blog);

  // Drop bookmarks whose post is now a draft, hidden or deleted
  const live = await Blog.find({ _id: { $in: savedIds }, ...liveFilter() }).select('_id').lean();
  const liveSet = new Set(live.map((b) => String(b._id)));
  const orderedIds = savedIds.filter((id) => liveSet.has(String(id)));

  const pageIds = orderedIds.slice(pg.skip, pg.skip + pg.limit);
  const blogs = pageIds.length
    ? await populateCards(Blog.find({ _id: { $in: pageIds } }).select('-content'))
    : [];
  const byId = new Map(blogs.map((b) => [String(b._id), b]));
  const ordered = pageIds.map((id) => byId.get(String(id))).filter(Boolean);

  sendSuccess(res, { blogs: ordered }, 200, { pagination: buildPagination(pg, orderedIds.length) });
});