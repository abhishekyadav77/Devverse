import User from '../models/User.js';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import Tag from '../models/Tag.js';
import DailyStat from '../models/DailyStat.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { parsePagination, buildPagination } from '../utils/pagination.js';
import { escapeRegex } from '../utils/regex.js';
import { slugify } from '../utils/slugify.js';
import { liveFilter } from '../services/blog.service.js';
import { deleteBlogDependents } from '../services/engagement.service.js';

const PUBLIC_STATUSES = ['published', 'archived']; // drafts stay private to their authors
const USER_FIELDS = 'name username email avatar role status createdAt followersCount';

const str = (value) => (typeof value === 'string' ? value.trim() : '');
const searchRegex = (value) => {
  const q = str(value).slice(0, 100);
  return q ? new RegExp(escapeRegex(q), 'i') : null;
};

// ---------- Overview ----------

export const getStats = asyncHandler(async (req, res) => {
  const now = new Date();

  const [userGroups, [blogAgg], comments, recentUsers, recentPosts] = await Promise.all([
    User.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Blog.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
          drafts: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
          hidden: { $sum: { $cond: ['$isHidden', 1, 0] } },
          views: { $sum: '$views' },
          likes: { $sum: '$likesCount' },
        },
      },
    ]),
    Comment.countDocuments(),
    User.find().sort({ createdAt: -1 }).limit(5).select('name username avatar role status createdAt').lean(),
    Blog.find({ status: 'published', publishedAt: { $lte: now } })
      .sort({ publishedAt: -1 })
      .limit(5)
      .select('title slug views publishedAt isHidden author')
      .populate('author', 'name username')
      .lean(),
  ]);

  const byStatus = Object.fromEntries(userGroups.map((g) => [g._id, g.count]));
  const blogs = blogAgg || { total: 0, published: 0, drafts: 0, hidden: 0, views: 0, likes: 0 };
  delete blogs._id;

  sendSuccess(res, {
    users: {
      total: (byStatus.active || 0) + (byStatus.suspended || 0),
      active: byStatus.active || 0,
      suspended: byStatus.suspended || 0,
    },
    blogs,
    comments,
    recentUsers,
    recentPosts,
  });
});

// ---------- Analytics ----------

const dayKeys = (days) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - (days - 1 - i));
    return d.toISOString().slice(0, 10);
  });
};

const DAY_FORMAT = '%Y-%m-%d';

// GET /api/admin/analytics?days=7|30|90
export const getAnalytics = asyncHandler(async (req, res) => {
  const requested = parseInt(req.query.days, 10);
  const days = [7, 30, 90].includes(requested) ? requested : 30;
  const keys = dayKeys(days);
  const start = new Date(`${keys[0]}T00:00:00.000Z`);
  const now = new Date();

  const [postRows, userRows, usersBefore, viewRows, categories] = await Promise.all([
    Blog.aggregate([
      { $match: { status: 'published', publishedAt: { $gte: start, $lte: now } } },
      { $group: { _id: { $dateToString: { format: DAY_FORMAT, date: '$publishedAt' } }, count: { $sum: 1 } } },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: { _id: { $dateToString: { format: DAY_FORMAT, date: '$createdAt' } }, count: { $sum: 1 } } },
    ]),
    User.countDocuments({ createdAt: { $lt: start } }),
    DailyStat.find({ date: { $in: keys } }).lean(),
    Blog.aggregate([
      { $match: liveFilter() },
      { $group: { _id: '$category', posts: { $sum: 1 }, views: { $sum: '$views' } } },
      { $sort: { posts: -1, views: -1, _id: 1 } },
      { $limit: 8 },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { _id: 0, name: '$category.name', posts: 1, views: 1 } },
    ]),
  ]);

  const postMap = new Map(postRows.map((r) => [r._id, r.count]));
  const userMap = new Map(userRows.map((r) => [r._id, r.count]));
  const viewMap = new Map(viewRows.map((r) => [r.date, r.views]));

  let running = usersBefore;
  sendSuccess(res, {
    days,
    posts: keys.map((date) => ({ date, value: postMap.get(date) || 0 })),
    users: keys.map((date) => {
      const added = userMap.get(date) || 0;
      running += added;
      return { date, value: running, added };
    }),
    views: keys.map((date) => ({ date, value: viewMap.get(date) || 0 })),
    categories,
  });
});

// ---------- Users ----------

export const listUsers = asyncHandler(async (req, res) => {
  const pg = parsePagination(req.query, { defaultLimit: 15 });
  const filter = {};

  const status = str(req.query.status);
  if (['active', 'suspended'].includes(status)) filter.status = status;
  const role = str(req.query.role);
  if (['user', 'admin'].includes(role)) filter.role = role;
  const rx = searchRegex(req.query.q);
  if (rx) filter.$or = [{ name: rx }, { username: rx }, { email: rx }];

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1, _id: -1 }).skip(pg.skip).limit(pg.limit).select(USER_FIELDS).lean(),
    User.countDocuments(filter),
  ]);

  const counts = users.length
    ? await Blog.aggregate([
        { $match: { author: { $in: users.map((u) => u._id) }, status: { $in: PUBLIC_STATUSES } } },
        { $group: { _id: '$author', count: { $sum: 1 } } },
      ])
    : [];
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  sendSuccess(
    res,
    { users: users.map((u) => ({ ...u, postsCount: countMap.get(String(u._id)) || 0 })) },
    200,
    { pagination: buildPagination(pg, total) }
  );
});

