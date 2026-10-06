import Blog from '../models/Blog.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { parsePagination, buildPagination } from '../utils/pagination.js';
import { applyFields, assertPublishable, generateUniqueSlug, liveFilter } from '../services/blog.service.js';
import { deleteBlogDependents } from '../services/engagement.service.js';
import { recordView } from '../services/stats.service.js';
import { shouldCountView } from '../services/viewTracker.js';

const populateBlog = (blogOrQuery) =>
  blogOrQuery.populate([
    { path: 'author', select: 'name username avatar bio' },
    { path: 'category', select: 'name slug' },
    { path: 'tags', select: 'name slug' },
  ]);

// Loads a post only if the caller owns it (or is an admin)
const findManageable = async (id, user) => {
  const blog = await Blog.findById(id);
  if (!blog) throw ApiError.notFound('Post not found');
  if (!blog.author.equals(user._id) && user.role !== 'admin') {
    throw ApiError.forbidden('You can only manage your own posts');
  }
  return blog;
};

// ---------- Public ----------

export const listPublished = asyncHandler(async (req, res) => {
  const pg = parsePagination(req.query, { defaultLimit: 9 });
  const filter = liveFilter();

  const [blogs, total] = await Promise.all([
    populateBlog(Blog.find(filter).select('-content').sort({ publishedAt: -1 }).skip(pg.skip).limit(pg.limit)),
    Blog.countDocuments(filter),
  ]);

  sendSuccess(res, { blogs }, 200, { pagination: buildPagination(pg, total) });
});

export const getBySlug = asyncHandler(async (req, res) => {
  const blog = await populateBlog(Blog.findOne({ slug: req.params.slug.toLowerCase() }));
  if (!blog) throw ApiError.notFound('Article not found');

  const isLive =
    blog.status === 'published' && !blog.isHidden && blog.publishedAt && blog.publishedAt <= new Date();
  const isOwner = req.user && blog.author._id.equals(req.user._id);
  const canPreview = isOwner || req.user?.role === 'admin';

  // Drafts, scheduled and hidden posts are only visible to the owner/admin (as a preview)
  if (!isLive && !canPreview) throw ApiError.notFound('Article not found');

      if (isLive && !isOwner && shouldCountView(req, blog._id)) {
    await Blog.updateOne({ _id: blog._id }, { $inc: { views: 1 } });
    blog.views += 1;
    await recordView();
  }
  sendSuccess(res, { blog });
});

// ---------- Author ----------

export const listMine = asyncHandler(async (req, res) => {
  const pg = parsePagination(req.query);
  const filter = { author: req.user._id };
  if (req.query.status === 'draft' || req.query.status === 'published') filter.status = req.query.status;

  const [blogs, total] = await Promise.all([
    populateBlog(Blog.find(filter).select('-content').sort({ updatedAt: -1 }).skip(pg.skip).limit(pg.limit)),
    Blog.countDocuments(filter),
  ]);

  sendSuccess(res, { blogs }, 200, { pagination: buildPagination(pg, total) });
});

export const getMyStats = asyncHandler(async (req, res) => {
  const [agg] = await Blog.aggregate([
    { $match: { author: req.user._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
        drafts: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
        views: { $sum: '$views' },
        likes: { $sum: '$likesCount' },
        comments: { $sum: '$commentsCount' },
      },
    },
  ]);
  const stats = agg || { total: 0, published: 0, drafts: 0, views: 0, likes: 0, comments: 0 };
  delete stats._id;
  sendSuccess(res, { stats });
});

export const getForEdit = asyncHandler(async (req, res) => {
  const blog = await populateBlog(await findManageable(req.params.id, req.user));
  sendSuccess(res, { blog });
});

export const createBlog = asyncHandler(async (req, res) => {
  const blog = new Blog({ author: req.user._id, slug: await generateUniqueSlug(req.body.title) });
  await applyFields(blog, req.body);
  await blog.save();
  await populateBlog(blog);
  sendSuccess(res, { blog }, 201);
});

export const updateBlog = asyncHandler(async (req, res) => {
  const blog = await findManageable(req.params.id, req.user);

  // Never-published drafts follow their title; published URLs stay stable
  if (!blog.publishedAt && req.body.title !== blog.title) {
    blog.slug = await generateUniqueSlug(req.body.title, blog._id);
  }
  await applyFields(blog, req.body);

  // A live post can't be edited into an incomplete state
  if (blog.status === 'published') assertPublishable(blog);

  await blog.save();
  await populateBlog(blog);
  sendSuccess(res, { blog });
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await findManageable(req.params.id, req.user);
    await blog.deleteOne();
  await deleteBlogDependents(blog._id);
  sendSuccess(res, { message: 'Post deleted' });
});

export const publishBlog = asyncHandler(async (req, res) => {
  const blog = await findManageable(req.params.id, req.user);
  assertPublishable(blog);

  let publishAt = new Date();
  if (req.body.publishAt) {
    publishAt = new Date(req.body.publishAt);
    const now = Date.now();
    if (publishAt.getTime() < now - 60 * 1000) throw ApiError.badRequest('Publish date must be in the future');
    if (publishAt.getTime() > now + 365 * 24 * 60 * 60 * 1000) {
      throw ApiError.badRequest('Publish date must be within the next year');
    }
  }

  // Keep the original date for live posts; set it for drafts and still-scheduled posts
  const isLive = blog.status === 'published' && blog.publishedAt && blog.publishedAt <= new Date();
  if (!isLive) blog.publishedAt = publishAt;
  blog.status = 'published';

  await blog.save();
  await populateBlog(blog);
  sendSuccess(res, { blog });
});

export const unpublishBlog = asyncHandler(async (req, res) => {
  const blog = await findManageable(req.params.id, req.user);
  blog.status = 'draft';
  blog.publishedAt = null;
  await blog.save();
  await populateBlog(blog);
  sendSuccess(res, { blog });
});