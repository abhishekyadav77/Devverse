import crypto from 'crypto';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import Bookmark from '../models/Bookmark.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import User from '../models/User.js';
import { purgeUsersAndContent } from '../services/maintenance.service.js';

// End-to-end check of the running API. Local use only: it creates throwaway accounts and deletes them at the end.
if (env.isProd) {
  console.error('Refusing to run the smoke test with NODE_ENV=production.');
  process.exit(1);
}
const BASE = (process.env.SMOKE_BASE_URL || `http://localhost:${env.port}`).replace(/\/+$/, '');
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) {
  console.error('The smoke test only runs against a local server (it cleans up through your local database).');
  process.exit(1);
}

let passed = 0;
let failed = 0;
const check = (name, ok, detail = '') => {
  if (ok) {
    passed += 1;
    console.log(`  ok    ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${name}${detail ? `  [${detail}]` : ''}`);
  }
};
const section = (title) => console.log(`\n${title}`);

// A tiny browser: keeps cookies between requests
class Client {
  constructor() {
    this.cookies = new Map();
  }

  async req(method, path, { body, csrf = true, origin = env.clientUrl } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (csrf) headers['X-Requested-With'] = 'XMLHttpRequest';
    if (origin) headers.Origin = origin;
    if (this.cookies.size) headers.Cookie = [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; ');

    const res = await fetch(BASE + path, {
      method, headers, redirect: 'manual', body: body === undefined ? undefined : JSON.stringify(body),
    });
    for (const line of res.headers.getSetCookie?.() ?? []) {
      const pair = line.split(';')[0];
      const i = pair.indexOf('=');
      const [name, value] = [pair.slice(0, i), pair.slice(i + 1)];
      if (value) this.cookies.set(name, value);
      else this.cookies.delete(name);
    }
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch { /* not JSON (robots.txt, sitemap, crawler page) */ }
    return { status: res.status, json, text };
  }
}

const SUFFIX = crypto.randomBytes(3).toString('hex');
const PASSWORD = 'SmokeTest123';
const account = (tag) => ({
  name: `Smoke ${tag.toUpperCase()}`,
  username: `smoke_${SUFFIX}${tag}`,
  email: `smoke_${SUFFIX}${tag}@demo.devverse.test`,
  password: PASSWORD,
});

async function run() {
  const guest = new Client();
  const a = new Client();
  const b = new Client();
  const accA = account('a');
  const accB = account('b');
  let r;

  section('Public endpoints');
  r = await guest.req('GET', '/api/health');
  check('health reports the database connected', r.status === 200 && r.json?.data?.database === 'connected', r.status);
  r = await guest.req('GET', '/robots.txt');
  check('robots.txt lists the sitemap', r.status === 200 && r.text.includes('Sitemap:'));
  r = await guest.req('GET', '/sitemap.xml');
  check('sitemap.xml is valid XML', r.status === 200 && r.text.includes('<urlset'));
  r = await guest.req('GET', '/api/home');
  check('home data loads', r.status === 200 && r.json?.success === true);

  section('Security');
  r = await guest.req('POST', '/api/auth/login', { body: { email: 'a@b.com', password: 'x' }, csrf: false });
  check('write without the CSRF header is blocked', r.status === 403, r.status);
  r = await guest.req('POST', '/api/auth/login', { body: { email: 'a@b.com', password: 'x' }, origin: 'https://evil.example' });
  check('write from a foreign origin is blocked', r.status === 403, r.status);
  r = await guest.req('POST', '/api/auth/login', { body: { email: { $gt: '' }, password: 'x' } });
  check('NoSQL operator in login is rejected', r.status === 400, r.status);
  r = await guest.req('GET', '/api/blogs?category[$ne]=x');
  check('operator in the query string does not crash the API', r.status === 200, r.status);
  r = await guest.req('GET', '/api/admin/stats');
  check('admin API rejects guests', r.status === 401, r.status);

  section('Accounts');
  r = await a.req('POST', '/api/auth/register', { body: accA });
  check('register account A', r.status === 201 && a.cookies.has('token'), r.status);
  const userAId = r.json?.data?.user?._id;
  r = await a.req('GET', '/api/auth/me');
  check('session works (/auth/me)', r.status === 200 && r.json?.data?.user?.username === accA.username);
  r = await b.req('POST', '/api/auth/register', { body: accB });
  check('register account B', r.status === 201, r.status);
  r = await guest.req('POST', '/api/auth/login', { body: { email: accA.email, password: 'WrongPass999' } });
  check('wrong password is rejected', r.status === 401, r.status);
  await a.req('POST', '/api/auth/logout');
  r = await a.req('GET', '/api/auth/me');
  check('logout ends the session', r.status === 401, r.status);
  r = await a.req('POST', '/api/auth/login', { body: { email: accA.email, password: PASSWORD } });
  check('login works again', r.status === 200, r.status);
  r = await a.req('GET', '/api/admin/stats');
  check('normal users cannot use the admin API', r.status === 403, r.status);

  section('Writing and publishing');
  r = await guest.req('GET', '/api/categories');
  const category = r.json?.data?.categories?.[0];
  check('categories exist', !!category);

  const draft = {
    title: 'Smoke test post for DevVerse',
    subtitle: 'Created by the automated smoke test',
    content: `<p>${'This is automated test content that is long enough to pass the publishing rules. '.repeat(3)}</p>`,
    coverImage: 'https://picsum.photos/seed/smoke/1600/900',
    category: category?._id,
    tags: ['Smoke Test'],
  };
  r = await a.req('POST', '/api/blogs', { body: draft });
  check('create a draft', r.status === 201 && r.json?.data?.blog?.status === 'draft', r.status);
  const blog = r.json?.data?.blog;
  const id = blog?._id;
  const slug = blog?.slug;

  r = await guest.req('GET', `/api/blogs/${slug}`);
  check('guests cannot see a draft', r.status === 404, r.status);
  r = await a.req('GET', `/api/blogs/${slug}`);
  check('the author can preview their draft', r.status === 200, r.status);

  r = await a.req('POST', '/api/blogs', { body: { title: 'Tiny' } });
  const incompleteId = r.json?.data?.blog?._id;
  r = await a.req('POST', `/api/blogs/${incompleteId}/publish`, { body: {} });
  check('an incomplete post cannot be published', r.status === 400, r.status);
  await a.req('DELETE', `/api/blogs/${incompleteId}`);

  r = await a.req('POST', `/api/blogs/${id}/publish`, { body: {} });
  check('publish the post', r.status === 200 && r.json?.data?.blog?.status === 'published', r.status);
  r = await guest.req('GET', `/api/blogs/${slug}`);
  check('guests can read the published post', r.status === 200 && r.json?.data?.blog?.title === draft.title, r.status);
  r = await guest.req('GET', `/api/blogs?author=${accA.username}`);
  check('author filter lists the post', r.json?.pagination?.total === 1, JSON.stringify(r.json?.pagination));
  r = await guest.req('GET', '/api/search?q=smoke');
  check('search finds the post', (r.json?.data?.blogs || []).some((x) => x.slug === slug), r.status);
  r = await guest.req('GET', `/seo/blog/${slug}`);
  check('crawler page has Open Graph and JSON-LD', r.status === 200 && r.text.includes('og:title') && r.text.includes('application/ld+json'), r.status);
  r = await guest.req('GET', '/seo/blog/no-such-article-xyz');
  check('crawler page 404s for unknown slugs', r.status === 404, r.status);

  section('Permissions');
  r = await b.req('PUT', `/api/blogs/${id}`, { body: draft });
  check("B cannot edit A's post", r.status === 403, r.status);
  r = await b.req('DELETE', `/api/blogs/${id}`);
  check("B cannot delete A's post", r.status === 403, r.status);
  r = await b.req('GET', `/api/blogs/manage/${id}`);
  check("B cannot open A's editor data", r.status === 403, r.status);

  section('Likes and bookmarks');
  for (let i = 0; i < 3; i += 1) r = await b.req('POST', `/api/blogs/${id}/like`);
  check('liking three times counts once', r.json?.data?.likesCount === 1, r.json?.data?.likesCount);
  r = await b.req('GET', `/api/blogs/${id}/like`);
  check('like state is remembered', r.json?.data?.liked === true);
  r = await guest.req('POST', `/api/blogs/${id}/like`);
  check('guests cannot like', r.status === 401, r.status);
  r = await b.req('DELETE', `/api/blogs/${id}/like`);
  check('unlike lowers the count to 0', r.json?.data?.likesCount === 0, r.json?.data?.likesCount);
  r = await b.req('POST', `/api/blogs/${id}/like`);
  check('like again gives 1', r.json?.data?.likesCount === 1);
  r = await a.req('GET', '/api/notifications?limit=50');
  const likeNotes = (r.json?.data?.notifications || []).filter((n) => n.type === 'like' && n.sender?.username === accB.username);
  check('like/unlike/like leaves exactly one notification', likeNotes.length === 1, likeNotes.length);

  r = await b.req('POST', `/api/blogs/${id}/bookmark`);
  check('bookmark the post', r.status === 200 && r.json?.data?.bookmarked === true, r.status);
  r = await b.req('GET', '/api/users/bookmarks/ids');
  check('bookmark id is listed', (r.json?.data?.ids || []).includes(id));
  r = await b.req('GET', '/api/users/bookmarks');
  check('bookmarks page returns the post', r.json?.data?.blogs?.length === 1);
  await b.req('DELETE', `/api/blogs/${id}/bookmark`);
  r = await b.req('GET', '/api/users/bookmarks/ids');
  check('bookmark can be removed', !(r.json?.data?.ids || []).includes(id));

  section('Comments');
  r = await b.req('POST', `/api/blogs/${id}/comments`, { body: { content: '   ' } });
  check('empty comment is rejected', r.status === 400, r.status);
  const nasty = 'Smoke comment <script>alert(1)</script>';
  r = await b.req('POST', `/api/blogs/${id}/comments`, { body: { content: nasty } });
  const top = r.json?.data?.comment;
  check('comment is created', r.status === 201, r.status);
  check('comment is stored as plain text', top?.content === nasty);
  r = await a.req('POST', `/api/blogs/${id}/comments`, { body: { content: 'Thanks for reading!', parentId: top?._id } });
  check('author can reply', r.status === 201 && !!r.json?.data?.comment?.parent, r.status);
  r = await guest.req('GET', `/api/blogs/${id}/comments`);
  check('replies are nested under their comment', r.json?.data?.comments?.[0]?.replies?.length === 1);
  check('total comment count is 2', r.json?.data?.totalComments === 2, r.json?.data?.totalComments);
  r = await b.req('GET', '/api/notifications?limit=50');
  check('B is notified of the reply', (r.json?.data?.notifications || []).some((n) => n.type === 'reply'));
  r = await a.req('DELETE', `/api/comments/${top?._id}`);
  check("A cannot delete B's comment", r.status === 403, r.status);
  r = await b.req('DELETE', `/api/comments/${top?._id}`);
  check('B deletes their comment and its reply', r.status === 200 && r.json?.data?.removed === 2, JSON.stringify(r.json?.data));
  r = await guest.req('GET', `/api/blogs/${slug}`);
  check('comment count returns to 0', r.json?.data?.blog?.commentsCount === 0, r.json?.data?.blog?.commentsCount);
  r = await b.req('GET', '/api/notifications?limit=50');
  check('comment notifications were cleaned up', !(r.json?.data?.notifications || []).some((n) => n.type === 'reply'));

  section('Follows');
  for (let i = 0; i < 2; i += 1) r = await b.req('POST', `/api/users/${userAId}/follow`);
  check('following twice counts once', r.json?.data?.followersCount === 1, r.json?.data?.followersCount);
  r = await a.req('POST', `/api/users/${userAId}/follow`);
  check('you cannot follow yourself', r.status === 400, r.status);
  r = await b.req('GET', `/api/users/${accA.username}`);
  check('author profile shows posts, followers and follow state',
    r.json?.data?.user?.postsCount === 1 && r.json?.data?.user?.followersCount === 1 && r.json?.data?.isFollowing === true);
  r = await b.req('DELETE', `/api/users/${userAId}/follow`);
  check('unfollow lowers followers to 0', r.json?.data?.followersCount === 0);

  section('Unpublish and delete');
  r = await a.req('POST', `/api/blogs/${id}/unpublish`);
  check('unpublish', r.status === 200, r.status);
  r = await guest.req('GET', `/api/blogs/${slug}`);
  check('an unpublished post disappears for guests', r.status === 404, r.status);
  await a.req('POST', `/api/blogs/${id}/publish`, { body: {} });
  await b.req('POST', `/api/blogs/${id}/comments`, { body: { content: 'This comment should vanish with the post.' } });
  r = await a.req('DELETE', `/api/blogs/${id}`);
  check('delete the post', r.status === 200, r.status);
  const [likesLeft, commentsLeft, bookmarksLeft] = await Promise.all([
    Like.countDocuments({ blog: id }), Comment.countDocuments({ blog: id }), Bookmark.countDocuments({ blog: id }),
  ]);
  check('likes, comments and bookmarks were deleted with the post', likesLeft + commentsLeft + bookmarksLeft === 0);
}

async function main() {
  try {
    await fetch(`${BASE}/api/health`);
  } catch {
    console.error(`Cannot reach ${BASE}. Start the API first:  npm run dev --prefix server`);
    process.exit(1);
  }

  await mongoose.connect(env.mongoUri);
  console.log(`Smoke test against ${BASE}`);
  try {
    await run();
  } catch (err) {
    failed += 1;
    console.error('\nThe test stopped on an unexpected error:', err);
  } finally {
    const ids = await User.find({ email: new RegExp(`^smoke_${SUFFIX}[ab]@demo\\.devverse\\.test$`) }).distinct('_id');
    await purgeUsersAndContent(ids);
    await mongoose.disconnect();
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
}

main();