const setUserStatus = (status) =>
  asyncHandler(async (req, res) => {
    const target = await User.findById(req.params.id).select('role');
    if (!target) throw ApiError.notFound('User not found');
    if (target._id.equals(req.user._id)) throw ApiError.badRequest("You can't change your own account status");
    if (status === 'suspended' && target.role === 'admin') throw ApiError.forbidden("Admin accounts can't be suspended");

    const user = await User.findByIdAndUpdate(target._id, { status }, { new: true }).select(USER_FIELDS).lean();
    sendSuccess(res, { user });
  });

export const suspendUser = setUserStatus('suspended');
export const restoreUser = setUserStatus('active');

// ---------- Posts ----------

// GET /api/admin/posts?q=&state=live|hidden&page=
export const listPosts = asyncHandler(async (req, res) => {
  const pg = parsePagination(req.query, { defaultLimit: 15 });
  const state = str(req.query.state);

  let filter = { status: { $in: PUBLIC_STATUSES } };
  if (state === 'live') filter = { ...liveFilter() };
  if (state === 'hidden') filter = { status: { $in: PUBLIC_STATUSES }, isHidden: true };
  const rx = searchRegex(req.query.q);
  if (rx) filter.title = rx;

  const [posts, total] = await Promise.all([
    Blog.find(filter)
      .sort({ publishedAt: -1, _id: -1 })
      .skip(pg.skip)
      .limit(pg.limit)
      .select('title slug status isHidden publishedAt views likesCount commentsCount author')
      .populate('author', 'name username')
      .lean(),
    Blog.countDocuments(filter),
  ]);

  sendSuccess(res, { posts }, 200, { pagination: buildPagination(pg, total) });
});

const setHidden = (hidden) =>
  asyncHandler(async (req, res) => {
    const blog = await Blog.findOneAndUpdate(
      { _id: req.params.id, status: { $in: PUBLIC_STATUSES } },
      { isHidden: hidden },
      { new: true }
    ).select('title slug isHidden');
    if (!blog) throw ApiError.notFound('Post not found');
    sendSuccess(res, { blog });
  });

export const hidePost = setHidden(true);
export const restorePost = setHidden(false);

export const deletePost = asyncHandler(async (req, res) => {
  const blog = await Blog.findOneAndDelete({ _id: req.params.id, status: { $in: PUBLIC_STATUSES } });
  if (!blog) throw ApiError.notFound('Post not found');
  await deleteBlogDependents(blog._id);
  sendSuccess(res, { message: 'Post deleted' });
});

// ---------- Comments ----------

// Deleting uses the existing DELETE /api/comments/:id (admins are allowed there)
export const listComments = asyncHandler(async (req, res) => {
  const pg = parsePagination(req.query, { defaultLimit: 15 });
  const filter = {};
  const rx = searchRegex(req.query.q);
  if (rx) filter.content = rx;

  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(pg.skip)
      .limit(pg.limit)
      .populate([
        { path: 'author', select: 'name username' },
        { path: 'blog', select: 'title slug' },
      ])
      .lean(),
    Comment.countDocuments(filter),
  ]);

  sendSuccess(res, { comments }, 200, { pagination: buildPagination(pg, total) });
});

// ---------- Tags ----------

export const listTags = asyncHandler(async (req, res) => {
  const pg = parsePagination(req.query, { defaultLimit: 15 });
  const filter = {};
  const rx = searchRegex(req.query.q);
  if (rx) filter.name = rx;

  const [tags, total] = await Promise.all([
    Tag.find(filter).sort({ name: 1, _id: 1 }).skip(pg.skip).limit(pg.limit).lean(),
    Tag.countDocuments(filter),
  ]);

  const ids = tags.map((t) => t._id);
  const counts = ids.length
    ? await Blog.aggregate([
        { $match: { tags: { $in: ids } } },
        { $unwind: '$tags' },
        { $match: { tags: { $in: ids } } },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
      ])
    : [];
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  sendSuccess(
    res,
    { tags: tags.map((t) => ({ ...t, postCount: countMap.get(String(t._id)) || 0 })) },
    200,
    { pagination: buildPagination(pg, total) }
  );
});

export const updateTag = asyncHandler(async (req, res) => {
  const tag = await Tag.findById(req.params.id);
  if (!tag) throw ApiError.notFound('Tag not found');

  const slug = slugify(req.body.name);
  if (!slug) throw ApiError.badRequest('Use letters or numbers in the name');
  if (await Tag.exists({ slug, _id: { $ne: tag._id } })) {
    throw new ApiError(409, 'A tag with that name already exists');
  }

  tag.name = req.body.name;
  tag.slug = slug;
  await tag.save();
  sendSuccess(res, { tag });
});

export const deleteTag = asyncHandler(async (req, res) => {
  const tag = await Tag.findById(req.params.id);
  if (!tag) throw ApiError.notFound('Tag not found');

  const result = await Blog.updateMany({ tags: tag._id }, { $pull: { tags: tag._id } });
  await tag.deleteOne();
  sendSuccess(res, { message: 'Tag deleted', removedFrom: result.modifiedCount });
});