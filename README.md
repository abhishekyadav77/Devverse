# DevVerse

**Write. Build. Share.** A full-stack blogging platform for developers, built with React, Express and MongoDB.

## Features

**Readers:** browse and search articles, categories, tags and author pages; read with comments; share links.
**Writers:** register, write in a rich editor (headings, lists, links, images, tables, code blocks, quotes), autosaved drafts, preview, scheduling, image uploads, like, bookmark, comment and reply, follow authors, notifications, a personal dashboard.
**Admins:** platform statistics and charts, user suspension, post hiding and deletion, comment moderation, category and tag management.
**Platform:** SEO (meta tags, canonical URLs, Open Graph, schema.org, sitemap, robots), dark mode, responsive layouts from 320px up, lazy-loaded routes and paginated APIs.

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 18, Vite, React Router, Tailwind CSS, Axios, React Hook Form, Framer Motion, Lucide, TipTap |
| Backend | Node.js 20+, Express, Mongoose, JWT (HTTP-only cookie), bcryptjs, Zod, Multer, Helmet |
| Data and media | MongoDB Atlas, Cloudinary |
| Hosting | Vercel (client), Render or Railway (API) |

## Screenshots

Add your own after running the seed script:

| Home | Article | Editor | Admin |
|---|---|---|---|
| `docs/screenshots/home.png` | `docs/screenshots/article.png` | `docs/screenshots/editor.png` | `docs/screenshots/admin.png` |

## Architecture

```
Browser (React SPA, Vercel)
   |  Axios, cookies
   v
Express API (Render/Railway)
   helmet > cors > compression > size limits > sanitize > rate limits > CSRF guard
   > routes > validators > controllers > services > models > error handler
   |-- MongoDB Atlas (Mongoose)
   '-- Cloudinary (image storage and CDN)
```

- **Auth:** a JWT in an HTTP-only, Secure cookie. `/auth/me` restores the session on load.
- **Authorization:** always enforced on the server (`protect`, `authorize('admin')`, ownership checks). The client's route guards are only for navigation.
- **Relationships:** likes, bookmarks, follows and comment likes are separate collections with unique indexes. Counters on posts and users are a cache of those rows and can be repaired with `npm run recount`.
- **Scheduling:** a scheduled post is `published` with a future `publishedAt`. Public queries only return posts whose date has passed, so no background worker is needed.
- **SEO for a single-page app:** the API serves a small HTML page per article (`/seo/blog/:slug`) and a Vercel rewrite sends only crawlers (by User-Agent) to it.

## Folder structure

```
devverse/
├── client/            React app
│   └── src/ components, pages, layouts, hooks, context, services, utils
├── server/
│   ├── config/  controllers/  middleware/  models/  routes/
│   ├── services/  validators/  utils/  scripts/  seed/  tests/
│   ├── app.js  server.js
├── render.yaml  .env.example  README.md  package.json
```

## Installation

Requires Node.js 20+ and a MongoDB database (Atlas free tier or local).

```bash
git clone <your-repo-url> devverse && cd devverse
npm run install:all
cp .env.example server/.env        # Windows: copy .env.example server\.env
```

Edit `server/.env`, then run `npm run dev`. Client: http://localhost:5173, API: http://localhost:5000/api/health

## Environment variables

