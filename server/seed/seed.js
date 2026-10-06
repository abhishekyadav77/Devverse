import mongoose from 'mongoose';
import { env } from '../config/env.js';
import Blog from '../models/Blog.js';
import Bookmark from '../models/Bookmark.js';
import Category from '../models/Category.js';
import Comment from '../models/Comment.js';
import DailyStat from '../models/DailyStat.js';
import Follow from '../models/Follow.js';
import Like from '../models/Like.js';
import User from '../models/User.js';
import { applyFields, assertPublishable, generateUniqueSlug } from '../services/blog.service.js';
import { purgeUsersAndContent, recountCounters } from '../services/maintenance.service.js';
import { slugify } from '../utils/slugify.js';
import { DEMO_EMAIL_PATTERN, DEMO_PASSWORD, POSTS, REPLIES, TOP_COMMENTS, USERS } from './seedData.js';

const DAY = 24 * 60 * 60 * 1000;

// Seeded random numbers: every run produces the same demo data
const mulberry32 = (seed) => () => {
  let s = (seed += 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const random = mulberry32(2026);
const pickOne = (list) => list[Math.floor(random() * list.length)];

async function main() {
  if (env.isProd) {
    console.error('Refusing to seed with NODE_ENV=production.');
    process.exit(1);
  }
  const force = process.argv.includes('--force');

  await mongoose.connect(env.mongoUri);
  console.log(`Seeding ${mongoose.connection.host}/${mongoose.connection.name}`);
  await Promise.all([Blog.init(), Like.init(), Bookmark.init(), Follow.init(), Comment.init()]);

  const realAccounts = await User.countDocuments({ email: { $not: DEMO_EMAIL_PATTERN } });
  if (realAccounts > 0 && !force) {
    console.error(`This database has ${realAccounts} non-demo account(s). The seed only adds and removes demo data,`);
    console.error('but if you are sure, run it again with --force:  npm run seed -- --force');
    process.exit(1);
  }

  // 1) Remove previous demo data (only accounts ending in @demo.devverse.test)
  const previous = await User.find({ email: DEMO_EMAIL_PATTERN }).distinct('_id');
  if (previous.length) {
    await purgeUsersAndContent(previous);
    console.log(`Removed previous demo data (${previous.length} accounts)`);
  }

  // 2) Categories (created if missing, never overwritten)
  const categoryIds = new Map();
  for (const name of new Set(POSTS.map((post) => post.category))) {
    const slug = slugify(name);
    const doc = await Category.findOneAndUpdate(
      { slug },
      { $setOnInsert: { name, slug, description: '' } },
      { upsert: true, new: true }
    );
    categoryIds.set(name, doc._id);
  }

  // 3) Users
  const users = [];
  const byUsername = new Map();
  for (const u of USERS) {
    const doc = await User.create({
      name: u.name,
      username: u.username,
      email: `${u.username}@demo.devverse.test`,
      password: DEMO_PASSWORD,
      bio: u.bio || '',
      website: u.website || '',
      github: u.github || '',
      role: u.role || 'user',
      createdAt: new Date(Date.now() - u.daysAgo * DAY),
    });
    users.push(doc);
    byUsername.set(u.username, doc);
  }

  // 4) Posts, published across the last four weeks
  const blogs = [];
  for (const [i, post] of POSTS.entries()) {
    const publishedAt = new Date(Date.now() - (27 - Math.round(i * 2.1)) * DAY - ((i * 7919) % 720) * 60000);
    const blog = new Blog({ author: byUsername.get(post.author)._id, slug: await generateUniqueSlug(post.title) });
    await applyFields(blog, {
      title: post.title,
      subtitle: post.subtitle,
      content: post.content,
      coverImage: `https://picsum.photos/seed/devverse-${i + 1}/1600/900`,
      category: categoryIds.get(post.category),
      tags: post.tags,
      seoTitle: '',
      seoDescription: '',
    });
    assertPublishable(blog);
    blog.status = 'published';
    blog.publishedAt = publishedAt;
    blog.createdAt = publishedAt;
    blog.modifiedAt = publishedAt;
    blog.views = 80 + Math.floor(random() * 1400);
    await blog.save();
    blogs.push(blog);
  }

  // 5) Likes, bookmarks and follows (rows only; counters are recalculated at the end)
  const likes = [];
  const bookmarks = [];
  for (const user of users) {
    for (const blog of blogs) {
      if (blog.author.equals(user._id)) continue;
      if (random() < 0.5) likes.push({ user: user._id, blog: blog._id });
      if (random() < 0.25) bookmarks.push({ user: user._id, blog: blog._id });
    }
  }
  const follows = [];
  const writers = users.filter((u) => u.role !== 'admin');
  for (const follower of writers) {
    for (const target of writers) {
      if (!follower._id.equals(target._id) && random() < 0.4) follows.push({ follower: follower._id, following: target._id });
    }
  }
  await Promise.all([
    Like.insertMany(likes, { ordered: false }),
    Bookmark.insertMany(bookmarks, { ordered: false }),
    Follow.insertMany(follows, { ordered: false }),
  ]);

  // 6) Comments with a few author replies
  let commentCount = 0;
  for (const [i, blog] of blogs.slice(0, 10).entries()) {
    const others = users.filter((u) => !u._id.equals(blog.author));
    const commenters = [pickOne(others)];
    commenters.push(pickOne(others.filter((u) => !u._id.equals(commenters[0]._id))));

    for (const [j, commenter] of commenters.entries()) {
      const when = (offsetHours) => new Date(Math.min(blog.publishedAt.getTime() + offsetHours * 3600000, Date.now() - 60000));
      const top = await Comment.create({
        blog: blog._id,
        author: commenter._id,
        content: TOP_COMMENTS[(i + j * 3) % TOP_COMMENTS.length],
        createdAt: when(3 + j * 9),
      });
      commentCount += 1;

      if (j === 0 && i % 2 === 0) {
        await Comment.create({
          blog: blog._id,
          author: blog.author,
          parent: top._id,
          replyTo: commenter._id,
          content: REPLIES[i % REPLIES.length],
          createdAt: when(5 + j * 9),
        });
        commentCount += 1;
      }
    }
  }

  // 7) Thirty days of view history so the analytics charts have something to show
  const stats = Array.from({ length: 30 }, (_, d) => ({
    updateOne: {
      filter: { date: new Date(Date.now() - d * DAY).toISOString().slice(0, 10) },
      update: { $setOnInsert: { views: 20 + Math.floor(random() * 100) } },
      upsert: true,
    },
  }));
  await DailyStat.bulkWrite(stats);

  // 8) Make every counter match the rows that were just created
  await recountCounters();

  console.log(`\nCreated ${users.length} accounts, ${blogs.length} posts, ${commentCount} comments, ${likes.length} likes, ${bookmarks.length} bookmarks, ${follows.length} follows.`);
  console.log(`\nDemo logins (password for all: ${DEMO_PASSWORD})`);
  users.forEach((u) => console.log(`  ${u.role === 'admin' ? 'admin ' : 'writer'}  ${u.email}`));
  console.log('\nThese are fake accounts for local development. Never seed a production database.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());