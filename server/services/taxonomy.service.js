import Blog from '../models/Blog.js';
import Category from '../models/Category.js';
import { liveFilter } from './blog.service.js';

// Every category with the number of live posts in it
export const categoriesWithCounts = async () => {
  const [categories, counts] = await Promise.all([
    Category.find().lean(),
    Blog.aggregate([{ $match: liveFilter() }, { $group: { _id: '$category', count: { $sum: 1 } } }]),
  ]);
  const byId = new Map(counts.map((c) => [String(c._id), c.count]));
  return categories.map((c) => ({ ...c, postCount: byId.get(String(c._id)) || 0 }));
};

export const popularTags = (limit = 20) =>
  Blog.aggregate([
    { $match: liveFilter() },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: limit },
    { $lookup: { from: 'tags', localField: '_id', foreignField: '_id', as: 'tag' } },
    { $unwind: '$tag' },
    { $project: { _id: '$tag._id', name: '$tag.name', slug: '$tag.slug', count: 1 } },
  ]);