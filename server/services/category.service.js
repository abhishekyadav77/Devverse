import Category from '../models/Category.js';
import { slugify } from '../utils/slugify.js';

const DEFAULTS = [
  'Technology', 'Web Development', 'AI & Machine Learning', 'Programming', 'Career',
  'College Life', 'Projects', 'Productivity', 'Open Source',
];

// Idempotent: only seeds when the collection is empty
export const ensureDefaultCategories = async () => {
  if ((await Category.estimatedDocumentCount()) > 0) return;
  await Category.insertMany(DEFAULTS.map((name) => ({ name, slug: slugify(name) })));
  console.log('Default categories created');
};