import Blog from '../models/Blog.js';
import Like from '../models/Like.js';
import Bookmark from '../models/Bookmark.js';
import Comment from '../models/Comment.js';
import CommentLike from '../models/CommentLike.js';
import Notification from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';
import { liveFilter } from './blog.service.js';

// Engagement (likes, comments, bookmarks) is only allowed on publicly visible posts
export const findLiveBlog = async (id, select = '_id') => {
  const blog = await Blog.findOne({ _id: id, ...liveFilter() }).select(select).lean();
  if (!blog) throw ApiError.notFound('Article not found');
  return blog;
};

export const isDuplicateKey = (err) => err?.code === 11000;

// Removes everything attached to a blog. Call after deleting the blog.
export const deleteBlogDependents = async (blogId) => {
  const commentIds = await Comment.find({ blog: blogId }).distinct('_id');
  await Promise.all([
    Like.deleteMany({ blog: blogId }),
    Bookmark.deleteMany({ blog: blogId }),
    CommentLike.deleteMany({ comment: { $in: commentIds } }),
    Comment.deleteMany({ blog: blogId }),
    Notification.deleteMany({ blog: blogId }),
  ]);
};