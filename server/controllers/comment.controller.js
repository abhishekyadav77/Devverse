import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import CommentLike from '../models/CommentLike.js';
import Notification from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { parsePagination, buildPagination } from '../utils/pagination.js';
import { findLiveBlog, isDuplicateKey } from '../services/engagement.service.js';
import { notify, snippet } from '../services/notification.service.js';

const AUTHOR_FIELDS = 'name username avatar';
const populateParts = [
  { path: 'author', select: AUTHOR_FIELDS },
  { path: 'replyTo', select: 'name username' },
];

// GET /api/blogs/:id/comments?page=&limit=  (top-level newest first, each with its replies)
export const listComments = asyncHandler(async (req, res) => {
  const blogId = req.params.id;
  const blog = await findLiveBlog(blogId, '_id commentsCount');
  const pg = parsePagination(req.query, { defaultLimit: 10, maxLimit: 30 });
  const filter = { blog: blogId, parent: null };

  const [top, topTotal] = await Promise.all([
    Comment.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(pg.skip)
      .limit(pg.limit)
      .populate(populateParts)
      .lean(),
    Comment.countDocuments(filter),
  ]);

  const replies = top.length
    ? await Comment.find({ parent: { $in: top.map((c) => c._id) } })
        .sort({ createdAt: 1, _id: 1 })
        .limit(500)
        .populate(populateParts)
        .lean()
    : [];

  let liked = new Set();
  if (req.user) {
    const ids = [...top, ...replies].map((c) => c._id);
    const rows = await CommentLike.find({ user: req.user._id, comment: { $in: ids } }).select('comment').lean();
    liked = new Set(rows.map((r) => String(r.comment)));
  }
  const decorate = (c) => ({ ...c, liked: liked.has(String(c._id)) });

  const byParent = new Map();
  replies.forEach((r) => {
    const key = String(r.parent);
    byParent.set(key, [...(byParent.get(key) || []), decorate(r)]);
  });

  const comments = top.map((c) => ({ ...decorate(c), replies: byParent.get(String(c._id)) || [] }));
  sendSuccess(res, { comments, totalComments: blog.commentsCount }, 200, {
    pagination: buildPagination(pg, topTotal),
  });
});

// POST /api/blogs/:id/comments   body: { content, parentId? }
export const createComment = asyncHandler(async (req, res) => {
  const blogId = req.params.id;
  const blog = await findLiveBlog(blogId, '_id author title');
  const { content, parentId } = req.body;

  let parent = null;
  let replyTo = null;
  if (parentId) {
    const target = await Comment.findOne({ _id: parentId, blog: blogId }).select('parent author').lean();
    if (!target) throw ApiError.notFound('The comment you are replying to no longer exists');
    parent = target.parent || target._id; // replying to a reply attaches to the top-level comment
    replyTo = target.author;
  }

  const comment = await Comment.create({ blog: blogId, author: req.user._id, parent, replyTo, content });

  await Blog.updateOne({ _id: blogId }, { $inc: { commentsCount: 1 } });
  if (parent) await Comment.updateOne({ _id: parent }, { $inc: { repliesCount: 1 } });

  // Notifications (each call skips the sender automatically)
  const title = snippet(blog.title);
  const base = { sender: req.user._id, blog: blog._id, comment: comment._id };
  if (replyTo) {
    await notify({
      ...base, recipient: replyTo, type: 'reply',
      message: `${req.user.name} replied to your comment on "${title}"`,
    });
  }
  if (!replyTo || String(replyTo) !== String(blog.author)) {
    await notify({
      ...base, recipient: blog.author, type: 'comment',
      message: `${req.user.name} commented on your article "${title}"`,
    });
  }

  await comment.populate(populateParts);
  sendSuccess(res, { comment: { ...comment.toObject(), liked: false, replies: [] } }, 201);
});

// PUT /api/comments/:id  (author only)
export const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw ApiError.notFound('Comment not found');
  if (!comment.author.equals(req.user._id)) throw ApiError.forbidden('You can only edit your own comments');

  comment.content = req.body.content;
  comment.editedAt = new Date();
  await comment.save();
  await comment.populate(populateParts);
  sendSuccess(res, { comment });
});

// DELETE /api/comments/:id  (author or admin). Deleting a top-level comment removes its replies too.
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw ApiError.notFound('Comment not found');
  if (!comment.author.equals(req.user._id) && req.user.role !== 'admin') {
    throw ApiError.forbidden('You can only delete your own comments');
  }

  const replyIds = comment.parent ? [] : await Comment.find({ parent: comment._id }).distinct('_id');
  const ids = [comment._id, ...replyIds];

  await CommentLike.deleteMany({ comment: { $in: ids } });
  await Notification.deleteMany({ comment: { $in: ids } });
  const result = await Comment.deleteMany({ _id: { $in: ids } });

  await Blog.updateOne({ _id: comment.blog }, { $inc: { commentsCount: -result.deletedCount } });
  if (comment.parent) await Comment.updateOne({ _id: comment.parent }, { $inc: { repliesCount: -1 } });

  sendSuccess(res, { message: 'Comment deleted', removed: result.deletedCount });
});

// POST /api/comments/:id/like (idempotent)
export const likeComment = asyncHandler(async (req, res) => {
  const commentId = req.params.id;
  if (!(await Comment.exists({ _id: commentId }))) throw ApiError.notFound('Comment not found');

  try {
    await CommentLike.create({ user: req.user._id, comment: commentId });
    await Comment.updateOne({ _id: commentId }, { $inc: { likesCount: 1 } });
  } catch (err) {
    if (!isDuplicateKey(err)) throw err;
  }
  const fresh = await Comment.findById(commentId).select('likesCount').lean();
  sendSuccess(res, { liked: true, likesCount: fresh?.likesCount ?? 0 });
});

// DELETE /api/comments/:id/like
export const unlikeComment = asyncHandler(async (req, res) => {
  const commentId = req.params.id;
  const comment = await Comment.findById(commentId).select('likesCount').lean();
  if (!comment) throw ApiError.notFound('Comment not found');

  let likesCount = comment.likesCount;
  const result = await CommentLike.deleteOne({ user: req.user._id, comment: commentId });
  if (result.deletedCount === 1) {
    await Comment.updateOne({ _id: commentId }, { $inc: { likesCount: -1 } });
    likesCount -= 1;
  }
  sendSuccess(res, { liked: false, likesCount: Math.max(0, likesCount) });
});