export const SORTS = {
  latest: { publishedAt: -1, _id: -1 },
  popular: { likesCount: -1, commentsCount: -1, views: -1, publishedAt: -1, _id: -1 },
  views: { views: -1, publishedAt: -1, _id: -1 },
};

// _id is the final tiebreaker so pages never overlap or skip items.
// hasOwn blocks keys like "__proto__" from reaching the sort.
export const resolveSort = (key) =>
  typeof key === 'string' && Object.hasOwn(SORTS, key) ? SORTS[key] : SORTS.latest;

export const populateCards = (query) =>
  query
    .populate([
      { path: 'author', select: 'name username avatar bio' },
      { path: 'category', select: 'name slug' },
      { path: 'tags', select: 'name slug' },
    ])
    .lean();