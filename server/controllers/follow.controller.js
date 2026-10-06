import Follow from '../models/Follow.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { isDuplicateKey } from '../services/engagement.service.js';
import { notify, removeNotification } from '../services/notification.service.js';

// GET /api/users/:id/follow -> { following } for the current viewer (false for guests)
export const getFollowState = asyncHandler(async (req, res) => {
  const following = req.user
    ? !!(await Follow.exists({ follower: req.user._id, following: req.params.id }))
    : false;
  sendSuccess(res, { following });
});

// POST /api/users/:id/follow (idempotent)
export const followUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  if (req.user._id.equals(targetId)) throw ApiError.badRequest("You can't follow yourself");

  const target = await User.findOne({ _id: targetId, status: 'active' }).select('_id').lean();
  if (!target) throw ApiError.notFound('Author not found');

  try {
    await Follow.create({ follower: req.user._id, following: targetId });
    // Only reached when a NEW follow row was inserted
    await Promise.all([
      User.updateOne({ _id: targetId }, { $inc: { followersCount: 1 } }),
      User.updateOne({ _id: req.user._id }, { $inc: { followingCount: 1 } }),
    ]);
    await notify({
      recipient: targetId,
      sender: req.user._id,
      type: 'follow',
      message: `${req.user.name} started following you`,
    });
  } catch (err) {
    if (!isDuplicateKey(err)) throw err; // already following
  }

  const fresh = await User.findById(targetId).select('followersCount').lean();
  sendSuccess(res, { following: true, followersCount: fresh.followersCount });
});

// DELETE /api/users/:id/follow
export const unfollowUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const target = await User.findById(targetId).select('followersCount').lean();
  if (!target) throw ApiError.notFound('Author not found');

  let followersCount = target.followersCount;
  const result = await Follow.deleteOne({ follower: req.user._id, following: targetId });
  if (result.deletedCount === 1) {
    await Promise.all([
      User.updateOne({ _id: targetId }, { $inc: { followersCount: -1 } }),
      User.updateOne({ _id: req.user._id }, { $inc: { followingCount: -1 } }),
    ]);
    followersCount -= 1;
    await removeNotification({ recipient: targetId, sender: req.user._id, type: 'follow' });
  }
  sendSuccess(res, { following: false, followersCount: Math.max(0, followersCount) });
});