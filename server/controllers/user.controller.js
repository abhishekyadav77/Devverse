import User from '../models/User.js';
import Blog from '../models/Blog.js';
import Follow from '../models/Follow.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { liveFilter } from '../services/blog.service.js';

const PUBLIC_FIELDS = 'name username avatar bio website github linkedin followersCount followingCount createdAt';

// GET /api/users/:username -> { user (with postsCount), isFollowing }
export const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase(), status: 'active' }).select(PUBLIC_FIELDS);
  if (!user) throw ApiError.notFound('Author not found');

  const [postsCount, follow] = await Promise.all([
    Blog.countDocuments({ ...liveFilter(), author: user._id }),
    req.user ? Follow.exists({ follower: req.user._id, following: user._id }) : null,
  ]);

  sendSuccess(res, { user: { ...user.toObject(), postsCount }, isFollowing: !!follow });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, username, bio, website, github, linkedin } = req.body;

  if (username !== req.user.username && (await User.exists({ username }))) {
    throw new ApiError(409, 'That username is already taken');
  }

  Object.assign(req.user, { name, username, bio, website, github, linkedin });
  await req.user.save();
  sendSuccess(res, { user: req.user });
});