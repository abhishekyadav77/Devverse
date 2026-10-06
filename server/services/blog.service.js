import crypto from 'crypto';
import Blog from '../models/Blog.js';
import Category from '../models/Category.js';
import Tag from '../models/Tag.js';
import { ApiError } from '../utils/ApiError.js';
import { slugify } from '../utils/slugify.js';
import { sanitizeContent } from '../utils/sanitize.js';
import { textFromHtml, calcReadingTime } from '../utils/text.js';

// Slugs that would collide with static routes such as /api/blogs/mine
const RESERVED_SLUGS = new Set(['mine', 'manage']);

export const generateUniqueSlug = async (title, excludeId) => {
  const trimmed = (title || '').trim();
  const base = slugify(trimmed) || (trimmed ? 'post' : 'untitled');
  let slug = base;
  const taken = async (s) =>
    RESERVED_SLUGS.has(s) || (await Blog.exists({ slug: s, ...(excludeId && { _id: { $ne: excludeId } }) }));

  while (await taken(slug)) {
    slug = `${base.slice(0, 70)}-${crypto.randomBytes(3).toString('hex')}`;
  }
  return slug;
};

// Finds or creates tags from plain names; returns their ids
const resolveTags = async (names = []) => {
  const unique = new Map();
  names.forEach((name) => {
    const slug = slugify(name);
    if (slug && !unique.has(slug)) unique.set(slug, name.trim());
  });
  const tags = await Promise.all(
    [...unique].map(([slug, name]) =>
      Tag.findOneAndUpdate({ slug }, { $setOnInsert: { name, slug } }, { upsert: true, new: true })
    )
  );
  return tags.map((t) => t._id);
};

// Copies validated editor fields onto a blog document
export const applyFields = async (blog, data) => {
  if (data.category && !(await Category.exists({ _id: data.category }))) {
    throw ApiError.badRequest('The selected category does not exist');
  }

  const content = sanitizeContent(data.content);
  const text = textFromHtml(content);

  blog.title = data.title;
  blog.subtitle = data.subtitle;
  blog.content = content;
  blog.excerpt = data.subtitle || text.slice(0, 160);
  blog.readingTime = calcReadingTime(text);
  blog.coverImage = data.coverImage;
  blog.category = data.category;
  blog.tags = await resolveTags(data.tags);
  blog.seo = { title: data.seoTitle, description: data.seoDescription };
    blog.modifiedAt = new Date();
};

export const getPublishProblems = (blog) => {
  const problems = [];
  if ((blog.title || '').trim().length < 5) problems.push('Add a title (at least 5 characters)');
  if (textFromHtml(blog.content).length < 50) problems.push('Write at least a few sentences of content');
  if (!blog.category) problems.push('Choose a category');
  if (!blog.coverImage) problems.push('Add a cover image');
  return problems;
};

export const assertPublishable = (blog) => {
  const problems = getPublishProblems(blog);
  if (problems.length) throw ApiError.badRequest(problems.join('. '));
};

export const liveFilter = () => ({
  status: 'published',
  isHidden: false,
  publishedAt: { $lte: new Date() },
});