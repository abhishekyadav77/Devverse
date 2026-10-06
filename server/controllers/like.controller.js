import Blog from '../models/Blog.js';
import Like from '../models/Like.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { findLiveBlog, isDuplicateKey } from '../services/engagement.service.js';
import { notify, removeNotification, snippet } from '../services/notification.service.js';

// GET /api/blogs/:id/like  -> { liked } for the current viewer (false for guests)
export const getLikeState = asyncHandler(async (req, res) => {
  const liked = req.user ? !!(await Like.exists({ user: req.user._id, blog: req.params.id })) : false;
  sendSuccess(res, { liked });
});

// POST /api/blogs/:id/like  (idempotent: liking twice still counts once)
export const likeBlog = asyncHandler(async (req, res) => {
  const blogId = req.params.id;
  const blog = await findLiveBlog(blogId, '_id author title');

  try {
    await Like.create({ user: req.user._id, blog: blogId });
    // Only reached when a NEW like row was inserted
    await Blog.updateOne({ _id: blogId }, { $inc: { likesCount: 1 } });
    await notify({
      recipient: blog.author,
      sender: req.user._id,
      type: 'like',
      blog: blog._id,
      message: `${req.user.name} liked your article "${snippet(blog.title)}"`,
    });
  } catch (err) {
    if (!isDuplicateKey(err)) throw err; // already liked: nothing to change
  }

  const fresh = await Blog.findById(blogId).select('likesCount').lean();
  sendSuccess(res, { liked: true, likesCount: fresh.likesCount });
});

// DELETE /api/blogs/:id/like
export const unlikeBlog = asyncHandler(async (req, res) => {
  const blogId = req.params.id;
  const blog = await Blog.findById(blogId).select('likesCount author').lean();
  if (!blog) throw ApiError.notFound('Article not found');

  let likesCount = blog.likesCount;
  const result = await Like.deleteOne({ user: req.user._id, blog: blogId });
  if (result.deletedCount === 1) {
    await Blog.updateOne({ _id: blogId }, { $inc: { likesCount: -1 } });
    likesCount -= 1;
    await removeNotification({ recipient: blog.author, sender: req.user._id, type: 'like', blog: blog._id });
  }
  sendSuccess(res, { liked: false, likesCount: Math.max(0, likesCount) });
});