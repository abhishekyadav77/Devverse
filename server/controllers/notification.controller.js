import Notification from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { parsePagination, buildPagination } from '../utils/pagination.js';

const unreadCountFor = (userId) => Notification.countDocuments({ recipient: userId, read: false });

// GET /api/notifications?page=&limit=
export const listNotifications = asyncHandler(async (req, res) => {
  const pg = parsePagination(req.query, { defaultLimit: 15 });
  const filter = { recipient: req.user._id };

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(pg.skip)
      .limit(pg.limit)
      .populate([
        { path: 'sender', select: 'name username avatar' },
        { path: 'blog', select: 'title slug' },
      ])
      .lean(),
    Notification.countDocuments(filter),
    unreadCountFor(req.user._id),
  ]);

  sendSuccess(res, { notifications, unreadCount }, 200, { pagination: buildPagination(pg, total) });
});

// GET /api/notifications/unread-count  (polled by the navbar bell)
export const getUnreadCount = asyncHandler(async (req, res) => {
  sendSuccess(res, { unreadCount: await unreadCountFor(req.user._id) });
});

// PATCH /api/notifications/:id/read  (only your own notifications)
export const markRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateOne({ _id: req.params.id, recipient: req.user._id }, { read: true });
  if (result.matchedCount === 0) throw ApiError.notFound('Notification not found');
  sendSuccess(res, { unreadCount: await unreadCountFor(req.user._id) });
});

// PATCH /api/notifications/read-all
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
  sendSuccess(res, { unreadCount: 0 });
});