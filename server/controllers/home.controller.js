import Blog from '../models/Blog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { liveFilter } from '../services/blog.service.js';
import { SORTS, populateCards } from '../services/listing.service.js';
import { categoriesWithCounts } from '../services/taxonomy.service.js';

const DAY = 24 * 60 * 60 * 1000;

const getPopularAuthors = (limit) =>
  Blog.aggregate([
    { $match: liveFilter() },
    { $group: { _id: '$author', posts: { $sum: 1 }, views: { $sum: '$views' } } },
    { $sort: { views: -1, posts: -1, _id: 1 } },
    { $limit: limit * 2 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'u' } },
    { $unwind: '$u' },
    { $match: { 'u.status': 'active' } },
    { $limit: limit },
    {
      $project: {
        _id: '$u._id', name: '$u.name', username: '$u.username', avatar: '$u.avatar', bio: '$u.bio', posts: 1,
      },
    },
  ]);

// GET /api/home: everything the home page needs in a single request
export const getHome = asyncHandler(async (req, res) => {
  const now = new Date();
  const live = liveFilter();
  const cards = (filter, sort, limit) =>
    populateCards(Blog.find(filter).select('-content').sort(sort).limit(limit));

  const [featuredList, categories, authors] = await Promise.all([
    cards(live, SORTS.popular, 1),
    categoriesWithCounts(),
    getPopularAuthors(6),
  ]);
  const featured = featuredList[0] || null;
  const excluded = featured ? [featured._id] : [];

  const [recent, latest] = await Promise.all([
    cards(
      { ...live, _id: { $nin: excluded }, publishedAt: { $gte: new Date(now - 30 * DAY), $lte: now } },
      SORTS.views,
      4
    ),
    cards({ ...live, _id: { $nin: excluded } }, SORTS.latest, 6),
  ]);

  // Trending: most-viewed in the last 30 days, topped up from all time
  let trending = recent;
  if (trending.length < 4) {
    const taken = [...excluded, ...trending.map((b) => b._id)];
    const filler = await cards({ ...live, _id: { $nin: taken } }, SORTS.views, 4 - trending.length);
    trending = [...trending, ...filler];
  }

  sendSuccess(res, {
    featured,
    trending,
    latest,
    categories: categories
      .sort((a, b) => b.postCount - a.postCount || a.name.localeCompare(b.name))
      .slice(0, 9),
    authors,
  });
});