**Server (`server/.env`)**

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | 32+ random characters (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `CLIENT_URL` | yes in production | Exact https site address, no trailing slash. Used for CORS, CSRF, canonical links and the sitemap |
| `NODE_ENV` | production | Set to `production` when deployed |
| `PORT` | no | Defaults to 5000 (hosts set it automatically) |
| `COOKIE_SAME_SITE` | no | `none` (default in production) or `lax` for same-parent-domain deployments |
| `CLOUDINARY_*` | for uploads | Cloud name, API key and API secret |
| `RESEND_API_KEY`, `EMAIL_FROM` | for password reset | Without them, reset emails fail in production |

**Client (`client/.env`)**: `VITE_API_URL` (e.g. `https://api.example.com/api`; empty in development) and `VITE_SITE_URL` (your public site address).

## Running locally

```bash
npm run dev            # client + server
npm run seed           # demo admin, writers, 12 posts, comments, likes, follows (never in production)
npm test               # unit tests (no database needed)
npm run smoke          # end-to-end API test against the running local server
npm run recount        # repair like/comment/bookmark/follower counters
npm run build          # production client build
```

Demo logins after seeding use password `DemoPass123`, for example `admin@demo.devverse.test`.
Promote any account to admin with `npm run make-admin --prefix server -- you@example.com`.

## API documentation

Base URL `/api`. Success: `{ "success": true, "data": ... }` (lists add `pagination`). Error: `{ "success": false, "message": "..." }`.
Lists accept `?page=&limit=`. Writes (POST, PUT, PATCH, DELETE) must send the header `X-Requested-With: XMLHttpRequest`.
Access: **Public**, **User** (logged in), **Admin**.

| Method and path | Access | Purpose |
|---|---|---|
| `POST /auth/register`, `/auth/login` | Public | Create account, log in (sets cookie) |
| `POST /auth/logout` | Public | Clear cookie |
| `GET /auth/me` | User | Current user |
| `POST /auth/forgot-password`, `/auth/reset-password` | Public | Password reset by email |
| `PUT /auth/change-password` | User | Change password |
| `GET /users/:username` | Public | Author profile, post count, follow state |
| `PUT /users/profile` | User | Update profile |
| `GET /users/bookmarks`, `/users/bookmarks/ids` | User | Saved articles |
| `GET /users/:id/follow` | Public | Am I following? |
| `POST`/`DELETE /users/:id/follow` | User | Follow, unfollow |
| `GET /blogs` | Public | Live posts. Filters: `category`, `tag`, `author`, `sort=latest\|popular\|views` |
| `GET /blogs/:slug` | Public | One article (drafts visible to owner/admin) |
| `GET /blogs/mine`, `/blogs/mine/stats`, `/blogs/manage/:id` | User | Own posts, stats, editor data |
| `POST /blogs`, `PUT`/`DELETE /blogs/:id` | User | Create, update, delete (owner or admin) |
| `POST /blogs/:id/publish`, `/blogs/:id/unpublish` | User | Publish (optionally scheduled), unpublish |
| `GET`/`POST`/`DELETE /blogs/:id/like` | Public / User | Like state, like, unlike |
| `POST`/`DELETE /blogs/:id/bookmark` | User | Save, unsave |
| `GET`/`POST /blogs/:id/comments` | Public / User | List with replies, add comment or reply |
| `PUT`/`DELETE /comments/:id` | User | Edit (author), delete (author or admin) |
| `POST`/`DELETE /comments/:id/like` | User | Like a comment |
| `GET /notifications`, `/notifications/unread-count` | User | Notifications |
| `PATCH /notifications/:id/read`, `/notifications/read-all` | User | Mark read |
| `GET /categories`, `/categories/:slug` | Public | Categories with post counts |
| `POST`/`PUT`/`DELETE /categories[/:id]` | Admin | Manage categories (`?reassignTo=` on delete) |
| `GET /tags`, `/tags/popular`, `/tags/:slug` | Public | Tags |
| `GET /search?q=&sort=` | Public | Search titles, content, tags, categories, authors |
| `GET /home` | Public | Everything the home page needs |
| `POST /newsletter` | Public | Subscribe |
| `POST /uploads/image?purpose=avatar\|cover\|content` | User | Upload image (5 MB, JPG/PNG/WebP/GIF) |
| `DELETE /uploads/avatar` | User | Remove profile photo |
| `GET /admin/stats`, `/admin/analytics?days=` | Admin | Statistics and chart data |
| `GET /admin/users`, `PATCH /admin/users/:id/suspend\|restore` | Admin | User moderation |
| `GET /admin/posts`, `PATCH /admin/posts/:id/hide\|restore`, `DELETE /admin/posts/:id` | Admin | Post moderation |
| `GET /admin/comments` | Admin | Comment list (delete via `DELETE /comments/:id`) |
| `GET`/`PUT`/`DELETE /admin/tags[/:id]` | Admin | Tag management |

Outside `/api`: `GET /sitemap.xml`, `GET /robots.txt`, `GET /seo/blog/:slug` (crawler page), and `GET /api/health`.

## Deployment

1. **MongoDB Atlas:** create a free cluster and a database user, allow network access, copy the connection string and add `/devverse` as the database name.
2. **Cloudinary:** copy the cloud name, API key and API secret.
3. **Resend:** verify your sending domain and create an API key.
4. **API on Render:** New > Blueprint (uses `render.yaml`) or a Web Service with root directory `server`, build `npm ci`, start `npm start`, health check `/api/health`. Set the environment variables above.
5. **Client on Vercel:** import the repo with root directory `client`. Set `VITE_API_URL` and `VITE_SITE_URL`. Replace `https://api.example.com` in `client/vercel.json` (4 places) with your API address.
6. **Domains:** use one parent domain (`www.example.com` for the site, `api.example.com` for the API), set `CLIENT_URL` to the site address and `COOKIE_SAME_SITE=lax`. Redeploy both.
7. **First admin:** register on the live site, then set that user's `role` to `admin` in Atlas (Browse Collections > users).

## Security

- Passwords hashed with bcrypt (12 rounds); login takes the same time for unknown and known emails
- JWT in an HTTP-only, Secure cookie; HS256 pinned; sessions invalidated when the password changes
- Server-side authorization on every protected route; ownership checks; suspended users blocked on every request
- Zod validation on all input; HTML sanitized on save (server) and on render (client)
- CSRF: custom header requirement plus Origin check; strict CORS to the site only
- Helmet, strict CSP and security headers (Vercel), rate limits (global, login per IP and per account, uploads, search, comments)
- MongoDB operator stripping, body size limits, upload validation by file signature, SVG blocked
- Secrets only in environment variables

## Future improvements

- Email verification on sign-up and a real newsletter sender with unsubscribe links
- Followers and following lists, an RSS feed, an archive action for posts
- Redis for view deduplication and rate limits when running more than one server
- OAuth login (GitHub, Google), two-factor authentication, account deletion and data export
- Automated browser tests (Playwright) and CI on every pull request
- Crawler pages for author, category and tag URLs