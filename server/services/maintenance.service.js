import Blog from '../models/Blog.js';
import Bookmark from '../models/Bookmark.js';
import Comment from '../models/Comment.js';
import CommentLike from '../models/CommentLike.js';
import Follow from '../models/Follow.js';
import Like from '../models/Like.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { deleteBlogDependents } from './engagement.service.js';

const countBy = async (Model, field, match = {}) => {
  const rows = await Model.aggregate([{ $match: match }, { $group: { _id: `$${field}`, n: { $sum: 1 } } }]);
  return new Map(rows.map((r) => [String(r._id), r.n]));
};

// Rewrites a counter on every document whose stored value disagrees with the real number of rows
const syncField = async (Model, field, wanted) => {
  const docs = await Model.find({}).select(field).lean();
  const ops = [];
  docs.forEach((doc) => {
    const want = wanted.get(String(doc._id)) || 0;
    if ((doc[field] || 0) !== want) {
      ops.push({ updateOne: { filter: { _id: doc._id }, update: { $set: { [field]: want } } } });
    }
  });
  if (ops.length) await Model.bulkWrite(ops, { ordered: false, timestamps: false });
  return ops.length;
};

// The like/bookmark/comment/follow rows are the source of truth. Counters are a cache of them.
// Run this while the site is quiet: a like landing mid-run can be overwritten.
export const recountCounters = async () => {
  const [likes, comments, bookmarks, commentLikes, replies, followers, following] = await Promise.all([
    countBy(Like, 'blog'),
    countBy(Comment, 'blog'),
    countBy(Bookmark, 'blog'),
    countBy(CommentLike, 'comment'),
    countBy(Comment, 'parent', { parent: { $ne: null } }),
    countBy(Follow, 'following'),
    countBy(Follow, 'follower'),
  ]);

  return {
    'blog.likesCount': await syncField(Blog, 'likesCount', likes),
    'blog.commentsCount': await syncField(Blog, 'commentsCount', comments),
    'blog.bookmarksCount': await syncField(Blog, 'bookmarksCount', bookmarks),
    'comment.likesCount': await syncField(Comment, 'likesCount', commentLikes),
    'comment.repliesCount': await syncField(Comment, 'repliesCount', replies),
    'user.followersCount': await syncField(User, 'followersCount', followers),
    'user.followingCount': await syncField(User, 'followingCount', following),
  };
};

// Deletes accounts and everything they created or touched (used by the seed and smoke scripts)
export const purgeUsersAndContent = async (userIds) => {
  if (!userIds.length) return;

  const blogIds = await Blog.find({ author: { $in: userIds } }).distinct('_id');
  for (const id of blogIds) await deleteBlogDependents(id);
  await Blog.deleteMany({ _id: { $in: blogIds } });

  const ownComments = await Comment.find({ author: { $in: userIds } }).distinct('_id');
  await CommentLike.deleteMany({ $or: [{ user: { $in: userIds } }, { comment: { $in: ownComments } }] });
  await Notification.deleteMany({ comment: { $in: ownComments } });
  await Comment.deleteMany({ $or: [{ _id: { $in: ownComments } }, { parent: { $in: ownComments } }] });

  await Promise.all([
    Like.deleteMany({ user: { $in: userIds } }),
    Bookmark.deleteMany({ user: { $in: userIds } }),
    Follow.deleteMany({ $or: [{ follower: { $in: userIds } }, { following: { $in: userIds } }] }),
    Notification.deleteMany({ $or: [{ recipient: { $in: userIds } }, { sender: { $in: userIds } }] }),
  ]);
  await User.deleteMany({ _id: { $in: userIds } });

  await recountCounters(); // other people's counters may have included the deleted rows
};