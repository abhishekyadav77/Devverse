import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import Blog from '../models/Blog.js';
import User from '../models/User.js';
import { recountCounters } from '../services/maintenance.service.js';

const [command, ...flags] = process.argv.slice(2);
const apply = flags.includes('--apply');

// Matches the ids our upload service creates: devverse/posts/<userId>-<12 hex>
const ID_PATTERN = /devverse\/(?:posts|avatars)\/[a-f0-9]{24}-[a-f0-9]{12}/g;
const MIN_AGE_MS = 24 * 60 * 60 * 1000; // never touch files uploaded in the last day (editors may still be open)

async function orphanImages() {
  if (!isCloudinaryConfigured) throw new Error('Cloudinary is not configured');

  const referenced = new Set();
  const scan = (text = '') => {
    for (const match of String(text).matchAll(ID_PATTERN)) referenced.add(match[0]);
  };
  for await (const blog of Blog.find({}).select('content coverImage').lean().cursor()) {
    scan(blog.content);
    scan(blog.coverImage);
  }
  for await (const user of User.find({ avatar: { $ne: '' } }).select('avatar').lean().cursor()) scan(user.avatar);

  const orphans = [];
  let total = 0;
  let cursor;
  do {
    const page = await cloudinary.api.resources({
      type: 'upload', resource_type: 'image', prefix: 'devverse/', max_results: 500, next_cursor: cursor,
    });
    page.resources.forEach((r) => {
      total += 1;
      if (!referenced.has(r.public_id) && Date.now() - new Date(r.created_at).getTime() > MIN_AGE_MS) orphans.push(r);
    });
    cursor = page.next_cursor;
  } while (cursor);

  const bytes = orphans.reduce((sum, r) => sum + (r.bytes || 0), 0);
  console.log(`${total} images in Cloudinary, ${referenced.size} referenced, ${orphans.length} unreferenced (${(bytes / 1048576).toFixed(1)} MB)`);
  orphans.slice(0, 20).forEach((r) => console.log(`  ${r.public_id}`));
  if (orphans.length > 20) console.log(`  ...and ${orphans.length - 20} more`);

  if (!apply) {
    console.log('\nDry run. Nothing was deleted. Re-run with --apply to delete these files.');
    return;
  }
  for (let i = 0; i < orphans.length; i += 100) {
    await cloudinary.api.delete_resources(orphans.slice(i, i + 100).map((r) => r.public_id), { resource_type: 'image', type: 'upload' });
  }
  console.log(`\nDeleted ${orphans.length} files.`);
}

async function main() {
  await mongoose.connect(env.mongoUri);

  if (command === 'recount') {
    const report = await recountCounters();
    console.log('Counters corrected:');
    Object.entries(report).forEach(([field, fixed]) => console.log(`  ${field}: ${fixed}`));
  } else if (command === 'orphan-images') {
    await orphanImages();
  } else {
    console.log('Usage:\n  npm run recount\n  npm run orphan-images            (dry run)\n  npm run orphan-images -- --apply (delete)');
  }
}

main()
  .catch((err) => {
    console.error('Failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());